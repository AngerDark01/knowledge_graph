import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);
const ontology = loadTypeScriptModule(path.join(projectRoot, 'domain/ontology/index.ts'));
const featureModel = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/model/index.ts'));

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));

const assertDeepPlainEqual = (actual, expected, message) => {
  assert.deepEqual(toPlainValue(actual), expected, message);
};

const baseGraph = ontology.createOntologyGraph({
  id: 'ontology-document',
  name: 'Ontology Document',
  domains: {
    'domain-a': {
      id: 'domain-a',
      name: 'Domain A',
      nodeIds: [],
      domainIds: [],
      collapsed: false,
    },
  },
  subgraphs: {
    root: {
      id: 'root',
      name: 'Root',
      nodeIds: [],
      edgeIds: [],
    },
  },
});

const document = featureModel.createOntologyDocumentState({
  id: 'ontology-document',
  name: 'Ontology Document',
  graph: baseGraph,
});

assert.equal(document.revision, 0);
assert.deepEqual(Object.keys(document.graph.nodes), []);
assertDeepPlainEqual(document.view.viewport, { x: 0, y: 0, zoom: 1 });
assertDeepPlainEqual(document.view.domainViews['domain-a'], {
  id: 'domain-a',
  position: { x: 0, y: 0 },
  width: 300,
  height: 200,
  collapsed: false,
});

const createDomainResult = featureModel.createOntologyDomainInDocument(document, {
  id: 'domain-b',
  name: 'Domain B',
  parentDomainId: 'domain-a',
  collapsed: true,
  position: { x: 32, y: 48 },
  width: 640,
  height: 360,
});

assert.equal(createDomainResult.changed, true);
assert.equal(createDomainResult.document.revision, 1);
assert.equal(createDomainResult.document.graph.domains['domain-b'].name, 'Domain B');
assert.equal(createDomainResult.document.graph.domains['domain-b'].parentDomainId, 'domain-a');
assert.equal(createDomainResult.document.graph.domains['domain-a'].domainIds.includes('domain-b'), true);
assertDeepPlainEqual(createDomainResult.document.view.domainViews['domain-b'], {
  id: 'domain-b',
  position: { x: 32, y: 48 },
  width: 640,
  height: 360,
  collapsed: true,
});

const createResult = featureModel.createOntologyClassNodeInDocument(createDomainResult.document, {
  id: 'function-a',
  name: 'Function A',
  type: 'Function',
  domainId: 'domain-a',
  subgraphId: 'root',
  position: { x: 120, y: 240 },
  width: 420,
  height: 260,
  fields: [
    {
      id: 'function-a:field:behavior',
      name: 'behavior',
      value: 'Transforms information',
      dataType: 'text',
      category: 'behavior',
    },
  ],
});

assert.equal(createResult.changed, true);
assertDeepPlainEqual(createResult.warnings, []);
assert.equal(createResult.document.revision, 2);
assert.equal(createResult.document.graph.nodes['function-a'].type, 'Function');
assert.equal(createResult.document.graph.nodes['function-a'].name, 'Function A');
assert.equal(createResult.document.graph.nodes['function-a'].domainId, 'domain-a');
assert.equal(createResult.document.graph.nodes['function-a'].subgraphId, 'root');
assert.equal(createResult.document.graph.domains['domain-a'].nodeIds.includes('function-a'), true);
assert.equal(createResult.document.graph.subgraphs.root.nodeIds.includes('function-a'), true);
assert.equal(createResult.document.graph.nodes['function-a'].position, undefined);
assert.equal(createResult.document.graph.nodes['function-a'].width, undefined);
assertDeepPlainEqual(createResult.document.view.nodeViews['function-a'], {
  id: 'function-a',
  position: { x: 120, y: 240 },
  width: 420,
  height: 260,
});

const nodeViewModel = featureModel.buildOntologyNodeViewModel(createResult.document, 'function-a');
assert.ok(nodeViewModel);
assertDeepPlainEqual(
  nodeViewModel.sections.map(section => section.id),
  ['fields', 'methods', 'rules', 'interfaces'],
  'node view model should expose empty field sections so full LOD can add into them'
);
assertDeepPlainEqual(
  nodeViewModel.sections.map(section => ({
    id: section.id,
    count: section.items.length,
  })),
  [
    { id: 'fields', count: 0 },
    { id: 'methods', count: 1 },
    { id: 'rules', count: 0 },
    { id: 'interfaces', count: 0 },
  ]
);

const updateNodeResult = featureModel.updateOntologyNodeInDocument(createResult.document, {
  nodeId: 'function-a',
  name: 'Function A Updated',
  type: 'Component',
  description: 'Updated through document use-case',
  tags: ['updated'],
  domainId: null,
  fields: [
    {
      id: 'function-a:field:interface',
      name: 'interface',
      value: 'REST',
      dataType: 'string',
      category: 'interface',
    },
  ],
});
assert.equal(updateNodeResult.changed, true);
assert.equal(updateNodeResult.document.revision, 3);
assert.equal(updateNodeResult.document.graph.nodes['function-a'].name, 'Function A Updated');
assert.equal(updateNodeResult.document.graph.nodes['function-a'].type, 'Component');
assert.equal(updateNodeResult.document.graph.nodes['function-a'].domainId, undefined);
assert.equal(updateNodeResult.document.graph.domains['domain-a'].nodeIds.includes('function-a'), false);
assert.equal(updateNodeResult.document.view.nodeViews['function-a'].position.x, 120);

const updateDomainResult = featureModel.updateOntologyDomainInDocument(createDomainResult.document, {
  domainId: 'domain-b',
  name: 'Domain B Updated',
  parentDomainId: null,
  collapsed: false,
  metadata: {
    source: 'document-test',
  },
});
assert.equal(updateDomainResult.changed, true);
assert.equal(updateDomainResult.document.revision, 2);
assert.equal(updateDomainResult.document.graph.domains['domain-b'].name, 'Domain B Updated');
assert.equal(updateDomainResult.document.graph.domains['domain-b'].parentDomainId, undefined);
assert.equal(updateDomainResult.document.graph.domains['domain-a'].domainIds.includes('domain-b'), false);
assert.equal(updateDomainResult.document.view.domainViews['domain-b'].collapsed, false);

const duplicateResult = featureModel.createOntologyClassNodeInDocument(createResult.document, {
  id: 'function-a',
  name: 'Duplicate Function',
  position: { x: 1, y: 2 },
});

assert.equal(duplicateResult.changed, false);
assert.equal(duplicateResult.document, createResult.document);
assert.equal(duplicateResult.warnings[0].code, 'NODE_ID_DUPLICATE');

const defaultTypeResult = featureModel.createOntologyClassNodeInDocument(createResult.document, {
  id: 'class-a',
  name: 'Class A',
  position: { x: Number.NaN, y: 12 },
});

assert.equal(defaultTypeResult.changed, true);
assert.equal(defaultTypeResult.document.graph.nodes['class-a'].type, 'Class');
assertDeepPlainEqual(defaultTypeResult.document.view.nodeViews['class-a'], {
  id: 'class-a',
  position: { x: 0, y: 12 },
  width: 350,
  height: 280,
});

const validation = ontology.validateOntologyGraph(defaultTypeResult.document.graph);
assert.equal(validation.valid, true);
assertDeepPlainEqual(validation.issues, [], 'ontology document graph should validate');

const relationResult = featureModel.createOntologyRelationInDocument(defaultTypeResult.document, {
  id: 'edge-function-class',
  source: 'function-a',
  target: 'class-a',
  relation: 'Produces',
  direction: 'unidirectional',
  sourceHandle: 'right',
  targetHandle: 'left',
});

assert.equal(relationResult.changed, true);
assert.equal(relationResult.document.revision, 4);
assert.equal(relationResult.document.graph.edges['edge-function-class'].relation, 'Produces');
assert.equal(relationResult.document.graph.edges['edge-function-class'].direction, 'unidirectional');
assertDeepPlainEqual(relationResult.document.view.edgeViews['edge-function-class'], {
  id: 'edge-function-class',
  sourceHandle: 'right',
  targetHandle: 'left',
});

const updateRelationResult = featureModel.updateOntologyRelationInDocument(relationResult.document, {
  edgeId: 'edge-function-class',
  relation: 'Consumes',
  direction: 'bidirectional',
});
assert.equal(updateRelationResult.changed, true);
assert.equal(updateRelationResult.document.revision, 5);
assert.equal(updateRelationResult.document.graph.edges['edge-function-class'].relation, 'Consumes');
assert.equal(updateRelationResult.document.graph.edges['edge-function-class'].direction, 'bidirectional');

const movedDocument = featureModel.updateOntologyNodeViewInDocument(updateRelationResult.document, {
  nodeId: 'function-a',
  position: { x: 360, y: 420 },
  width: 480,
  height: 300,
  expanded: true,
  collapsedSections: ['fields', 'relationships', 'fields'],
});
assert.equal(movedDocument.revision, 6);
assertDeepPlainEqual(movedDocument.view.nodeViews['function-a'], {
  id: 'function-a',
  position: { x: 360, y: 420 },
  width: 480,
  height: 300,
  expanded: true,
  collapsedSections: ['fields', 'relationships'],
});

const resizedDomainDocument = featureModel.updateOntologyDomainViewInDocument(movedDocument, {
  domainId: 'domain-a',
  position: { x: 10, y: 20 },
  width: 700,
  height: 500,
  collapsed: true,
});
assert.equal(resizedDomainDocument.revision, 7);
assertDeepPlainEqual(resizedDomainDocument.view.domainViews['domain-a'], {
  id: 'domain-a',
  position: { x: 10, y: 20 },
  width: 700,
  height: 500,
  collapsed: true,
});

const viewportDocument = featureModel.updateOntologyViewportInDocument(resizedDomainDocument, {
  x: -100,
  y: -50,
  zoom: 0.65,
});
assert.equal(viewportDocument.revision, 8);
assertDeepPlainEqual(viewportDocument.view.viewport, {
  x: -100,
  y: -50,
  zoom: 0.65,
});

const deleteElementsResult = featureModel.deleteOntologyElementsInDocument(viewportDocument, {
  ids: ['function-a'],
});
assert.equal(deleteElementsResult.changed, true);
assert.equal(deleteElementsResult.document.revision, 9);
assert.equal(deleteElementsResult.document.graph.nodes['function-a'], undefined);
assert.equal(deleteElementsResult.document.graph.edges['edge-function-class'], undefined);
assert.equal(deleteElementsResult.document.view.nodeViews['function-a'], undefined);
assert.equal(deleteElementsResult.document.view.edgeViews['edge-function-class'], undefined);

console.log('Ontology document model tests passed.');
