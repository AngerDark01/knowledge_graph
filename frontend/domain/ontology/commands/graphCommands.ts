import type {
  OntologyDomain,
  OntologyEdge,
  OntologyField,
  OntologyGraph,
  OntologyNode,
  OntologyNodeType,
  OntologyRelationDirection,
} from '../model';

export type OntologyCommandWarning = {
  code: string;
  path: string;
  message: string;
};

export type OntologyCommandResult = {
  graph: OntologyGraph;
  changed: boolean;
  warnings: OntologyCommandWarning[];
};

export type CreateClassNodeInput = {
  id: string;
  name: string;
  type?: OntologyNodeType;
  description?: string;
  fields?: OntologyField[];
  tags?: string[];
  domainId?: string;
  subgraphId?: string;
  metadata?: Record<string, unknown>;
};

export type CreateDomainInput = {
  id: string;
  name: string;
  parentDomainId?: string;
  collapsed?: boolean;
  metadata?: Record<string, unknown>;
};

export type UpdateNodeFieldsInput = {
  nodeId: string;
  fields: OntologyField[];
};

export type UpdateOntologyNodeInput = {
  nodeId: string;
  name?: string;
  type?: OntologyNodeType;
  description?: string;
  fields?: OntologyField[];
  tags?: string[];
  domainId?: string | null;
  metadata?: Record<string, unknown>;
};

export type UpdateOntologyDomainInput = {
  domainId: string;
  name?: string;
  parentDomainId?: string | null;
  collapsed?: boolean;
  metadata?: Record<string, unknown>;
};

export type CreateSemanticRelationInput = {
  id: string;
  source: string;
  target: string;
  relation: string;
  direction?: OntologyRelationDirection;
  domainId?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateSemanticRelationInput = {
  edgeId: string;
  relation?: string;
  direction?: OntologyRelationDirection;
  domainId?: string;
  metadata?: Record<string, unknown>;
};

export type MoveNodeToDomainInput = {
  nodeId: string;
  domainId?: string;
};

export type DeleteOntologyElementsInput = {
  ids: string[];
};

const unchanged = (
  graph: OntologyGraph,
  warning: OntologyCommandWarning
): OntologyCommandResult => ({
  graph,
  changed: false,
  warnings: [warning],
});

const changed = (
  graph: OntologyGraph,
  warnings: OntologyCommandWarning[] = []
): OntologyCommandResult => ({
  graph,
  changed: true,
  warnings,
});

const warning = (
  code: string,
  path: string,
  message: string
): OntologyCommandWarning => ({
  code,
  path,
  message,
});

const isBlank = (value: string | undefined): boolean =>
  !value || value.trim().length === 0;

const appendUnique = (ids: readonly string[], id: string): string[] =>
  ids.includes(id) ? [...ids] : [...ids, id];

const removeId = (ids: readonly string[], id: string): string[] =>
  ids.filter(currentId => currentId !== id);

const assertNoDuplicateFields = (
  nodeId: string,
  fields: readonly OntologyField[]
): OntologyCommandWarning | undefined => {
  const fieldIds = new Set<string>();

  for (const field of fields) {
    if (fieldIds.has(field.id)) {
      return warning(
        'NODE_FIELD_ID_DUPLICATE',
        `nodes.${nodeId}.fields`,
        `Node field id "${field.id}" is duplicated.`
      );
    }

    fieldIds.add(field.id);
  }

  return undefined;
};

const addNodeToDomain = (
  domains: Record<string, OntologyDomain>,
  domainId: string,
  nodeId: string
): Record<string, OntologyDomain> => ({
  ...domains,
  [domainId]: {
    ...domains[domainId],
    nodeIds: appendUnique(domains[domainId].nodeIds, nodeId),
  },
});

const addDomainToParent = (
  domains: Record<string, OntologyDomain>,
  parentDomainId: string,
  domainId: string
): Record<string, OntologyDomain> => ({
  ...domains,
  [parentDomainId]: {
    ...domains[parentDomainId],
    domainIds: appendUnique(domains[parentDomainId].domainIds, domainId),
  },
});

const removeNodeFromAllDomains = (
  domains: Record<string, OntologyDomain>,
  nodeId: string
): Record<string, OntologyDomain> => Object.fromEntries(
  Object.entries(domains).map(([domainId, domain]) => [
    domainId,
    {
      ...domain,
      nodeIds: removeId(domain.nodeIds, nodeId),
    },
  ])
);

const removeDomainFromAllParents = (
  domains: Record<string, OntologyDomain>,
  domainId: string
): Record<string, OntologyDomain> => Object.fromEntries(
  Object.entries(domains).map(([currentDomainId, domain]) => [
    currentDomainId,
    {
      ...domain,
      domainIds: removeId(domain.domainIds, domainId),
    },
  ])
);

const wouldCreateDomainCycle = (
  domains: Record<string, OntologyDomain>,
  domainId: string,
  parentDomainId: string
): boolean => {
  let currentParentId: string | undefined = parentDomainId;
  const visited = new Set<string>();

  while (currentParentId) {
    if (currentParentId === domainId) {
      return true;
    }

    if (visited.has(currentParentId)) {
      return true;
    }

    visited.add(currentParentId);
    currentParentId = domains[currentParentId]?.parentDomainId;
  }

  return false;
};

const addNodeToSubgraph = (
  subgraphs: OntologyGraph['subgraphs'],
  subgraphId: string,
  nodeId: string
): OntologyGraph['subgraphs'] => ({
  ...subgraphs,
  [subgraphId]: {
    ...subgraphs[subgraphId],
    nodeIds: appendUnique(subgraphs[subgraphId].nodeIds, nodeId),
  },
});

const addEdgeToContainingSubgraphs = (
  graph: OntologyGraph,
  edge: OntologyEdge
): OntologyGraph['subgraphs'] => Object.fromEntries(
  Object.entries(graph.subgraphs).map(([subgraphId, subgraph]) => {
    const shouldContainEdge =
      subgraph.nodeIds.includes(edge.source) &&
      subgraph.nodeIds.includes(edge.target);

    return [
      subgraphId,
      shouldContainEdge
        ? {
          ...subgraph,
          edgeIds: appendUnique(subgraph.edgeIds, edge.id),
        }
        : subgraph,
    ];
  })
);

const inferRelationDomainId = (
  graph: OntologyGraph,
  inputDomainId: string | undefined,
  sourceNode: OntologyNode,
  targetNode: OntologyNode
): string | undefined => {
  if (inputDomainId) {
    return inputDomainId;
  }

  if (sourceNode.domainId && sourceNode.domainId === targetNode.domainId) {
    return sourceNode.domainId;
  }

  return undefined;
};

const collectDomainDescendants = (
  graph: OntologyGraph,
  domainId: string,
  domainIds: Set<string>,
  nodeIds: Set<string>
): void => {
  if (domainIds.has(domainId)) {
    return;
  }

  const domain = graph.domains[domainId];
  if (!domain) {
    return;
  }

  domainIds.add(domainId);
  domain.nodeIds.forEach(nodeId => nodeIds.add(nodeId));
  domain.domainIds.forEach(childDomainId =>
    collectDomainDescendants(graph, childDomainId, domainIds, nodeIds)
  );
};

const removeDeletedReferencesFromDomains = (
  domains: Record<string, OntologyDomain>,
  deletedDomainIds: Set<string>,
  deletedNodeIds: Set<string>
): Record<string, OntologyDomain> => Object.fromEntries(
  Object.entries(domains)
    .filter(([domainId]) => !deletedDomainIds.has(domainId))
    .map(([domainId, domain]) => [
      domainId,
      {
        ...domain,
        nodeIds: domain.nodeIds.filter(nodeId => !deletedNodeIds.has(nodeId)),
        domainIds: domain.domainIds.filter(childId => !deletedDomainIds.has(childId)),
        parentDomainId: domain.parentDomainId && deletedDomainIds.has(domain.parentDomainId)
          ? undefined
          : domain.parentDomainId,
      },
    ])
);

const removeDeletedReferencesFromSubgraphs = (
  subgraphs: OntologyGraph['subgraphs'],
  deletedNodeIds: Set<string>,
  deletedEdgeIds: Set<string>
): OntologyGraph['subgraphs'] => Object.fromEntries(
  Object.entries(subgraphs).map(([subgraphId, subgraph]) => [
    subgraphId,
    {
      ...subgraph,
      nodeIds: subgraph.nodeIds.filter(nodeId => !deletedNodeIds.has(nodeId)),
      edgeIds: subgraph.edgeIds.filter(edgeId => !deletedEdgeIds.has(edgeId)),
    },
  ])
);

export const createDomain = (
  graph: OntologyGraph,
  input: CreateDomainInput
): OntologyCommandResult => {
  if (graph.domains[input.id]) {
    return unchanged(
      graph,
      warning('DOMAIN_ID_DUPLICATE', `domains.${input.id}`, `Domain "${input.id}" already exists.`)
    );
  }

  if (isBlank(input.name)) {
    return unchanged(
      graph,
      warning('DOMAIN_NAME_EMPTY', 'domain.name', 'Ontology domain name cannot be empty.')
    );
  }

  if (input.parentDomainId === input.id) {
    return unchanged(
      graph,
      warning(
        'DOMAIN_PARENT_SELF',
        `domains.${input.id}.parentDomainId`,
        'Domain cannot be its own parent.'
      )
    );
  }

  if (input.parentDomainId && !graph.domains[input.parentDomainId]) {
    return unchanged(
      graph,
      warning(
        'DOMAIN_PARENT_MISSING',
        `domains.${input.id}.parentDomainId`,
        `Parent domain "${input.parentDomainId}" does not exist.`
      )
    );
  }

  const domain: OntologyDomain = {
    id: input.id,
    name: input.name.trim(),
    nodeIds: [],
    domainIds: [],
    parentDomainId: input.parentDomainId,
    collapsed: input.collapsed ?? false,
    metadata: input.metadata,
  };

  const domainsWithDomain = {
    ...graph.domains,
    [domain.id]: domain,
  };

  return changed({
    ...graph,
    domains: input.parentDomainId
      ? addDomainToParent(domainsWithDomain, input.parentDomainId, domain.id)
      : domainsWithDomain,
  });
};

export const createClassNode = (
  graph: OntologyGraph,
  input: CreateClassNodeInput
): OntologyCommandResult => {
  if (graph.nodes[input.id]) {
    return unchanged(
      graph,
      warning('NODE_ID_DUPLICATE', `nodes.${input.id}`, `Node "${input.id}" already exists.`)
    );
  }

  if (isBlank(input.name)) {
    return unchanged(
      graph,
      warning('NODE_NAME_EMPTY', 'node.name', 'Ontology node name cannot be empty.')
    );
  }

  if (input.domainId && !graph.domains[input.domainId]) {
    return unchanged(
      graph,
      warning(
        'NODE_DOMAIN_MISSING',
        `nodes.${input.id}.domainId`,
        `Domain "${input.domainId}" does not exist.`
      )
    );
  }

  if (input.subgraphId && !graph.subgraphs[input.subgraphId]) {
    return unchanged(
      graph,
      warning(
        'NODE_SUBGRAPH_MISSING',
        `nodes.${input.id}.subgraphId`,
        `Subgraph "${input.subgraphId}" does not exist.`
      )
    );
  }

  const duplicateFieldWarning = assertNoDuplicateFields(input.id, input.fields ?? []);
  if (duplicateFieldWarning) {
    return unchanged(graph, duplicateFieldWarning);
  }

  const node: OntologyNode = {
    id: input.id,
    name: input.name.trim(),
    type: input.type ?? 'Class',
    description: input.description,
    fields: input.fields ?? [],
    tags: input.tags ?? [],
    domainId: input.domainId,
    subgraphId: input.subgraphId,
    metadata: input.metadata,
  };

  const nextDomains = input.domainId
    ? addNodeToDomain(graph.domains, input.domainId, input.id)
    : graph.domains;
  const nextSubgraphs = input.subgraphId
    ? addNodeToSubgraph(graph.subgraphs, input.subgraphId, input.id)
    : graph.subgraphs;

  return changed({
    ...graph,
    nodes: {
      ...graph.nodes,
      [node.id]: node,
    },
    domains: nextDomains,
    subgraphs: nextSubgraphs,
  });
};

export const updateNodeFields = (
  graph: OntologyGraph,
  input: UpdateNodeFieldsInput
): OntologyCommandResult => {
  const node = graph.nodes[input.nodeId];
  if (!node) {
    return unchanged(
      graph,
      warning(
        'NODE_MISSING',
        `nodes.${input.nodeId}`,
        `Node "${input.nodeId}" does not exist.`
      )
    );
  }

  const duplicateFieldWarning = assertNoDuplicateFields(input.nodeId, input.fields);
  if (duplicateFieldWarning) {
    return unchanged(graph, duplicateFieldWarning);
  }

  return changed({
    ...graph,
    nodes: {
      ...graph.nodes,
      [input.nodeId]: {
        ...node,
        fields: [...input.fields],
      },
    },
  });
};

export const updateOntologyNode = (
  graph: OntologyGraph,
  input: UpdateOntologyNodeInput
): OntologyCommandResult => {
  const node = graph.nodes[input.nodeId];
  if (!node) {
    return unchanged(
      graph,
      warning(
        'NODE_MISSING',
        `nodes.${input.nodeId}`,
        `Node "${input.nodeId}" does not exist.`
      )
    );
  }

  if (input.name !== undefined && isBlank(input.name)) {
    return unchanged(
      graph,
      warning('NODE_NAME_EMPTY', `nodes.${input.nodeId}.name`, 'Ontology node name cannot be empty.')
    );
  }

  if (input.domainId && !graph.domains[input.domainId]) {
    return unchanged(
      graph,
      warning(
        'NODE_DOMAIN_MISSING',
        `nodes.${input.nodeId}.domainId`,
        `Domain "${input.domainId}" does not exist.`
      )
    );
  }

  const nextFields = input.fields !== undefined ? input.fields : node.fields;
  const duplicateFieldWarning = assertNoDuplicateFields(input.nodeId, nextFields);
  if (duplicateFieldWarning) {
    return unchanged(graph, duplicateFieldWarning);
  }

  const shouldUpdateDomain = input.domainId !== undefined;
  const nextDomainId = shouldUpdateDomain
    ? input.domainId ?? undefined
    : node.domainId;
  const domainsWithoutNode = shouldUpdateDomain
    ? removeNodeFromAllDomains(graph.domains, input.nodeId)
    : graph.domains;
  const nextDomains = shouldUpdateDomain && nextDomainId
    ? addNodeToDomain(domainsWithoutNode, nextDomainId, input.nodeId)
    : domainsWithoutNode;

  return changed({
    ...graph,
    nodes: {
      ...graph.nodes,
      [input.nodeId]: {
        ...node,
        name: input.name !== undefined ? input.name.trim() : node.name,
        type: input.type ?? node.type,
        description: input.description !== undefined ? input.description : node.description,
        fields: [...nextFields],
        tags: input.tags !== undefined ? [...input.tags] : node.tags,
        domainId: nextDomainId,
        metadata: input.metadata !== undefined
          ? {
            ...(node.metadata ?? {}),
            ...input.metadata,
          }
          : node.metadata,
      },
    },
    domains: nextDomains,
  });
};

export const updateOntologyDomain = (
  graph: OntologyGraph,
  input: UpdateOntologyDomainInput
): OntologyCommandResult => {
  const domain = graph.domains[input.domainId];
  if (!domain) {
    return unchanged(
      graph,
      warning(
        'DOMAIN_MISSING',
        `domains.${input.domainId}`,
        `Domain "${input.domainId}" does not exist.`
      )
    );
  }

  if (input.name !== undefined && isBlank(input.name)) {
    return unchanged(
      graph,
      warning(
        'DOMAIN_NAME_EMPTY',
        `domains.${input.domainId}.name`,
        'Ontology domain name cannot be empty.'
      )
    );
  }

  if (input.parentDomainId === input.domainId) {
    return unchanged(
      graph,
      warning(
        'DOMAIN_PARENT_SELF',
        `domains.${input.domainId}.parentDomainId`,
        'Domain cannot be its own parent.'
      )
    );
  }

  if (input.parentDomainId && !graph.domains[input.parentDomainId]) {
    return unchanged(
      graph,
      warning(
        'DOMAIN_PARENT_MISSING',
        `domains.${input.domainId}.parentDomainId`,
        `Parent domain "${input.parentDomainId}" does not exist.`
      )
    );
  }

  if (
    input.parentDomainId &&
    wouldCreateDomainCycle(graph.domains, input.domainId, input.parentDomainId)
  ) {
    return unchanged(
      graph,
      warning(
        'DOMAIN_PARENT_CYCLE',
        `domains.${input.domainId}.parentDomainId`,
        'Domain parent update would create a cycle.'
      )
    );
  }

  const shouldUpdateParent = input.parentDomainId !== undefined;
  const nextParentDomainId = shouldUpdateParent
    ? input.parentDomainId ?? undefined
    : domain.parentDomainId;
  const domainsWithoutDomain = shouldUpdateParent
    ? removeDomainFromAllParents(graph.domains, input.domainId)
    : graph.domains;
  const domainsWithParent = shouldUpdateParent && nextParentDomainId
    ? addDomainToParent(domainsWithoutDomain, nextParentDomainId, input.domainId)
    : domainsWithoutDomain;

  return changed({
    ...graph,
    domains: {
      ...domainsWithParent,
      [input.domainId]: {
        ...domainsWithParent[input.domainId],
        name: input.name !== undefined ? input.name.trim() : domain.name,
        parentDomainId: nextParentDomainId,
        collapsed: input.collapsed ?? domain.collapsed,
        metadata: input.metadata !== undefined
          ? {
            ...(domain.metadata ?? {}),
            ...input.metadata,
          }
          : domain.metadata,
      },
    },
  });
};

export const createSemanticRelation = (
  graph: OntologyGraph,
  input: CreateSemanticRelationInput
): OntologyCommandResult => {
  if (graph.edges[input.id]) {
    return unchanged(
      graph,
      warning('EDGE_ID_DUPLICATE', `edges.${input.id}`, `Edge "${input.id}" already exists.`)
    );
  }

  const sourceNode = graph.nodes[input.source];
  if (!sourceNode) {
    return unchanged(
      graph,
      warning(
        'EDGE_SOURCE_MISSING',
        `edges.${input.id}.source`,
        `Source node "${input.source}" does not exist.`
      )
    );
  }

  const targetNode = graph.nodes[input.target];
  if (!targetNode) {
    return unchanged(
      graph,
      warning(
        'EDGE_TARGET_MISSING',
        `edges.${input.id}.target`,
        `Target node "${input.target}" does not exist.`
      )
    );
  }

  if (isBlank(input.relation)) {
    return unchanged(
      graph,
      warning(
        'EDGE_RELATION_EMPTY',
        `edges.${input.id}.relation`,
        'Ontology relation cannot be empty.'
      )
    );
  }

  if (input.domainId && !graph.domains[input.domainId]) {
    return unchanged(
      graph,
      warning(
        'EDGE_DOMAIN_MISSING',
        `edges.${input.id}.domainId`,
        `Domain "${input.domainId}" does not exist.`
      )
    );
  }

  const edge: OntologyEdge = {
    id: input.id,
    source: input.source,
    target: input.target,
    relation: input.relation.trim(),
    direction: input.direction ?? 'unidirectional',
    domainId: inferRelationDomainId(graph, input.domainId, sourceNode, targetNode),
    metadata: input.metadata,
  };

  return changed({
    ...graph,
    edges: {
      ...graph.edges,
      [edge.id]: edge,
    },
    subgraphs: addEdgeToContainingSubgraphs(graph, edge),
  });
};

export const updateSemanticRelation = (
  graph: OntologyGraph,
  input: UpdateSemanticRelationInput
): OntologyCommandResult => {
  const edge = graph.edges[input.edgeId];
  if (!edge) {
    return unchanged(
      graph,
      warning(
        'EDGE_MISSING',
        `edges.${input.edgeId}`,
        `Edge "${input.edgeId}" does not exist.`
      )
    );
  }

  if (input.relation !== undefined && isBlank(input.relation)) {
    return unchanged(
      graph,
      warning(
        'EDGE_RELATION_EMPTY',
        `edges.${input.edgeId}.relation`,
        'Ontology relation cannot be empty.'
      )
    );
  }

  if (input.domainId && !graph.domains[input.domainId]) {
    return unchanged(
      graph,
      warning(
        'EDGE_DOMAIN_MISSING',
        `edges.${input.edgeId}.domainId`,
        `Domain "${input.domainId}" does not exist.`
      )
    );
  }

  return changed({
    ...graph,
    edges: {
      ...graph.edges,
      [input.edgeId]: {
        ...edge,
        relation: input.relation !== undefined
          ? input.relation.trim()
          : edge.relation,
        direction: input.direction ?? edge.direction,
        domainId: input.domainId !== undefined
          ? input.domainId
          : edge.domainId,
        metadata: input.metadata !== undefined
          ? {
            ...(edge.metadata ?? {}),
            ...input.metadata,
          }
          : edge.metadata,
      },
    },
  });
};

export const deleteOntologyElements = (
  graph: OntologyGraph,
  input: DeleteOntologyElementsInput
): OntologyCommandResult => {
  const deletedNodeIds = new Set<string>();
  const deletedDomainIds = new Set<string>();
  const explicitEdgeIds = new Set<string>();
  const missingIds: string[] = [];

  for (const id of input.ids) {
    if (graph.nodes[id]) {
      deletedNodeIds.add(id);
      continue;
    }

    if (graph.domains[id]) {
      collectDomainDescendants(graph, id, deletedDomainIds, deletedNodeIds);
      continue;
    }

    if (graph.edges[id]) {
      explicitEdgeIds.add(id);
      continue;
    }

    missingIds.push(id);
  }

  const deletedEdgeIds = new Set<string>(explicitEdgeIds);
  for (const edge of Object.values(graph.edges)) {
    if (
      deletedNodeIds.has(edge.source) ||
      deletedNodeIds.has(edge.target) ||
      (edge.domainId !== undefined && deletedDomainIds.has(edge.domainId))
    ) {
      deletedEdgeIds.add(edge.id);
    }
  }

  if (
    deletedNodeIds.size === 0 &&
    deletedDomainIds.size === 0 &&
    deletedEdgeIds.size === 0
  ) {
    return unchanged(
      graph,
      warning(
        'DELETE_TARGET_MISSING',
        'delete.ids',
        `No ontology elements matched: ${missingIds.join(', ')}`
      )
    );
  }

  const nodes = Object.fromEntries(
    Object.entries(graph.nodes).filter(([nodeId]) => !deletedNodeIds.has(nodeId))
  );
  const domains = removeDeletedReferencesFromDomains(
    graph.domains,
    deletedDomainIds,
    deletedNodeIds
  );
  const edges = Object.fromEntries(
    Object.entries(graph.edges).filter(([edgeId]) => !deletedEdgeIds.has(edgeId))
  );

  return changed({
    ...graph,
    nodes,
    domains,
    edges,
    subgraphs: removeDeletedReferencesFromSubgraphs(graph.subgraphs, deletedNodeIds, deletedEdgeIds),
  }, missingIds.map(id =>
    warning('DELETE_TARGET_MISSING', `delete.ids.${id}`, `Ontology element "${id}" does not exist.`)
  ));
};

export const moveNodeToDomain = (
  graph: OntologyGraph,
  input: MoveNodeToDomainInput
): OntologyCommandResult => {
  const node = graph.nodes[input.nodeId];
  if (!node) {
    return unchanged(
      graph,
      warning(
        'NODE_MISSING',
        `nodes.${input.nodeId}`,
        `Node "${input.nodeId}" does not exist.`
      )
    );
  }

  if (input.domainId && !graph.domains[input.domainId]) {
    return unchanged(
      graph,
      warning(
        'NODE_DOMAIN_MISSING',
        `nodes.${input.nodeId}.domainId`,
        `Domain "${input.domainId}" does not exist.`
      )
    );
  }

  const domainsWithoutNode = removeNodeFromAllDomains(graph.domains, input.nodeId);
  const nextDomains = input.domainId
    ? addNodeToDomain(domainsWithoutNode, input.domainId, input.nodeId)
    : domainsWithoutNode;

  return changed({
    ...graph,
    nodes: {
      ...graph.nodes,
      [input.nodeId]: {
        ...node,
        domainId: input.domainId,
      },
    },
    domains: nextDomains,
  });
};
