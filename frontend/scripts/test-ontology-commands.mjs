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

const createBaseGraph = () => ontology.mapLegacyGraphToOntologyGraph({
  id: 'command-graph',
  name: 'Command Graph',
  nodes: [
    {
      id: 'domain-a',
      type: 'group',
      title: 'Domain A',
      collapsed: false,
      nodeIds: ['function-a', 'information-a'],
    },
    {
      id: 'domain-b',
      type: 'group',
      title: 'Domain B',
      collapsed: false,
      nodeIds: ['component-a'],
    },
    {
      id: 'function-a',
      type: 'node',
      title: 'Function A',
      groupId: 'domain-a',
      attributes: {
        ontologyType: 'Function',
      },
    },
    {
      id: 'information-a',
      type: 'node',
      title: 'Information A',
      groupId: 'domain-a',
      attributes: {
        ontologyType: 'Information',
      },
    },
    {
      id: 'component-a',
      type: 'node',
      title: 'Component A',
      groupId: 'domain-b',
      attributes: {
        ontologyType: 'Component',
      },
    },
  ],
  edges: [],
});

let graph = createBaseGraph();
const rootSubgraphId = 'command-graph:root';

const createDomainResult = ontology.createDomain(graph, {
  id: 'domain-c',
  name: 'Domain C',
  parentDomainId: 'domain-a',
  collapsed: true,
});

assert.equal(createDomainResult.changed, true);
assertDeepPlainEqual(createDomainResult.warnings, []);
graph = createDomainResult.graph;
assert.equal(graph.domains['domain-c'].name, 'Domain C');
assert.equal(graph.domains['domain-c'].parentDomainId, 'domain-a');
assert.equal(graph.domains['domain-c'].collapsed, true);
assert.equal(graph.domains['domain-a'].domainIds.includes('domain-c'), true);

const duplicateDomainResult = ontology.createDomain(graph, {
  id: 'domain-c',
  name: 'Duplicate Domain',
});
assert.equal(duplicateDomainResult.changed, false);
assert.equal(duplicateDomainResult.warnings[0].code, 'DOMAIN_ID_DUPLICATE');

const missingParentDomainResult = ontology.createDomain(graph, {
  id: 'domain-missing-parent',
  name: 'Missing Parent Domain',
  parentDomainId: 'missing-domain',
});
assert.equal(missingParentDomainResult.changed, false);
assert.equal(missingParentDomainResult.warnings[0].code, 'DOMAIN_PARENT_MISSING');

const createNodeResult = ontology.createClassNode(graph, {
  id: 'class-a',
  name: 'Class A',
  domainId: 'domain-a',
  subgraphId: rootSubgraphId,
  fields: [
    {
      id: 'class-a:field:mission',
      name: 'mission',
      value: 'Coordinate ontology behavior',
      dataType: 'text',
      category: 'attribute',
    },
  ],
});

assert.equal(createNodeResult.changed, true);
assertDeepPlainEqual(createNodeResult.warnings, []);
graph = createNodeResult.graph;
assert.equal(graph.nodes['class-a'].type, 'Class');
assert.equal(graph.nodes['class-a'].domainId, 'domain-a');
assert.equal(graph.domains['domain-a'].nodeIds.includes('class-a'), true);
assert.equal(graph.subgraphs[rootSubgraphId].nodeIds.includes('class-a'), true);

const duplicateNodeResult = ontology.createClassNode(graph, {
  id: 'class-a',
  name: 'Duplicate Class',
});
assert.equal(duplicateNodeResult.changed, false);
assert.equal(duplicateNodeResult.warnings[0].code, 'NODE_ID_DUPLICATE');
assert.equal(duplicateNodeResult.graph, graph);

const updateFieldsResult = ontology.updateNodeFields(graph, {
  nodeId: 'class-a',
  fields: [
    {
      id: 'class-a:field:constraint',
      name: 'constraint',
      value: 'Must keep semantic and view state separate',
      dataType: 'text',
      category: 'constraint',
    },
  ],
});
assert.equal(updateFieldsResult.changed, true);
graph = updateFieldsResult.graph;
assertDeepPlainEqual(
  graph.nodes['class-a'].fields.map(field => field.category),
  ['constraint'],
  'updateNodeFields should replace fields'
);

const duplicateFieldResult = ontology.updateNodeFields(graph, {
  nodeId: 'class-a',
  fields: [
    {
      id: 'duplicate-field',
      name: 'first',
      category: 'attribute',
    },
    {
      id: 'duplicate-field',
      name: 'second',
      category: 'attribute',
    },
  ],
});
assert.equal(duplicateFieldResult.changed, false);
assert.equal(duplicateFieldResult.warnings[0].code, 'NODE_FIELD_ID_DUPLICATE');

const updateNodeResult = ontology.updateOntologyNode(graph, {
  nodeId: 'class-a',
  name: 'Class A Updated',
  type: 'Function',
  description: 'Updated class description',
  tags: ['updated', 'ontology'],
  fields: [
    {
      id: 'class-a:field:behavior',
      name: 'behavior',
      value: 'Runs through ontology command',
      dataType: 'text',
      category: 'behavior',
    },
  ],
  metadata: {
    source: 'node-editor-test',
  },
});
assert.equal(updateNodeResult.changed, true);
graph = updateNodeResult.graph;
assert.equal(graph.nodes['class-a'].name, 'Class A Updated');
assert.equal(graph.nodes['class-a'].type, 'Function');
assert.equal(graph.nodes['class-a'].description, 'Updated class description');
assert.deepEqual(toPlainValue(graph.nodes['class-a'].tags), ['updated', 'ontology']);
assert.equal(graph.nodes['class-a'].fields[0].category, 'behavior');
assert.equal(graph.nodes['class-a'].metadata.source, 'node-editor-test');

const invalidUpdateNodeResult = ontology.updateOntologyNode(graph, {
  nodeId: 'class-a',
  name: ' ',
});
assert.equal(invalidUpdateNodeResult.changed, false);
assert.equal(invalidUpdateNodeResult.warnings[0].code, 'NODE_NAME_EMPTY');

const duplicateUpdateNodeFieldResult = ontology.updateOntologyNode(graph, {
  nodeId: 'class-a',
  fields: [
    {
      id: 'class-a:field:duplicate',
      name: 'first',
      category: 'attribute',
    },
    {
      id: 'class-a:field:duplicate',
      name: 'second',
      category: 'attribute',
    },
  ],
});
assert.equal(duplicateUpdateNodeFieldResult.changed, false);
assert.equal(duplicateUpdateNodeFieldResult.warnings[0].code, 'NODE_FIELD_ID_DUPLICATE');

const updateDomainResult = ontology.updateOntologyDomain(graph, {
  domainId: 'domain-c',
  name: 'Domain C Updated',
  collapsed: false,
  metadata: {
    source: 'domain-editor-test',
  },
});
assert.equal(updateDomainResult.changed, true);
graph = updateDomainResult.graph;
assert.equal(graph.domains['domain-c'].name, 'Domain C Updated');
assert.equal(graph.domains['domain-c'].collapsed, false);
assert.equal(graph.domains['domain-c'].parentDomainId, 'domain-a');
assert.equal(graph.domains['domain-c'].metadata.source, 'domain-editor-test');

const invalidUpdateDomainResult = ontology.updateOntologyDomain(graph, {
  domainId: 'domain-c',
  parentDomainId: 'domain-c',
});
assert.equal(invalidUpdateDomainResult.changed, false);
assert.equal(invalidUpdateDomainResult.warnings[0].code, 'DOMAIN_PARENT_SELF');

const relationResult = ontology.createSemanticRelation(graph, {
  id: 'edge-class-function',
  source: 'class-a',
  target: 'function-a',
  relation: 'DefinesBehavior',
});
assert.equal(relationResult.changed, true);
graph = relationResult.graph;
assert.equal(graph.edges['edge-class-function'].relation, 'DefinesBehavior');
assert.equal(graph.edges['edge-class-function'].domainId, 'domain-a');
assert.equal(graph.subgraphs[rootSubgraphId].edgeIds.includes('edge-class-function'), true);

const updateRelationResult = ontology.updateSemanticRelation(graph, {
  edgeId: 'edge-class-function',
  relation: 'ProvidesService',
  direction: 'bidirectional',
  metadata: {
    source: 'test-update',
  },
});
assert.equal(updateRelationResult.changed, true);
graph = updateRelationResult.graph;
assert.equal(graph.edges['edge-class-function'].relation, 'ProvidesService');
assert.equal(graph.edges['edge-class-function'].direction, 'bidirectional');
assert.equal(graph.edges['edge-class-function'].metadata.source, 'test-update');

const invalidUpdateRelationResult = ontology.updateSemanticRelation(graph, {
  edgeId: 'edge-class-function',
  relation: ' ',
});
assert.equal(invalidUpdateRelationResult.changed, false);
assert.equal(invalidUpdateRelationResult.warnings[0].code, 'EDGE_RELATION_EMPTY');

const invalidRelationResult = ontology.createSemanticRelation(graph, {
  id: 'edge-invalid',
  source: 'missing',
  target: 'function-a',
  relation: 'RelatedTo',
});
assert.equal(invalidRelationResult.changed, false);
assert.equal(invalidRelationResult.warnings[0].code, 'EDGE_SOURCE_MISSING');

const moveResult = ontology.moveNodeToDomain(graph, {
  nodeId: 'component-a',
  domainId: 'domain-a',
});
assert.equal(moveResult.changed, true);
graph = moveResult.graph;
assert.equal(graph.nodes['component-a'].domainId, 'domain-a');
assert.equal(graph.domains['domain-a'].nodeIds.includes('component-a'), true);
assert.equal(graph.domains['domain-b'].nodeIds.includes('component-a'), false);

const removeFromDomainResult = ontology.moveNodeToDomain(graph, {
  nodeId: 'component-a',
});
assert.equal(removeFromDomainResult.changed, true);
graph = removeFromDomainResult.graph;
assert.equal(graph.nodes['component-a'].domainId, undefined);
assert.equal(graph.domains['domain-a'].nodeIds.includes('component-a'), false);

const deleteResult = ontology.deleteOntologyElements(graph, {
  ids: ['domain-a'],
});
assert.equal(deleteResult.changed, true);
graph = deleteResult.graph;
assert.equal(graph.domains['domain-a'], undefined);
assert.equal(graph.domains['domain-c'], undefined, 'child domains should be deleted with parent domain');
assert.equal(graph.nodes['class-a'], undefined);
assert.equal(graph.nodes['function-a'], undefined);
assert.equal(graph.nodes['information-a'], undefined);
assert.equal(graph.edges['edge-class-function'], undefined, 'incident relation should be deleted');
assert.equal(graph.subgraphs[rootSubgraphId].nodeIds.includes('class-a'), false);
assert.equal(graph.subgraphs[rootSubgraphId].edgeIds.includes('edge-class-function'), false);

const missingDeleteResult = ontology.deleteOntologyElements(graph, {
  ids: ['missing-element'],
});
assert.equal(missingDeleteResult.changed, false);
assert.equal(missingDeleteResult.warnings[0].code, 'DELETE_TARGET_MISSING');

const validation = ontology.validateOntologyGraph(graph);
assert.equal(validation.valid, true);
assertDeepPlainEqual(validation.issues, [], 'command-updated graph should validate');

console.log('Ontology command runtime tests passed.');
