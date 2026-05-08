import type { Edge, Group, Node } from '../../../../types/graph/models';
import type {
  OntologyField,
  OntologyFieldCategory,
  OntologyNodeType,
} from '../../../../domain/ontology';

export type EditableGraphNode = Node | Group;

export type EdgeDirection = NonNullable<NonNullable<Edge['data']>['direction']>;

export interface EdgeEditorDraft {
  label: string;
  color: string;
  strokeWidth: number;
  strokeDasharray: string;
  weight: number;
  strength: number;
  direction: EdgeDirection;
  customPropertiesText: string;
}

export interface NodeEditorDraft {
  title: string;
  content: string;
  groupId: string;
  summary: string;
  tags: string;
  attributes: Record<string, unknown>;
}

export interface AttributeItem {
  key: string;
  value: string;
}

export type CustomPropertiesParseResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

const ONTOLOGY_NODE_TYPES: Record<string, OntologyNodeType> = {
  class: 'Class',
  concept: 'Concept',
  function: 'Function',
  component: 'Component',
  information: 'Information',
  interface: 'Interface',
  constraint: 'Constraint',
};

const FIELD_CATEGORIES: Record<string, OntologyFieldCategory> = {
  attribute: 'attribute',
  field: 'attribute',
  rule: 'rule',
  constraint: 'constraint',
  interface: 'interface',
  behavior: 'behavior',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStableString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  return JSON.stringify(value);
};

const toDataType = (value: unknown): string => {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  return typeof value;
};

const normalizeOntologyNodeType = (value: unknown): OntologyNodeType => {
  if (typeof value !== 'string') {
    return 'Class';
  }

  return ONTOLOGY_NODE_TYPES[value.trim().toLowerCase()] ?? 'Class';
};

const normalizeFieldCategory = (value: unknown): OntologyFieldCategory => {
  if (typeof value !== 'string') {
    return 'attribute';
  }

  return FIELD_CATEGORIES[value.trim().toLowerCase()] ?? 'attribute';
};

export const createEdgeEditorDraft = (edge?: Edge | null): EdgeEditorDraft => {
  const customProperties = edge?.data?.customProperties ?? {};
  const relation = edge?.data?.customProperties?.relation;
  const relationship = edge?.data?.customProperties?.relationship;

  return {
    label: edge?.label ||
      (typeof relation === 'string' ? relation : '') ||
      (typeof relationship === 'string' ? relationship : ''),
    color: edge?.data?.color || '#000000',
    strokeWidth: edge?.data?.strokeWidth || 1,
    strokeDasharray: edge?.data?.strokeDasharray || '',
    weight: edge?.data?.weight || 1,
    strength: edge?.data?.strength || 1,
    direction: edge?.data?.direction || 'unidirectional',
    customPropertiesText: JSON.stringify(customProperties, null, 2),
  };
};

export const parseCustomPropertiesText = (text: string): CustomPropertiesParseResult => {
  const trimmed = text.trim();

  if (!trimmed) {
    return { ok: true, value: {} };
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        ok: false,
        error: '自定义属性必须是 JSON 对象',
      };
    }

    return {
      ok: true,
      value: parsed as Record<string, unknown>,
    };
  } catch {
    return {
      ok: false,
      error: '自定义属性不是合法 JSON',
    };
  }
};

export const buildEdgeUpdate = (
  edge: Edge,
  draft: EdgeEditorDraft,
  customProperties: Record<string, unknown>
): Partial<Edge> => ({
  label: draft.label,
  data: {
    ...edge.data,
    color: draft.color,
    strokeWidth: draft.strokeWidth,
    strokeDasharray: draft.strokeDasharray,
    weight: draft.weight,
    strength: draft.strength,
    direction: draft.direction,
    customProperties: {
      ...(edge.data?.customProperties ?? {}),
      ...customProperties,
      relation: draft.label,
      relationship: draft.label,
    },
  },
});

export const createNodeEditorDraft = (node?: EditableGraphNode | null): NodeEditorDraft => ({
  title: node?.title || '',
  content: node?.content || '',
  groupId: node?.groupId || '',
  summary: node?.summary || '',
  tags: node?.tags?.join(', ') || '',
  attributes: node?.attributes || {},
});

export const parseTagsText = (tags: string): string[] => (
  tags
    ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
    : []
);

export const buildNodeValidationCandidate = (
  node: EditableGraphNode,
  draft: NodeEditorDraft
): Node => ({
  ...(node as Node),
  title: draft.title,
  content: draft.content,
  summary: draft.summary,
  tags: parseTagsText(draft.tags),
  attributes: draft.attributes,
  groupId: draft.groupId || undefined,
});

export const buildNodeUpdate = (draft: NodeEditorDraft): Partial<EditableGraphNode> => ({
  title: draft.title,
  content: draft.content,
  summary: draft.summary,
  tags: parseTagsText(draft.tags),
  attributes: draft.attributes,
  validationError: undefined,
});

export const buildOntologyNodeType = (
  attributes: Record<string, unknown>
): OntologyNodeType => normalizeOntologyNodeType(
  attributes.ontologyType ?? attributes.nodeType ?? attributes.kind
);

export const buildOntologyFieldsFromAttributes = (
  nodeId: string,
  attributes: Record<string, unknown>
): OntologyField[] => (
  Object.entries(attributes)
    .filter(([name]) => ![
      'ontologyType',
      'ontologyNodeId',
      'ontologyDomainId',
      'nodeType',
      'kind',
    ].includes(name))
    .map(([name, value]) => {
      const fieldRecord = isRecord(value) ? value : undefined;
      const fieldValue = fieldRecord?.value ?? value;

      return {
        id: `${nodeId}:field:${name}`,
        name,
        value: toStableString(fieldValue),
        dataType: typeof fieldRecord?.dataType === 'string'
          ? fieldRecord.dataType
          : toDataType(fieldValue),
        category: normalizeFieldCategory(fieldRecord?.category),
      };
    })
);

export const createAttributeItems = (attributes: Record<string, unknown>): AttributeItem[] => (
  Object.entries(attributes).map(([key, value]) => ({
    key,
    value: typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value),
  }))
);

export const buildAttributesFromItems = (
  items: AttributeItem[]
): Record<string, unknown> => {
  const nextAttributes: Record<string, unknown> = {};

  items.forEach((item) => {
    if (!item.key) {
      return;
    }

    try {
      nextAttributes[item.key] = JSON.parse(item.value);
    } catch {
      nextAttributes[item.key] = item.value;
    }
  });

  return nextAttributes;
};

export const serializeAttributes = (attributes: Record<string, unknown>): string => {
  try {
    return JSON.stringify(attributes);
  } catch {
    return '';
  }
};
