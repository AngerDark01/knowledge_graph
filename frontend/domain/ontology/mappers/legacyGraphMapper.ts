import { createOntologyGraph } from '../model/graph';
import type { OntologyDomain } from '../model/domain';
import type { OntologyEdge, OntologyRelationDirection } from '../model/edge';
import type {
  OntologyField,
  OntologyFieldCategory,
  OntologyGraph,
  OntologyNode,
  OntologyNodeType,
} from '../model';
import type { OntologySubgraph } from '../model/subgraph';

export type LegacyGraphBlockType = 'node' | 'group';

export type LegacyGraphBlock = {
  id: string;
  type: LegacyGraphBlockType;
  title?: string;
  content?: string;
  attributes?: Record<string, unknown>;
  tags?: string[];
  summary?: string;
  groupId?: string;
  collapsed?: boolean;
  nodeIds?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type LegacyGraphEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  groupId?: string;
  data?: Record<string, unknown>;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type LegacyGraphInput = {
  id: string;
  name: string;
  nodes: LegacyGraphBlock[];
  edges: LegacyGraphEdge[];
};

const NODE_TYPE_ALIASES: Record<string, OntologyNodeType> = {
  class: 'Class',
  concept: 'Concept',
  function: 'Function',
  component: 'Component',
  information: 'Information',
  interface: 'Interface',
  constraint: 'Constraint',
};

const FIELD_CATEGORY_ALIASES: Record<string, OntologyFieldCategory> = {
  attribute: 'attribute',
  field: 'attribute',
  rule: 'rule',
  constraint: 'constraint',
  interface: 'interface',
  behavior: 'behavior',
};

const DIRECTION_ALIASES: Record<string, OntologyRelationDirection> = {
  unidirectional: 'unidirectional',
  bidirectional: 'bidirectional',
  undirected: 'undirected',
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

const normalizeNodeType = (attributes?: Record<string, unknown>): OntologyNodeType => {
  const rawType = attributes?.ontologyType ?? attributes?.nodeType ?? attributes?.kind;
  if (typeof rawType !== 'string') {
    return 'Concept';
  }

  return NODE_TYPE_ALIASES[rawType.trim().toLowerCase()] ?? 'Concept';
};

const normalizeFieldCategory = (value: unknown): OntologyFieldCategory => {
  if (typeof value !== 'string') {
    return 'attribute';
  }

  return FIELD_CATEGORY_ALIASES[value.trim().toLowerCase()] ?? 'attribute';
};

const normalizeDirection = (value: unknown): OntologyRelationDirection => {
  if (typeof value !== 'string') {
    return 'unidirectional';
  }

  return DIRECTION_ALIASES[value.trim().toLowerCase()] ?? 'unidirectional';
};

const mapAttributesToFields = (
  nodeId: string,
  attributes?: Record<string, unknown>
): OntologyField[] => {
  if (!attributes) {
    return [];
  }

  return Object.entries(attributes)
    .filter(([name]) => !['ontologyType', 'nodeType', 'kind'].includes(name))
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
    });
};

const mapLegacyNode = (node: LegacyGraphBlock): OntologyNode => ({
  id: node.id,
  name: node.title?.trim() || node.id,
  type: normalizeNodeType(node.attributes),
  description: node.summary || node.content,
  fields: mapAttributesToFields(node.id, node.attributes),
  tags: node.tags ?? [],
  domainId: node.groupId,
  metadata: {
    legacyType: node.type,
    createdAt: toStableString(node.createdAt),
    updatedAt: toStableString(node.updatedAt),
  },
});

const mapLegacyGroup = (group: LegacyGraphBlock): OntologyDomain => ({
  id: group.id,
  name: group.title?.trim() || group.id,
  nodeIds: [],
  domainIds: [],
  parentDomainId: group.groupId,
  collapsed: group.collapsed ?? false,
  metadata: {
    legacyType: group.type,
    summary: group.summary,
    createdAt: toStableString(group.createdAt),
    updatedAt: toStableString(group.updatedAt),
  },
});

const getRelationName = (edge: LegacyGraphEdge): string => {
  if (edge.label?.trim()) {
    return edge.label.trim();
  }

  const relation = edge.data?.relation ?? edge.data?.relationship;
  if (typeof relation === 'string' && relation.trim()) {
    return relation.trim();
  }

  const customProperties = edge.data?.customProperties;
  if (isRecord(customProperties)) {
    const customRelation = customProperties.relation ?? customProperties.relationship;
    if (typeof customRelation === 'string' && customRelation.trim()) {
      return customRelation.trim();
    }
  }

  return 'relatedTo';
};

const resolveEdgeDomainId = (
  edge: LegacyGraphEdge,
  nodes: Record<string, OntologyNode>,
  domains: Record<string, OntologyDomain>
): string | undefined => {
  if (edge.groupId && domains[edge.groupId]) {
    return edge.groupId;
  }

  const sourceDomainId = nodes[edge.source]?.domainId;
  const targetDomainId = nodes[edge.target]?.domainId;

  if (sourceDomainId && sourceDomainId === targetDomainId) {
    return sourceDomainId;
  }

  return undefined;
};

const mapLegacyEdge = (
  edge: LegacyGraphEdge,
  nodes: Record<string, OntologyNode>,
  domains: Record<string, OntologyDomain>
): OntologyEdge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  relation: getRelationName(edge),
  direction: normalizeDirection(edge.data?.direction),
  domainId: resolveEdgeDomainId(edge, nodes, domains),
  metadata: {
    createdAt: toStableString(edge.createdAt),
    updatedAt: toStableString(edge.updatedAt),
  },
});

const attachDomainMembership = (
  legacyBlocks: readonly LegacyGraphBlock[],
  nodes: Record<string, OntologyNode>,
  domains: Record<string, OntologyDomain>
): void => {
  for (const legacyBlock of legacyBlocks) {
    if (legacyBlock.type !== 'group') {
      continue;
    }

    const domain = domains[legacyBlock.id];
    if (!domain) {
      continue;
    }

    for (const childId of legacyBlock.nodeIds ?? []) {
      if (nodes[childId]) {
        domain.nodeIds.push(childId);
      }

      if (domains[childId]) {
        domain.domainIds.push(childId);
      }
    }
  }
};

const createRootSubgraph = (
  graphId: string,
  nodes: Record<string, OntologyNode>,
  edges: Record<string, OntologyEdge>
): OntologySubgraph => ({
  id: `${graphId}:root`,
  name: 'Root',
  nodeIds: Object.keys(nodes),
  edgeIds: Object.keys(edges),
});

export const mapLegacyGraphToOntologyGraph = (
  input: LegacyGraphInput
): OntologyGraph => {
  const nodes: Record<string, OntologyNode> = {};
  const domains: Record<string, OntologyDomain> = {};

  for (const legacyBlock of input.nodes) {
    if (legacyBlock.type === 'group') {
      domains[legacyBlock.id] = mapLegacyGroup(legacyBlock);
      continue;
    }

    nodes[legacyBlock.id] = mapLegacyNode(legacyBlock);
  }

  attachDomainMembership(input.nodes, nodes, domains);

  const edges = Object.fromEntries(
    input.edges.map(edge => [
      edge.id,
      mapLegacyEdge(edge, nodes, domains),
    ])
  );

  const rootSubgraph = createRootSubgraph(input.id, nodes, edges);

  return createOntologyGraph({
    id: input.id,
    name: input.name,
    nodes,
    edges,
    domains,
    subgraphs: {
      [rootSubgraph.id]: rootSubgraph,
    },
    metadata: {
      source: 'legacy-graph',
    },
  });
};
