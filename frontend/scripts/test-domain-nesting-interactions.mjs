import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);
const ontology = loadTypeScriptModule(path.join(projectRoot, 'domain/ontology/index.ts'));
const featureModel = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/model/index.ts'));

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));

const graph = ontology.createOntologyGraph({
  id: 'domain-nesting',
  name: 'Domain Nesting',
  domains: {
    parent: {
      id: 'parent',
      name: 'Parent Domain',
      nodeIds: [],
      domainIds: ['domain-a'],
      collapsed: false,
    },
    'domain-a': {
      id: 'domain-a',
      name: 'Domain A',
      nodeIds: ['class-a'],
      domainIds: ['domain-b'],
      parentDomainId: 'parent',
      collapsed: false,
    },
    'domain-b': {
      id: 'domain-b',
      name: 'Domain B',
      nodeIds: ['class-b'],
      domainIds: [],
      parentDomainId: 'domain-a',
      collapsed: false,
    },
  },
  nodes: {
    'class-a': {
      id: 'class-a',
      name: 'Class A',
      type: 'Class',
      fields: [],
      tags: [],
      domainId: 'domain-a',
    },
    'class-b': {
      id: 'class-b',
      name: 'Class B',
      type: 'Component',
      fields: [],
      tags: [],
      domainId: 'domain-b',
    },
  },
});

const document = featureModel.createOntologyDocumentState({
  id: 'domain-nesting',
  name: 'Domain Nesting',
  graph,
  view: {
    domainViews: {
      parent: {
        id: 'parent',
        position: { x: 40, y: 40 },
        width: 400,
        height: 360,
        collapsed: false,
      },
      'domain-a': {
        id: 'domain-a',
        position: { x: 100, y: 100 },
        width: 300,
        height: 220,
        collapsed: false,
      },
      'domain-b': {
        id: 'domain-b',
        position: { x: 150, y: 180 },
        width: 250,
        height: 210,
        collapsed: false,
      },
    },
    nodeViews: {
      'class-a': {
        id: 'class-a',
        position: { x: 130, y: 180 },
        width: 120,
        height: 80,
      },
      'class-b': {
        id: 'class-b',
        position: { x: 180, y: 260 },
        width: 100,
        height: 70,
      },
    },
  },
});

const descendants = featureModel.collectDomainDescendantViewIds(document, 'domain-a');
assert.deepEqual(toPlainValue(descendants.nodeIds.sort()), ['class-a', 'class-b']);
assert.deepEqual(toPlainValue(descendants.domainIds), ['domain-b']);

const absolutePosition = featureModel.projectReactFlowPositionToAbsolute(document, {
  parentDomainId: 'domain-a',
  position: { x: 35, y: 45 },
});
assert.deepEqual(toPlainValue(absolutePosition.position), { x: 135, y: 145 });

const constrained = featureModel.constrainNodePositionToDomain(document, {
  nodeId: 'class-a',
  position: { x: -500, y: -500 },
});
assert.deepEqual(toPlainValue(constrained.position), { x: 120, y: 170 });

const dragNodePatch = featureModel.commitNodeDrag(document, {
  nodeId: 'class-a',
  reactFlowPosition: { x: -500, y: -500 },
});
assert.deepEqual(toPlainValue(dragNodePatch.nodeViews['class-a'].position), { x: 120, y: 170 });
assert.equal(document.view.nodeViews['class-a'].position.x, 130);

const domainDragPatch = featureModel.commitDomainDrag(document, {
  domainId: 'domain-a',
  reactFlowPosition: { x: 160, y: 180 },
});
assert.deepEqual(toPlainValue(domainDragPatch.domainViews['domain-a'].position), { x: 200, y: 220 });
assert.deepEqual(toPlainValue(domainDragPatch.domainViews['domain-b'].position), { x: 250, y: 300 });
assert.deepEqual(toPlainValue(domainDragPatch.nodeViews['class-a'].position), { x: 230, y: 300 });
assert.deepEqual(toPlainValue(domainDragPatch.nodeViews['class-b'].position), { x: 280, y: 380 });
assert.ok(domainDragPatch.domainViews.parent.width > document.view.domainViews.parent.width);

const resizedNodePatch = featureModel.commitNodeResize(document, {
  nodeId: 'class-a',
  width: 360,
  height: 120,
  expanded: true,
  customExpandedSize: { width: 360, height: 120 },
});
assert.equal(resizedNodePatch.nodeViews['class-a'].width, 360);
assert.equal(resizedNodePatch.nodeViews['class-a'].expanded, true);
assert.deepEqual(toPlainValue(resizedNodePatch.nodeViews['class-a'].customExpandedSize), { width: 360, height: 120 });
assert.ok(resizedNodePatch.domainViews['domain-a'].width > document.view.domainViews['domain-a'].width);

const expandedDocument = featureModel.applyOntologyInteractionPatch(document, resizedNodePatch);
assert.equal(expandedDocument.view.nodeViews['class-a'].expanded, true);
assert.ok(expandedDocument.view.domainViews['domain-a'].width > document.view.domainViews['domain-a'].width);

const patchedDocument = featureModel.applyOntologyInteractionPatch(document, domainDragPatch);
assert.equal(patchedDocument.revision, document.revision + 1);
assert.deepEqual(toPlainValue(patchedDocument.view.domainViews['domain-b'].position), { x: 250, y: 300 });
assert.equal(document.view.domainViews['domain-b'].position.x, 150);

console.log('Domain nesting interaction tests passed.');
