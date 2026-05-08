import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);
const ontology = loadTypeScriptModule(path.join(projectRoot, 'domain/ontology/index.ts'));
const featureModel = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/model/index.ts'));
const stateModule = loadTypeScriptModule(
  path.join(projectRoot, 'features/ontology-canvas/state/ontologyDocumentStore.ts')
);

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));

const store = stateModule.useOntologyDocumentStore;

const graph = ontology.createOntologyGraph({
  id: 'store-document',
  name: 'Store Document',
  domains: {
    'domain-a': {
      id: 'domain-a',
      name: 'Domain A',
      nodeIds: [],
      domainIds: [],
      collapsed: false,
    },
  },
});
const document = featureModel.createOntologyDocumentState({
  id: 'store-document',
  name: 'Store Document',
  graph,
});

store.getState().replaceDocument(document, {
  canvasId: 'canvas-a',
  reason: 'test-replace',
});

assert.equal(store.getState().hydrated, true);
assert.equal(store.getState().sourceCanvasId, 'canvas-a');
assert.equal(store.getState().document.graph.id, 'store-document');

const createResult = featureModel.createOntologyClassNodeInDocument(store.getState().document, {
  id: 'class-a',
  name: 'Class A',
  domainId: 'domain-a',
  position: { x: 10, y: 20 },
});

const applied = store.getState().applyCommandResult(createResult, {
  canvasId: 'canvas-a',
  reason: 'test-apply-command',
});
assert.equal(applied, true);
assert.equal(store.getState().document.graph.nodes['class-a'].name, 'Class A');
assert.equal(store.getState().document.view.nodeViews['class-a'].position.x, 10);

const updateNodeResult = featureModel.updateOntologyNodeInDocument(store.getState().document, {
  nodeId: 'class-a',
  name: 'Class A Updated',
  description: 'Saved by inspector',
  tags: ['inspector'],
});
const updateApplied = store.getState().applyCommandResult(updateNodeResult, {
  canvasId: 'canvas-a',
  reason: 'test-update-node',
});
assert.equal(updateApplied, true);
assert.equal(store.getState().document.graph.nodes['class-a'].name, 'Class A Updated');
assert.equal(store.getState().document.graph.nodes['class-a'].description, 'Saved by inspector');
assert.deepEqual(toPlainValue(store.getState().document.graph.nodes['class-a'].tags), ['inspector']);

store.getState().updateNodeView({
  nodeId: 'class-a',
  position: { x: 88, y: 99 },
  width: 500,
  height: 300,
}, {
  canvasId: 'canvas-a',
  reason: 'test-update-node-view',
});

assert.equal(store.getState().document.view.nodeViews['class-a'].position.x, 88);
assert.equal(store.getState().document.view.nodeViews['class-a'].width, 500);

const patchedDocument = store.getState().applyInteractionPatch({
  nodeViews: {
    'class-a': {
      position: { x: 120, y: 130 },
    },
  },
  domainViews: {
    'domain-a': {
      width: 640,
    },
  },
}, {
  canvasId: 'canvas-a',
  reason: 'test-apply-interaction-patch',
});
assert.notEqual(patchedDocument, null);
assert.equal(store.getState().document.view.nodeViews['class-a'].position.x, 120);
assert.equal(store.getState().document.view.domainViews['domain-a'].width, 640);

store.getState().updateViewport({
  x: -10,
  y: -20,
  zoom: 0.5,
}, {
  canvasId: 'canvas-a',
  reason: 'test-update-viewport',
});
assert.equal(store.getState().document.view.viewport.zoom, 0.5);

const deleted = store.getState().deleteElements({
  ids: ['class-a'],
}, {
  canvasId: 'canvas-a',
  reason: 'test-delete',
});
assert.equal(deleted, true);
assert.equal(store.getState().document.graph.nodes['class-a'], undefined);
assert.equal(store.getState().document.view.nodeViews['class-a'], undefined);

console.log('Ontology document store tests passed.');
