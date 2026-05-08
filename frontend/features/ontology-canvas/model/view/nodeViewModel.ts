import type {
  OntologyDocumentState,
} from '../document/ontologyDocument';
import type {
  OntologyEdge,
  OntologyField,
  OntologyFieldCategory,
  OntologyGraph,
  OntologyNode,
  OntologyNodeType,
} from '@/domain/ontology';

export type OntologyNodeViewSectionKind =
  | 'fields'
  | 'methods'
  | 'rules'
  | 'interfaces'
  | 'relationships';

export type OntologyNodeViewTone =
  | 'field'
  | 'method'
  | 'rule'
  | 'interface'
  | 'relationship'
  | 'subcanvas';

export type OntologyNodeViewItem = {
  id: string;
  name: string;
  value?: string;
  dataType?: string;
  category?: OntologyFieldCategory | 'relationship';
  iconLabel?: string;
  tone: OntologyNodeViewTone;
};

export type OntologyNodeViewSection = {
  id: OntologyNodeViewSectionKind;
  title: string;
  metricLabel: string;
  emptyLabel: string;
  items: OntologyNodeViewItem[];
};

export type OntologyNodeViewMetric = {
  id: string;
  label: string;
  value: number;
  iconLabel: string;
  tone: OntologyNodeViewTone;
};

export type OntologyNodeViewCounts = {
  fields: number;
  methods: number;
  rules: number;
  interfaces: number;
  relationships: number;
  childNodes: number;
};

export type OntologyNodeViewModel = {
  id: string;
  title: string;
  type: OntologyNodeType | string;
  description?: string;
  tags: string[];
  sections: OntologyNodeViewSection[];
  metrics: OntologyNodeViewMetric[];
  counts: OntologyNodeViewCounts;
  hasSubcanvas: boolean;
  subcanvasLabel?: string;
};

type FieldSectionDefinition = {
  id: Exclude<OntologyNodeViewSectionKind, 'relationships'>;
  title: string;
  emptyLabel: string;
  categories: OntologyFieldCategory[];
  iconLabel: string;
  tone: OntologyNodeViewTone;
};

const FIELD_SECTION_DEFINITIONS: FieldSectionDefinition[] = [
  {
    id: 'fields',
    title: 'Fields',
    emptyLabel: 'No fields yet',
    categories: ['attribute'],
    iconLabel: 'P',
    tone: 'field',
  },
  {
    id: 'methods',
    title: 'Methods',
    emptyLabel: 'No methods yet',
    categories: ['behavior'],
    iconLabel: 'M',
    tone: 'method',
  },
  {
    id: 'rules',
    title: 'Rules',
    emptyLabel: 'No rules yet',
    categories: ['rule', 'constraint'],
    iconLabel: 'R',
    tone: 'rule',
  },
  {
    id: 'interfaces',
    title: 'Interfaces',
    emptyLabel: 'No interfaces yet',
    categories: ['interface'],
    iconLabel: 'I',
    tone: 'interface',
  },
];

const getFieldsByCategory = (
  fields: readonly OntologyField[],
  categories: readonly OntologyFieldCategory[]
): OntologyField[] => {
  const categorySet = new Set(categories);
  return fields.filter(field => categorySet.has(field.category));
};

const toFieldViewItem = (
  field: OntologyField,
  definition: FieldSectionDefinition
): OntologyNodeViewItem => ({
  id: field.id,
  name: field.name,
  value: field.value,
  dataType: field.dataType,
  category: field.category,
  iconLabel: definition.iconLabel,
  tone: definition.tone,
});

const getIncidentEdges = (
  graph: OntologyGraph,
  nodeId: string
): OntologyEdge[] => {
  return Object.values(graph.edges)
    .filter(edge => edge.source === nodeId || edge.target === nodeId);
};

const getRelationshipDirectionLabel = (
  edge: OntologyEdge,
  nodeId: string
): string => {
  if (edge.direction === 'bidirectional') {
    return 'both';
  }

  if (edge.direction === 'undirected') {
    return 'link';
  }

  return edge.source === nodeId ? 'out' : 'in';
};

const toRelationshipViewItem = (
  graph: OntologyGraph,
  nodeId: string,
  edge: OntologyEdge
): OntologyNodeViewItem => {
  const otherNodeId = edge.source === nodeId ? edge.target : edge.source;
  const otherNode = graph.nodes[otherNodeId];

  return {
    id: edge.id,
    name: edge.relation,
    value: otherNode?.name ?? otherNodeId,
    dataType: getRelationshipDirectionLabel(edge, nodeId),
    category: 'relationship',
    iconLabel: 'L',
    tone: 'relationship',
  };
};

const getSubcanvasChildCount = (
  graph: OntologyGraph,
  node: OntologyNode
): number => {
  if (!node.subgraphId) {
    return 0;
  }

  const subgraph = graph.subgraphs[node.subgraphId];
  if (!subgraph) {
    return 0;
  }

  return subgraph.nodeIds.filter(childNodeId => childNodeId !== node.id).length;
};

const createFieldSections = (
  node: OntologyNode
): OntologyNodeViewSection[] => {
  return FIELD_SECTION_DEFINITIONS.map((definition) => {
    const items = getFieldsByCategory(node.fields, definition.categories)
      .map(field => toFieldViewItem(field, definition));

    return {
      id: definition.id,
      title: definition.title,
      metricLabel: String(items.length),
      emptyLabel: definition.emptyLabel,
      items,
    };
  });
};

const createRelationshipSection = (
  graph: OntologyGraph,
  nodeId: string,
  incidentEdges: readonly OntologyEdge[]
): OntologyNodeViewSection | null => {
  if (incidentEdges.length === 0) {
    return null;
  }

  const items = incidentEdges.map(edge => toRelationshipViewItem(graph, nodeId, edge));

  return {
    id: 'relationships',
    title: 'Relationships',
    metricLabel: String(items.length),
    emptyLabel: 'No relationships yet',
    items,
  };
};

const createMetrics = (
  counts: OntologyNodeViewCounts
): OntologyNodeViewMetric[] => {
  const metrics: OntologyNodeViewMetric[] = [
    {
      id: 'fields',
      label: 'Fields',
      value: counts.fields,
      iconLabel: 'P',
      tone: 'field',
    },
    {
      id: 'methods',
      label: 'Methods',
      value: counts.methods,
      iconLabel: 'M',
      tone: 'method',
    },
    {
      id: 'children',
      label: 'Child Nodes',
      value: counts.childNodes,
      iconLabel: 'S',
      tone: 'subcanvas',
    },
    {
      id: 'relationships',
      label: 'Relations',
      value: counts.relationships,
      iconLabel: 'L',
      tone: 'relationship',
    },
  ];

  if (counts.rules > 0) {
    metrics.push({
      id: 'rules',
      label: 'Rules',
      value: counts.rules,
      iconLabel: 'R',
      tone: 'rule',
    });
  }

  if (counts.interfaces > 0) {
    metrics.push({
      id: 'interfaces',
      label: 'Interfaces',
      value: counts.interfaces,
      iconLabel: 'I',
      tone: 'interface',
    });
  }

  return metrics;
};

export const buildOntologyNodeViewModel = (
  document: OntologyDocumentState,
  nodeId: string
): OntologyNodeViewModel | undefined => {
  const node = document.graph.nodes[nodeId];
  if (!node) {
    return undefined;
  }

  const incidentEdges = getIncidentEdges(document.graph, node.id);
  const childNodeCount = getSubcanvasChildCount(document.graph, node);
  const fieldSections = createFieldSections(node);
  const relationshipSection = createRelationshipSection(
    document.graph,
    node.id,
    incidentEdges
  );
  const sections = relationshipSection
    ? [...fieldSections, relationshipSection]
    : fieldSections;
  const counts: OntologyNodeViewCounts = {
    fields: getFieldsByCategory(node.fields, ['attribute']).length,
    methods: getFieldsByCategory(node.fields, ['behavior']).length,
    rules: getFieldsByCategory(node.fields, ['rule', 'constraint']).length,
    interfaces: getFieldsByCategory(node.fields, ['interface']).length,
    relationships: incidentEdges.length,
    childNodes: childNodeCount,
  };

  return {
    id: node.id,
    title: node.name,
    type: node.type,
    description: node.description,
    tags: [...node.tags],
    sections,
    metrics: createMetrics(counts),
    counts,
    hasSubcanvas: Boolean(node.subgraphId),
    subcanvasLabel: node.subgraphId
      ? document.graph.subgraphs[node.subgraphId]?.name ?? 'Internal canvas'
      : undefined,
  };
};
