import { ONTOLOGY_SCHEMA_VERSION } from '../model/schemaVersion';
import type { OntologyGraph } from '../model/graph';

export type OntologyValidationSeverity = 'error' | 'warning';

export type OntologyValidationIssue = {
  severity: OntologyValidationSeverity;
  code: string;
  path: string;
  message: string;
};

export type OntologyValidationResult = {
  valid: boolean;
  issues: OntologyValidationIssue[];
};

const createIssue = (
  severity: OntologyValidationSeverity,
  code: string,
  path: string,
  message: string
): OntologyValidationIssue => ({
  severity,
  code,
  path,
  message,
});

const isBlank = (value: string | undefined): boolean =>
  !value || value.trim().length === 0;

const validateDomainCycles = (
  graph: OntologyGraph,
  issues: OntologyValidationIssue[]
): void => {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (domainId: string, path: string[]): void => {
    if (visiting.has(domainId)) {
      issues.push(createIssue(
        'error',
        'DOMAIN_PARENT_CYCLE',
        `domains.${domainId}.parentDomainId`,
        `Domain parent chain contains a cycle: ${[...path, domainId].join(' -> ')}`
      ));
      return;
    }

    if (visited.has(domainId)) {
      return;
    }

    visiting.add(domainId);
    const parentDomainId = graph.domains[domainId]?.parentDomainId;

    if (parentDomainId && graph.domains[parentDomainId]) {
      visit(parentDomainId, [...path, domainId]);
    }

    visiting.delete(domainId);
    visited.add(domainId);
  };

  Object.keys(graph.domains).forEach(domainId => visit(domainId, []));
};

const validateNodes = (
  graph: OntologyGraph,
  issues: OntologyValidationIssue[]
): void => {
  for (const [nodeKey, node] of Object.entries(graph.nodes)) {
    if (nodeKey !== node.id) {
      issues.push(createIssue(
        'error',
        'NODE_KEY_ID_MISMATCH',
        `nodes.${nodeKey}`,
        `Node record key "${nodeKey}" does not match node id "${node.id}".`
      ));
    }

    if (isBlank(node.name)) {
      issues.push(createIssue(
        'error',
        'NODE_NAME_EMPTY',
        `nodes.${node.id}.name`,
        'Ontology node name cannot be empty.'
      ));
    }

    if (node.domainId && !graph.domains[node.domainId]) {
      issues.push(createIssue(
        'error',
        'NODE_DOMAIN_MISSING',
        `nodes.${node.id}.domainId`,
        `Node references missing domain "${node.domainId}".`
      ));
    }

    const fieldIds = new Set<string>();
    for (const field of node.fields) {
      if (fieldIds.has(field.id)) {
        issues.push(createIssue(
          'error',
          'NODE_FIELD_ID_DUPLICATE',
          `nodes.${node.id}.fields`,
          `Node field id "${field.id}" is duplicated.`
        ));
      }
      fieldIds.add(field.id);

      if (isBlank(field.name)) {
        issues.push(createIssue(
          'error',
          'NODE_FIELD_NAME_EMPTY',
          `nodes.${node.id}.fields.${field.id}.name`,
          'Ontology field name cannot be empty.'
        ));
      }
    }
  }
};

const validateEdges = (
  graph: OntologyGraph,
  issues: OntologyValidationIssue[]
): void => {
  for (const [edgeKey, edge] of Object.entries(graph.edges)) {
    if (edgeKey !== edge.id) {
      issues.push(createIssue(
        'error',
        'EDGE_KEY_ID_MISMATCH',
        `edges.${edgeKey}`,
        `Edge record key "${edgeKey}" does not match edge id "${edge.id}".`
      ));
    }

    if (!graph.nodes[edge.source]) {
      issues.push(createIssue(
        'error',
        'EDGE_SOURCE_MISSING',
        `edges.${edge.id}.source`,
        `Edge source "${edge.source}" does not exist in ontology nodes.`
      ));
    }

    if (!graph.nodes[edge.target]) {
      issues.push(createIssue(
        'error',
        'EDGE_TARGET_MISSING',
        `edges.${edge.id}.target`,
        `Edge target "${edge.target}" does not exist in ontology nodes.`
      ));
    }

    if (isBlank(edge.relation)) {
      issues.push(createIssue(
        'error',
        'EDGE_RELATION_EMPTY',
        `edges.${edge.id}.relation`,
        'Ontology edge relation cannot be empty.'
      ));
    }

    if (edge.domainId && !graph.domains[edge.domainId]) {
      issues.push(createIssue(
        'error',
        'EDGE_DOMAIN_MISSING',
        `edges.${edge.id}.domainId`,
        `Edge references missing domain "${edge.domainId}".`
      ));
    }
  }
};

const validateDomains = (
  graph: OntologyGraph,
  issues: OntologyValidationIssue[]
): void => {
  for (const [domainKey, domain] of Object.entries(graph.domains)) {
    if (domainKey !== domain.id) {
      issues.push(createIssue(
        'error',
        'DOMAIN_KEY_ID_MISMATCH',
        `domains.${domainKey}`,
        `Domain record key "${domainKey}" does not match domain id "${domain.id}".`
      ));
    }

    if (isBlank(domain.name)) {
      issues.push(createIssue(
        'error',
        'DOMAIN_NAME_EMPTY',
        `domains.${domain.id}.name`,
        'Ontology domain name cannot be empty.'
      ));
    }

    if (domain.parentDomainId && !graph.domains[domain.parentDomainId]) {
      issues.push(createIssue(
        'error',
        'DOMAIN_PARENT_MISSING',
        `domains.${domain.id}.parentDomainId`,
        `Domain parent "${domain.parentDomainId}" does not exist.`
      ));
    }

    for (const nodeId of domain.nodeIds) {
      if (!graph.nodes[nodeId]) {
        issues.push(createIssue(
          'error',
          'DOMAIN_NODE_MISSING',
          `domains.${domain.id}.nodeIds`,
          `Domain references missing node "${nodeId}".`
        ));
      }
    }

    for (const childDomainId of domain.domainIds) {
      if (childDomainId === domain.id) {
        issues.push(createIssue(
          'error',
          'DOMAIN_SELF_CHILD',
          `domains.${domain.id}.domainIds`,
          'Domain cannot contain itself.'
        ));
        continue;
      }

      if (!graph.domains[childDomainId]) {
        issues.push(createIssue(
          'error',
          'DOMAIN_CHILD_MISSING',
          `domains.${domain.id}.domainIds`,
          `Domain references missing child domain "${childDomainId}".`
        ));
      }
    }
  }

  validateDomainCycles(graph, issues);
};

const validateSubgraphs = (
  graph: OntologyGraph,
  issues: OntologyValidationIssue[]
): void => {
  for (const [subgraphKey, subgraph] of Object.entries(graph.subgraphs)) {
    if (subgraphKey !== subgraph.id) {
      issues.push(createIssue(
        'error',
        'SUBGRAPH_KEY_ID_MISMATCH',
        `subgraphs.${subgraphKey}`,
        `Subgraph record key "${subgraphKey}" does not match subgraph id "${subgraph.id}".`
      ));
    }

    if (subgraph.rootNodeId && !graph.nodes[subgraph.rootNodeId]) {
      issues.push(createIssue(
        'error',
        'SUBGRAPH_ROOT_NODE_MISSING',
        `subgraphs.${subgraph.id}.rootNodeId`,
        `Subgraph root node "${subgraph.rootNodeId}" does not exist.`
      ));
    }

    if (subgraph.domainId && !graph.domains[subgraph.domainId]) {
      issues.push(createIssue(
        'error',
        'SUBGRAPH_DOMAIN_MISSING',
        `subgraphs.${subgraph.id}.domainId`,
        `Subgraph domain "${subgraph.domainId}" does not exist.`
      ));
    }

    for (const nodeId of subgraph.nodeIds) {
      if (!graph.nodes[nodeId]) {
        issues.push(createIssue(
          'error',
          'SUBGRAPH_NODE_MISSING',
          `subgraphs.${subgraph.id}.nodeIds`,
          `Subgraph references missing node "${nodeId}".`
        ));
      }
    }

    for (const edgeId of subgraph.edgeIds) {
      if (!graph.edges[edgeId]) {
        issues.push(createIssue(
          'error',
          'SUBGRAPH_EDGE_MISSING',
          `subgraphs.${subgraph.id}.edgeIds`,
          `Subgraph references missing edge "${edgeId}".`
        ));
      }
    }
  }
};

export const validateOntologyGraph = (
  graph: OntologyGraph
): OntologyValidationResult => {
  const issues: OntologyValidationIssue[] = [];

  if (isBlank(graph.id)) {
    issues.push(createIssue(
      'error',
      'GRAPH_ID_EMPTY',
      'id',
      'Ontology graph id cannot be empty.'
    ));
  }

  if (isBlank(graph.name)) {
    issues.push(createIssue(
      'error',
      'GRAPH_NAME_EMPTY',
      'name',
      'Ontology graph name cannot be empty.'
    ));
  }

  if (graph.schemaVersion !== ONTOLOGY_SCHEMA_VERSION) {
    issues.push(createIssue(
      'error',
      'GRAPH_SCHEMA_VERSION_UNSUPPORTED',
      'schemaVersion',
      `Expected schema version ${ONTOLOGY_SCHEMA_VERSION}, received ${graph.schemaVersion}.`
    ));
  }

  validateNodes(graph, issues);
  validateEdges(graph, issues);
  validateDomains(graph, issues);
  validateSubgraphs(graph, issues);

  return {
    valid: issues.every(issue => issue.severity !== 'error'),
    issues,
  };
};
