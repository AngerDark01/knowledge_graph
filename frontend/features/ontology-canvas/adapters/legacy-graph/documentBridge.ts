import { mapLegacyGraphToOntologyGraph } from '../../../../domain/ontology';
import { BlockEnum, type Edge, type Group, type Node } from '../../../../types/graph/models';
import {
  createOntologyDocumentState,
  type OntologyDocumentState,
  type OntologyDomainViewState,
  type OntologyEdgeViewState,
  type OntologyNodeViewState,
  type OntologyViewState,
} from '../../model/document/ontologyDocument';
import {
  buildOntologyDomainViewModel,
  buildOntologyNodeViewModel,
} from '../../model/view';

export type LegacyOntologyDisplayNode = Node | Group;

export type LegacyGraphDocumentInput = {
  id: string;
  name: string;
  nodes: readonly LegacyOntologyDisplayNode[];
  edges?: readonly Edge[];
  view?: Partial<OntologyViewState>;
};

export type LegacyProjectionOptions = {
  includeMembership?: boolean;
  now?: Date;
};

export type LegacyEdgeProjectionOptions = LegacyProjectionOptions & {
  data?: Edge['data'];
  groupId?: string;
};

const DEFAULT_NODE_WIDTH = 350;
const DEFAULT_NODE_HEIGHT = 280;
const DEFAULT_DOMAIN_WIDTH = 300;
const DEFAULT_DOMAIN_HEIGHT = 200;

const safeNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toLegacyBlockType = (node: LegacyOntologyDisplayNode): 'node' | 'group' =>
  node.type === BlockEnum.GROUP ? 'group' : 'node';

const createNodeView = (node: Node): OntologyNodeViewState => ({
  id: node.id,
  position: {
    x: safeNumber(node.position?.x, 0),
    y: safeNumber(node.position?.y, 0),
  },
  width: safeNumber(node.width, DEFAULT_NODE_WIDTH),
  height: safeNumber(node.height, DEFAULT_NODE_HEIGHT),
  expanded: node.isExpanded,
  collapsedSections: node.collapsedSections,
});

const createDomainView = (group: Group): OntologyDomainViewState => ({
  id: group.id,
  position: {
    x: safeNumber(group.position?.x, 0),
    y: safeNumber(group.position?.y, 0),
  },
  width: safeNumber(group.width, DEFAULT_DOMAIN_WIDTH),
  height: safeNumber(group.height, DEFAULT_DOMAIN_HEIGHT),
  collapsed: group.collapsed,
});

const createEdgeView = (edge: Edge): OntologyEdgeViewState => ({
  id: edge.id,
  sourceHandle: edge.sourceHandle,
  targetHandle: edge.targetHandle,
  display: edge.data,
});

const createViewFromLegacyGraph = (
  input: LegacyGraphDocumentInput
): Partial<OntologyViewState> => {
  const nodeViews: Record<string, OntologyNodeViewState> = {};
  const domainViews: Record<string, OntologyDomainViewState> = {};
  const edgeViews: Record<string, OntologyEdgeViewState> = {};

  for (const node of input.nodes) {
    if (node.type === BlockEnum.GROUP) {
      domainViews[node.id] = createDomainView(node);
      continue;
    }

    nodeViews[node.id] = createNodeView(node);
  }

  for (const edge of input.edges ?? []) {
    edgeViews[edge.id] = createEdgeView(edge);
  }

  return {
    ...input.view,
    nodeViews: {
      ...nodeViews,
      ...input.view?.nodeViews,
    },
    domainViews: {
      ...domainViews,
      ...input.view?.domainViews,
    },
    edgeViews: {
      ...edgeViews,
      ...input.view?.edgeViews,
    },
  };
};

const createLegacyFieldAttributes = (
  fields: OntologyDocumentState['graph']['nodes'][string]['fields']
): Record<string, unknown> => {
  return Object.fromEntries(
    fields.map(field => [
      field.name,
      {
        value: field.value,
        dataType: field.dataType,
        category: field.category,
      },
    ])
  );
};

const getStringMetadata = (
  metadata: Record<string, unknown> | undefined,
  key: string
): string | undefined => {
  const value = metadata?.[key];
  return typeof value === 'string' ? value : undefined;
};

const getStringArrayMetadata = (
  metadata: Record<string, unknown> | undefined,
  key: string
): string[] | undefined => {
  const value = metadata?.[key];
  return Array.isArray(value) && value.every(item => typeof item === 'string')
    ? value
    : undefined;
};

const getRecordMetadata = (
  metadata: Record<string, unknown> | undefined,
  key: string
): Record<string, unknown> | undefined => {
  const value = metadata?.[key];
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
};

const resolveDate = (options: LegacyProjectionOptions): Date =>
  options.now ?? new Date();

export const isLegacyOntologyClassDisplay = (
  node: LegacyOntologyDisplayNode
): node is Node => node.type === BlockEnum.NODE;

export const isLegacyOntologyDomainDisplay = (
  node: LegacyOntologyDisplayNode
): node is Group => node.type === BlockEnum.GROUP;

export const createOntologyDocumentFromLegacyGraph = (
  input: LegacyGraphDocumentInput
): OntologyDocumentState => {
  const graph = mapLegacyGraphToOntologyGraph({
    id: input.id,
    name: input.name,
    nodes: input.nodes.map(node => ({
      id: node.id,
      type: toLegacyBlockType(node),
      title: node.title,
      content: node.content,
      attributes: node.attributes,
      tags: node.tags,
      summary: node.summary,
      groupId: node.groupId,
      collapsed: node.type === BlockEnum.GROUP ? node.collapsed : undefined,
      nodeIds: node.type === BlockEnum.GROUP ? node.nodeIds : undefined,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    })),
    edges: (input.edges ?? []).map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      groupId: edge.groupId,
      data: edge.data,
      createdAt: edge.createdAt,
      updatedAt: edge.updatedAt,
    })),
  });

  return createOntologyDocumentState({
    id: input.id,
    name: input.name,
    graph,
    view: createViewFromLegacyGraph(input),
  });
};

export const projectOntologyNodeToLegacyNode = (
  document: OntologyDocumentState,
  nodeId: string,
  options: LegacyProjectionOptions = {}
): Node | undefined => {
  const node = document.graph.nodes[nodeId];
  const view = document.view.nodeViews[nodeId];
  if (!node || !view) {
    return undefined;
  }

  const now = resolveDate(options);
  const legacyContent = getStringMetadata(node.metadata, 'legacyContent') ?? node.description;
  const legacySummary = getStringMetadata(node.metadata, 'legacySummary') ?? node.description;
  const attributes = {
    ontologyType: node.type,
    ontologyNodeId: node.id,
    ...createLegacyFieldAttributes(node.fields),
  };

  return {
    id: node.id,
    type: BlockEnum.NODE,
    position: view.position,
    data: {
      title: node.name,
      content: legacyContent,
      isExpanded: view.expanded ?? false,
      ontologyNodeId: node.id,
      ontologyType: node.type,
      ontologyViewModel: buildOntologyNodeViewModel(document, node.id),
    },
    title: node.name,
    content: legacyContent,
    attributes,
    tags: node.tags,
    summary: legacySummary,
    isExpanded: view.expanded ?? false,
    width: safeNumber(view.width, DEFAULT_NODE_WIDTH),
    height: safeNumber(view.height, DEFAULT_NODE_HEIGHT),
    customExpandedSize: view.customExpandedSize,
    collapsedSections: view.collapsedSections,
    ...(options.includeMembership !== false && node.domainId ? { groupId: node.domainId } : {}),
    createdAt: now,
    updatedAt: now,
  };
};

export const projectOntologyDomainToLegacyGroup = (
  document: OntologyDocumentState,
  domainId: string,
  options: LegacyProjectionOptions = {}
): Group | undefined => {
  const domain = document.graph.domains[domainId];
  const view = document.view.domainViews[domainId];
  if (!domain || !view) {
    return undefined;
  }

  const now = resolveDate(options);
  const legacyAttributes = getRecordMetadata(domain.metadata, 'legacyAttributes');
  const legacyContent = getStringMetadata(domain.metadata, 'legacyContent') ?? 'Ontology domain';
  const legacySummary = getStringMetadata(domain.metadata, 'legacySummary');
  const legacyTags = getStringArrayMetadata(domain.metadata, 'legacyTags');
  const position = {
    x: safeNumber(view.position.x, 0),
    y: safeNumber(view.position.y, 0),
  };
  const width = safeNumber(view.width, DEFAULT_DOMAIN_WIDTH);
  const height = safeNumber(view.height, DEFAULT_DOMAIN_HEIGHT);

  return {
    id: domain.id,
    type: BlockEnum.GROUP,
    position,
    data: {
      title: domain.name,
      content: legacyContent,
      ontologyDomainId: domain.id,
      ontologyDomainViewModel: buildOntologyDomainViewModel(document, domain.id),
    },
    title: domain.name,
    content: legacyContent,
    attributes: {
      ...(legacyAttributes ?? {}),
      ontologyType: 'Domain',
      ontologyDomainId: domain.id,
    },
    tags: legacyTags,
    summary: legacySummary,
    collapsed: view.collapsed,
    nodeIds: [...domain.nodeIds, ...domain.domainIds],
    boundary: {
      minX: position.x,
      minY: position.y,
      maxX: position.x + width,
      maxY: position.y + height,
    },
    width,
    height,
    ...(options.includeMembership !== false && domain.parentDomainId
      ? { groupId: domain.parentDomainId }
      : {}),
    createdAt: now,
    updatedAt: now,
  };
};

export const projectOntologyEdgeToLegacyEdge = (
  document: OntologyDocumentState,
  edgeId: string,
  options: LegacyEdgeProjectionOptions = {}
): Edge | undefined => {
  const edge = document.graph.edges[edgeId];
  const view = document.view.edgeViews[edgeId];
  if (!edge || !view) {
    return undefined;
  }

  const now = resolveDate(options);
  const viewDisplay = view.display && typeof view.display === 'object'
    ? view.display as NonNullable<Edge['data']>
    : {};
  const data = {
    ...viewDisplay,
    ...(options.data ?? {}),
    direction: edge.direction,
    customProperties: {
      ...(viewDisplay.customProperties ?? {}),
      ...(options.data?.customProperties ?? {}),
      relation: edge.relation,
      relationship: edge.relation,
      ontologyEdgeId: edge.id,
      ontologyDomainId: edge.domainId,
    },
  };

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: view.sourceHandle,
    targetHandle: view.targetHandle,
    label: edge.relation,
    groupId: options.groupId ?? edge.domainId,
    data,
    createdAt: now,
    updatedAt: now,
  };
};
