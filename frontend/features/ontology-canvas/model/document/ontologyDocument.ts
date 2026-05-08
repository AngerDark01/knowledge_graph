import {
  createClassNode,
  createDomain,
  createSemanticRelation,
  createOntologyGraph,
  deleteOntologyElements,
  updateOntologyDomain,
  updateOntologyNode,
  updateSemanticRelation,
  type CreateClassNodeInput,
  type CreateDomainInput,
  type CreateSemanticRelationInput,
  type DeleteOntologyElementsInput,
  type OntologyCommandWarning,
  type OntologyEdge,
  type OntologyGraph,
  type OntologyNode,
  type OntologyNodeType,
  type OntologyRelationDirection,
  type UpdateOntologyDomainInput,
  type UpdateOntologyNodeInput,
  type UpdateSemanticRelationInput,
} from '../../../../domain/ontology';

export type OntologyViewportState = {
  x: number;
  y: number;
  zoom: number;
};

export type OntologyLodMode = 'full' | 'compact' | 'outline' | 'dot';

export type OntologyNodeViewState = {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  expanded?: boolean;
  customExpandedSize?: {
    width: number;
    height: number;
  };
  collapsedSections?: string[];
};

export type OntologyDomainViewState = {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  collapsed: boolean;
};

export type OntologyEdgeViewState = {
  id: string;
  sourceHandle?: string;
  targetHandle?: string;
  display?: Record<string, unknown>;
};

export type OntologyViewState = {
  nodeViews: Record<string, OntologyNodeViewState>;
  domainViews: Record<string, OntologyDomainViewState>;
  edgeViews: Record<string, OntologyEdgeViewState>;
  viewport: OntologyViewportState;
  lod: OntologyLodMode;
  edgeVisibility: {
    mode: 'all' | 'none' | 'custom';
    ids: string[];
  };
};

export type OntologyDocumentState = {
  graph: OntologyGraph;
  view: OntologyViewState;
  revision: number;
};

export type CreateOntologyDocumentInput = {
  id: string;
  name: string;
  graph?: OntologyGraph;
  view?: Partial<OntologyViewState>;
  revision?: number;
};

export type CreateOntologyClassNodeInDocumentInput = {
  id: string;
  name: string;
  type?: OntologyNodeType;
  description?: string;
  fields?: CreateClassNodeInput['fields'];
  tags?: string[];
  domainId?: string;
  subgraphId?: string;
  metadata?: Record<string, unknown>;
  position: { x: number; y: number };
  width?: number;
  height?: number;
};

export type CreateOntologyDomainInDocumentInput = {
  id: string;
  name: string;
  parentDomainId?: string;
  collapsed?: boolean;
  metadata?: Record<string, unknown>;
  position: { x: number; y: number };
  width?: number;
  height?: number;
};

export type CreateOntologyRelationInDocumentInput = {
  id: string;
  source: string;
  target: string;
  relation: string;
  direction?: OntologyRelationDirection;
  domainId?: string;
  metadata?: Record<string, unknown>;
  sourceHandle?: string;
  targetHandle?: string;
};

export type UpdateOntologyRelationInDocumentInput = {
  edgeId: string;
  relation?: string;
  direction?: OntologyRelationDirection;
  domainId?: string;
  metadata?: Record<string, unknown>;
  sourceHandle?: string;
  targetHandle?: string;
};

export type UpdateOntologyNodeInDocumentInput = UpdateOntologyNodeInput;

export type UpdateOntologyDomainInDocumentInput = UpdateOntologyDomainInput;

export type UpdateOntologyNodeViewInDocumentInput = {
  nodeId: string;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
  expanded?: boolean;
  customExpandedSize?: {
    width: number;
    height: number;
  };
  collapsedSections?: string[];
};

export type UpdateOntologyDomainViewInDocumentInput = {
  domainId: string;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
  collapsed?: boolean;
};

export type UpdateOntologyViewportInDocumentInput = Partial<OntologyViewportState>;

export type DeleteOntologyElementsInDocumentInput = DeleteOntologyElementsInput;

export type OntologyDocumentCommandResult = {
  document: OntologyDocumentState;
  changed: boolean;
  warnings: OntologyCommandWarning[];
};

const DEFAULT_NODE_WIDTH = 350;
const DEFAULT_NODE_HEIGHT = 280;
const DEFAULT_DOMAIN_WIDTH = 300;
const DEFAULT_DOMAIN_HEIGHT = 200;

const DEFAULT_VIEW_STATE: OntologyViewState = {
  nodeViews: {},
  domainViews: {},
  edgeViews: {},
  viewport: { x: 0, y: 0, zoom: 1 },
  lod: 'full',
  edgeVisibility: { mode: 'all', ids: [] },
};

const safeNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const uniqueValues = Array.from(new Set(
    value.filter((item): item is string => typeof item === 'string')
  ));

  return uniqueValues.length > 0 ? uniqueValues : undefined;
};

const createDefaultNodeView = (node: OntologyNode): OntologyNodeViewState => {
  const metadata = node.metadata ?? {};
  const position = typeof metadata.position === 'object' && metadata.position !== null
    ? metadata.position as Partial<{ x: number; y: number }>
    : {};

  return {
    id: node.id,
    position: {
      x: safeNumber(position.x, 0),
      y: safeNumber(position.y, 0),
    },
    width: safeNumber(metadata.width, DEFAULT_NODE_WIDTH),
    height: safeNumber(metadata.height, DEFAULT_NODE_HEIGHT),
    collapsedSections: safeStringArray(metadata.collapsedSections),
  };
};

const createDefaultDomainView = (
  domainId: string,
  graph: OntologyGraph
): OntologyDomainViewState => {
  const domain = graph.domains[domainId];
  const metadata = domain?.metadata ?? {};
  const position = typeof metadata.position === 'object' && metadata.position !== null
    ? metadata.position as Partial<{ x: number; y: number }>
    : {};

  return {
    id: domainId,
    position: {
      x: safeNumber(position.x, 0),
      y: safeNumber(position.y, 0),
    },
    width: safeNumber(metadata.width, DEFAULT_DOMAIN_WIDTH),
    height: safeNumber(metadata.height, DEFAULT_DOMAIN_HEIGHT),
    collapsed: domain?.collapsed ?? false,
  };
};

const createDefaultEdgeView = (edge: OntologyEdge): OntologyEdgeViewState => ({
  id: edge.id,
});

export const createOntologyViewState = (
  graph: OntologyGraph,
  view: Partial<OntologyViewState> = {}
): OntologyViewState => {
  const nodeViews = { ...view.nodeViews };
  const domainViews = { ...view.domainViews };
  const edgeViews = { ...view.edgeViews };

  for (const node of Object.values(graph.nodes)) {
    nodeViews[node.id] = nodeViews[node.id] ?? createDefaultNodeView(node);
  }

  for (const domainId of Object.keys(graph.domains)) {
    domainViews[domainId] = domainViews[domainId] ?? createDefaultDomainView(domainId, graph);
  }

  for (const edge of Object.values(graph.edges)) {
    edgeViews[edge.id] = edgeViews[edge.id] ?? createDefaultEdgeView(edge);
  }

  return {
    nodeViews,
    domainViews,
    edgeViews,
    viewport: view.viewport ?? DEFAULT_VIEW_STATE.viewport,
    lod: view.lod ?? DEFAULT_VIEW_STATE.lod,
    edgeVisibility: view.edgeVisibility ?? DEFAULT_VIEW_STATE.edgeVisibility,
  };
};

export const createOntologyDocumentState = (
  input: CreateOntologyDocumentInput
): OntologyDocumentState => {
  const graph = input.graph ?? createOntologyGraph({
    id: input.id,
    name: input.name,
  });

  return {
    graph,
    view: createOntologyViewState(graph, input.view),
    revision: input.revision ?? 0,
  };
};

export const createOntologyClassNodeInDocument = (
  document: OntologyDocumentState,
  input: CreateOntologyClassNodeInDocumentInput
): OntologyDocumentCommandResult => {
  const commandResult = createClassNode(document.graph, {
    id: input.id,
    name: input.name,
    type: input.type ?? 'Class',
    description: input.description,
    fields: input.fields,
    tags: input.tags,
    domainId: input.domainId,
    subgraphId: input.subgraphId,
    metadata: input.metadata,
  });

  if (!commandResult.changed) {
    return {
      document,
      changed: false,
      warnings: commandResult.warnings,
    };
  }

  return {
    document: {
      graph: commandResult.graph,
      view: {
        ...document.view,
        nodeViews: {
          ...document.view.nodeViews,
          [input.id]: {
            id: input.id,
            position: {
              x: safeNumber(input.position.x, 0),
              y: safeNumber(input.position.y, 0),
            },
            width: safeNumber(input.width, DEFAULT_NODE_WIDTH),
            height: safeNumber(input.height, DEFAULT_NODE_HEIGHT),
          },
        },
      },
      revision: document.revision + 1,
    },
    changed: true,
    warnings: commandResult.warnings,
  };
};

export const createOntologyDomainInDocument = (
  document: OntologyDocumentState,
  input: CreateOntologyDomainInDocumentInput
): OntologyDocumentCommandResult => {
  const commandInput: CreateDomainInput = {
    id: input.id,
    name: input.name,
    parentDomainId: input.parentDomainId,
    collapsed: input.collapsed,
    metadata: input.metadata,
  };
  const commandResult = createDomain(document.graph, commandInput);

  if (!commandResult.changed) {
    return {
      document,
      changed: false,
      warnings: commandResult.warnings,
    };
  }

  return {
    document: {
      graph: commandResult.graph,
      view: {
        ...document.view,
        domainViews: {
          ...document.view.domainViews,
          [input.id]: {
            id: input.id,
            position: {
              x: safeNumber(input.position.x, 0),
              y: safeNumber(input.position.y, 0),
            },
            width: safeNumber(input.width, DEFAULT_DOMAIN_WIDTH),
            height: safeNumber(input.height, DEFAULT_DOMAIN_HEIGHT),
            collapsed: input.collapsed ?? false,
          },
        },
      },
      revision: document.revision + 1,
    },
    changed: true,
    warnings: commandResult.warnings,
  };
};

export const createOntologyRelationInDocument = (
  document: OntologyDocumentState,
  input: CreateOntologyRelationInDocumentInput
): OntologyDocumentCommandResult => {
  const commandInput: CreateSemanticRelationInput = {
    id: input.id,
    source: input.source,
    target: input.target,
    relation: input.relation,
    direction: input.direction,
    domainId: input.domainId,
    metadata: input.metadata,
  };
  const commandResult = createSemanticRelation(document.graph, commandInput);

  if (!commandResult.changed) {
    return {
      document,
      changed: false,
      warnings: commandResult.warnings,
    };
  }

  return {
    document: {
      graph: commandResult.graph,
      view: {
        ...document.view,
        edgeViews: {
          ...document.view.edgeViews,
          [input.id]: {
            id: input.id,
            sourceHandle: input.sourceHandle,
            targetHandle: input.targetHandle,
          },
        },
      },
      revision: document.revision + 1,
    },
    changed: true,
    warnings: commandResult.warnings,
  };
};

export const updateOntologyRelationInDocument = (
  document: OntologyDocumentState,
  input: UpdateOntologyRelationInDocumentInput
): OntologyDocumentCommandResult => {
  const commandInput: UpdateSemanticRelationInput = {
    edgeId: input.edgeId,
    relation: input.relation,
    direction: input.direction,
    domainId: input.domainId,
    metadata: input.metadata,
  };
  const commandResult = updateSemanticRelation(document.graph, commandInput);

  if (!commandResult.changed) {
    return {
      document,
      changed: false,
      warnings: commandResult.warnings,
    };
  }

  const previousEdgeView = document.view.edgeViews[input.edgeId] ?? { id: input.edgeId };

  return {
    document: {
      graph: commandResult.graph,
      view: {
        ...document.view,
        edgeViews: {
          ...document.view.edgeViews,
          [input.edgeId]: {
            ...previousEdgeView,
            sourceHandle: input.sourceHandle ?? previousEdgeView.sourceHandle,
            targetHandle: input.targetHandle ?? previousEdgeView.targetHandle,
          },
        },
      },
      revision: document.revision + 1,
    },
    changed: true,
    warnings: commandResult.warnings,
  };
};

export const updateOntologyNodeInDocument = (
  document: OntologyDocumentState,
  input: UpdateOntologyNodeInDocumentInput
): OntologyDocumentCommandResult => {
  const commandResult = updateOntologyNode(document.graph, input);

  if (!commandResult.changed) {
    return {
      document,
      changed: false,
      warnings: commandResult.warnings,
    };
  }

  return {
    document: {
      graph: commandResult.graph,
      view: document.view,
      revision: document.revision + 1,
    },
    changed: true,
    warnings: commandResult.warnings,
  };
};

export const updateOntologyDomainInDocument = (
  document: OntologyDocumentState,
  input: UpdateOntologyDomainInDocumentInput
): OntologyDocumentCommandResult => {
  const commandResult = updateOntologyDomain(document.graph, input);

  if (!commandResult.changed) {
    return {
      document,
      changed: false,
      warnings: commandResult.warnings,
    };
  }

  const nextDomainView = input.collapsed === undefined
    ? document.view.domainViews[input.domainId]
    : {
      ...document.view.domainViews[input.domainId],
      collapsed: input.collapsed,
    };

  return {
    document: {
      graph: commandResult.graph,
      view: nextDomainView
        ? {
          ...document.view,
          domainViews: {
            ...document.view.domainViews,
            [input.domainId]: nextDomainView,
          },
        }
        : document.view,
      revision: document.revision + 1,
    },
    changed: true,
    warnings: commandResult.warnings,
  };
};

export const updateOntologyNodeViewInDocument = (
  document: OntologyDocumentState,
  input: UpdateOntologyNodeViewInDocumentInput
): OntologyDocumentState => {
  const previousView = document.view.nodeViews[input.nodeId];
  if (!previousView) {
    return document;
  }

  return {
    ...document,
    view: {
      ...document.view,
      nodeViews: {
        ...document.view.nodeViews,
        [input.nodeId]: {
          ...previousView,
          position: input.position
            ? {
              x: safeNumber(input.position.x, previousView.position.x),
              y: safeNumber(input.position.y, previousView.position.y),
            }
            : previousView.position,
          width: safeNumber(input.width, previousView.width),
          height: safeNumber(input.height, previousView.height),
          expanded: input.expanded ?? previousView.expanded,
          customExpandedSize: input.customExpandedSize ?? previousView.customExpandedSize,
          collapsedSections: input.collapsedSections !== undefined
            ? safeStringArray(input.collapsedSections)
            : previousView.collapsedSections,
        },
      },
    },
    revision: document.revision + 1,
  };
};

export const updateOntologyDomainViewInDocument = (
  document: OntologyDocumentState,
  input: UpdateOntologyDomainViewInDocumentInput
): OntologyDocumentState => {
  const previousView = document.view.domainViews[input.domainId];
  if (!previousView) {
    return document;
  }

  return {
    ...document,
    view: {
      ...document.view,
      domainViews: {
        ...document.view.domainViews,
        [input.domainId]: {
          ...previousView,
          position: input.position
            ? {
              x: safeNumber(input.position.x, previousView.position.x),
              y: safeNumber(input.position.y, previousView.position.y),
            }
            : previousView.position,
          width: safeNumber(input.width, previousView.width),
          height: safeNumber(input.height, previousView.height),
          collapsed: input.collapsed ?? previousView.collapsed,
        },
      },
    },
    revision: document.revision + 1,
  };
};

export const updateOntologyViewportInDocument = (
  document: OntologyDocumentState,
  input: UpdateOntologyViewportInDocumentInput
): OntologyDocumentState => ({
  ...document,
  view: {
    ...document.view,
    viewport: {
      x: safeNumber(input.x, document.view.viewport.x),
      y: safeNumber(input.y, document.view.viewport.y),
      zoom: safeNumber(input.zoom, document.view.viewport.zoom),
    },
  },
  revision: document.revision + 1,
});

export const deleteOntologyElementsInDocument = (
  document: OntologyDocumentState,
  input: DeleteOntologyElementsInDocumentInput
): OntologyDocumentCommandResult => {
  const commandResult = deleteOntologyElements(document.graph, input);

  if (!commandResult.changed) {
    return {
      document,
      changed: false,
      warnings: commandResult.warnings,
    };
  }

  const nextNodeViews = Object.fromEntries(
    Object.entries(document.view.nodeViews).filter(([nodeId]) => commandResult.graph.nodes[nodeId])
  );
  const nextDomainViews = Object.fromEntries(
    Object.entries(document.view.domainViews).filter(([domainId]) => commandResult.graph.domains[domainId])
  );
  const nextEdgeViews = Object.fromEntries(
    Object.entries(document.view.edgeViews).filter(([edgeId]) => commandResult.graph.edges[edgeId])
  );

  return {
    document: {
      graph: commandResult.graph,
      view: {
        ...document.view,
        nodeViews: nextNodeViews,
        domainViews: nextDomainViews,
        edgeViews: nextEdgeViews,
        edgeVisibility: {
          ...document.view.edgeVisibility,
          ids: document.view.edgeVisibility.ids.filter(edgeId => commandResult.graph.edges[edgeId]),
        },
      },
      revision: document.revision + 1,
    },
    changed: true,
    warnings: commandResult.warnings,
  };
};
