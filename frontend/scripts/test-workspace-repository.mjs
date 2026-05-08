import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);
const featureModel = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/model/index.ts'));
const workspaceTypes = loadTypeScriptModule(path.join(projectRoot, 'types/workspace/models.ts'));
const workspaceStorageTypes = loadTypeScriptModule(path.join(projectRoot, 'types/workspace/storage.ts'));
const workspaceRepository = loadTypeScriptModule(path.join(projectRoot, 'data-layer/workspace/index.ts'));

const emptyCanvas = workspaceTypes.DEFAULT_CANVAS;
assert.equal(emptyCanvas.ontologyDocument.graph.id, emptyCanvas.id);
assert.equal(emptyCanvas.ontologyDocument.graph.name, emptyCanvas.name);

const document = featureModel.createOntologyDocumentState({
  id: 'canvas-a',
  name: 'Canvas A',
  view: {
    viewport: {
      x: 12,
      y: -24,
      zoom: 0.75,
    },
  },
});

const snapshot = featureModel.createPersistedOntologyCanvas(
  document,
  new Date('2026-01-01T00:00:00.000Z')
);
assert.equal(snapshot.persistenceVersion, 1);
assert.equal(snapshot.graph.id, 'canvas-a');
assert.equal(snapshot.view.viewport.zoom, 0.75);

const restoredDocument = featureModel.restoreOntologyDocumentFromPersistedCanvas(snapshot, {
  id: 'fallback-canvas',
  name: 'Fallback Canvas',
});
assert.equal(restoredDocument.graph.id, 'canvas-a');
assert.equal(restoredDocument.graph.name, 'Canvas A');
assert.equal(restoredDocument.view.viewport.x, 12);

const canvas = {
  ...emptyCanvas,
  id: 'canvas-a',
  name: 'Canvas A',
  ontologyDocument: snapshot,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

assert.equal(workspaceRepository.loadOntologyCanvas(canvas), snapshot);
const canvasWithSavedOntology = workspaceRepository.saveOntologyCanvas(canvas, snapshot);
assert.equal(canvasWithSavedOntology.viewportState.zoom, 0.75);
assert.equal(canvasWithSavedOntology.ontologyDocument.graph.id, 'canvas-a');

const storageData = workspaceRepository.createWorkspaceStorageData({
  userId: 'user_0',
  currentCanvasId: 'canvas-a',
  canvases: [canvasWithSavedOntology],
  canvasTree: [
    {
      id: 'canvas-a',
      name: 'Canvas A',
      isCollapsed: false,
      children: [],
    },
  ],
}, new Date('2026-01-02T00:00:00.000Z'));

assert.equal(storageData.version, '1.0.0');
assert.equal(storageData.workspace.canvases[0].ontologyDocument.graph.id, 'canvas-a');

const defaultWorkspaceFile = JSON.parse(
  await readFile(path.join(projectRoot, 'public/workspace/kg-editor:workspace.json'), 'utf8')
);
const parsedDefaultWorkspace = workspaceStorageTypes.StorageDataSchema.parse(defaultWorkspaceFile);
assert.equal(parsedDefaultWorkspace.workspace.canvases[0].ontologyDocument.graph.id, 'canvas_ontology_root');

const savedRequests = [];
globalThis.fetch = async (url, options) => {
  savedRequests.push({ url, options });

  if (String(url).startsWith('/api/workspace/load')) {
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(JSON.stringify(storageData)),
    };
  }

  if (url === '/api/workspace/save') {
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    };
  }

  throw new Error(`Unexpected request: ${url}`);
};

const loadedStorage = await workspaceRepository.loadWorkspaceStorage();
assert.equal(loadedStorage.workspace.currentCanvasId, 'canvas-a');
assert.equal(loadedStorage.workspace.canvases[0].ontologyDocument.graph.id, 'canvas-a');
assert.equal(savedRequests[0].url, '/api/workspace/load?key=kg-editor%3Aworkspace.json');

const saveResult = await workspaceRepository.saveWorkspace(storageData.workspace);
assert.equal(saveResult, true);
const saveBody = JSON.parse(savedRequests[1].options.body);
assert.equal(saveBody.key, 'kg-editor:workspace.json');
assert.equal(saveBody.data.workspace.canvases[0].ontologyDocument.graph.name, 'Canvas A');

console.log('Workspace repository tests passed.');
