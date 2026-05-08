import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);

const ontology = loadTypeScriptModule(path.join(projectRoot, 'domain/ontology/index.ts'));

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));

const assertDeepPlainEqual = (actual, expected, message) => {
  assert.deepEqual(toPlainValue(actual), expected, message);
};

const legacyGraph = {
  id: 'legacy-graph',
  name: 'Legacy Graph',
  nodes: [
    {
      id: 'domain-a',
      type: 'group',
      title: 'Knowledge Domain',
      collapsed: false,
      nodeIds: ['function-a', 'information-a', 'domain-b'],
    },
    {
      id: 'domain-b',
      type: 'group',
      title: 'Nested Domain',
      collapsed: true,
      groupId: 'domain-a',
      nodeIds: ['component-a'],
    },
    {
      id: 'function-a',
      type: 'node',
      title: 'Function',
      groupId: 'domain-a',
      attributes: {
        ontologyType: 'Function',
        behavior: {
          value: 'Transform input information',
          dataType: 'text',
          category: 'behavior',
        },
        constraint: {
          value: 'Must expose stable interface',
          category: 'constraint',
        },
      },
      tags: ['capability'],
    },
    {
      id: 'information-a',
      type: 'node',
      title: 'Information',
      groupId: 'domain-a',
      attributes: {
        ontologyType: 'Information',
        format: 'JSON',
      },
    },
    {
      id: 'component-a',
      type: 'node',
      title: 'Component',
      groupId: 'domain-b',
      attributes: {
        ontologyType: 'Component',
      },
    },
  ],
  edges: [
    {
      id: 'edge-produces',
      source: 'function-a',
      target: 'information-a',
      label: 'Produces',
      data: {
        direction: 'unidirectional',
      },
    },
    {
      id: 'edge-uses',
      source: 'component-a',
      target: 'function-a',
      data: {
        customProperties: {
          relationship: 'ProvidesService',
        },
      },
    },
  ],
};

const graph = ontology.mapLegacyGraphToOntologyGraph(legacyGraph);
const validation = ontology.validateOntologyGraph(graph);

assert.equal(graph.schemaVersion, ontology.ONTOLOGY_SCHEMA_VERSION);
assert.equal(graph.nodes['function-a'].type, 'Function');
assert.equal(graph.nodes['function-a'].domainId, 'domain-a');
assert.equal(graph.nodes['information-a'].type, 'Information');
assert.equal(graph.nodes['component-a'].domainId, 'domain-b');

assertDeepPlainEqual(
  graph.nodes['function-a'].fields.map(field => ({
    name: field.name,
    value: field.value,
    dataType: field.dataType,
    category: field.category,
  })),
  [
    {
      name: 'behavior',
      value: 'Transform input information',
      dataType: 'text',
      category: 'behavior',
    },
    {
      name: 'constraint',
      value: 'Must expose stable interface',
      dataType: 'string',
      category: 'constraint',
    },
  ],
  'legacy node attributes should map to ontology fields'
);

assertDeepPlainEqual(
  graph.domains['domain-a'],
  {
    id: 'domain-a',
    name: 'Knowledge Domain',
    nodeIds: ['function-a', 'information-a'],
    domainIds: ['domain-b'],
    collapsed: false,
    metadata: {
      legacyType: 'group',
    },
  },
  'legacy group should map to ontology domain membership'
);

assert.equal(graph.edges['edge-produces'].relation, 'Produces');
assert.equal(graph.edges['edge-produces'].domainId, 'domain-a');
assert.equal(graph.edges['edge-uses'].relation, 'ProvidesService');

assertDeepPlainEqual(
  graph.subgraphs['legacy-graph:root'],
  {
    id: 'legacy-graph:root',
    name: 'Root',
    nodeIds: ['function-a', 'information-a', 'component-a'],
    edgeIds: ['edge-produces', 'edge-uses'],
  },
  'mapper should create a root subgraph over all semantic nodes and edges'
);

assert.equal(validation.valid, true);
assertDeepPlainEqual(validation.issues, [], 'valid mapped graph should have no issues');

const invalidGraph = {
  ...graph,
  edges: {
    ...graph.edges,
    'edge-invalid': {
      id: 'edge-invalid',
      source: 'missing-node',
      target: 'function-a',
      relation: '',
      direction: 'unidirectional',
    },
  },
};
const invalidValidation = ontology.validateOntologyGraph(invalidGraph);
const invalidCodes = invalidValidation.issues.map(issue => issue.code);
assert.equal(invalidValidation.valid, false);
assert.equal(invalidCodes.includes('EDGE_SOURCE_MISSING'), true);
assert.equal(invalidCodes.includes('EDGE_RELATION_EMPTY'), true);

const cyclicGraph = {
  ...graph,
  domains: {
    ...graph.domains,
    'domain-a': {
      ...graph.domains['domain-a'],
      parentDomainId: 'domain-b',
    },
    'domain-b': {
      ...graph.domains['domain-b'],
      parentDomainId: 'domain-a',
    },
  },
};
const cyclicValidation = ontology.validateOntologyGraph(cyclicGraph);
assert.equal(
  cyclicValidation.issues.some(issue => issue.code === 'DOMAIN_PARENT_CYCLE'),
  true,
  'validator should detect domain parent cycles'
);

console.log('Ontology model runtime tests passed.');
