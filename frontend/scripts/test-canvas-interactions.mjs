import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);
const interactions = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/model/interactions/index.ts'));
const documentModel = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/model/document/index.ts'));

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));

const expansionConfig = {
  collapsedSize: { width: 350, height: 280 },
  expandedSize: { width: 600, height: 450 },
};

assert.equal(interactions.resolveNodeExpandedState({ isExpanded: true }, false), true);
assert.equal(interactions.resolveNodeExpandedState({ data: { isExpanded: true } }, false), true);
assert.equal(interactions.resolveNodeExpandedState(null, true), true);

const customExpansionPatch = interactions.createNodeExpansionPatch(
  { customExpandedSize: { width: 720, height: 520 } },
  true,
  expansionConfig
);
assert.deepEqual(toPlainValue(customExpansionPatch), {
  isExpanded: true,
  width: 720,
  height: 520,
  data: {
    isExpanded: true,
  },
});

const collapsePatch = interactions.createNodeExpansionPatch(
  { isExpanded: true, width: 720, height: 520 },
  false,
  expansionConfig
);
assert.deepEqual(toPlainValue(collapsePatch), {
  isExpanded: false,
  width: 350,
  height: 280,
  data: {
    isExpanded: false,
  },
});

assert.deepEqual(
  toPlainValue(interactions.getCustomExpandedSizeToPersist(
    { isExpanded: true, width: 720, height: 520 },
    expansionConfig
  )),
  { width: 720, height: 520 }
);
assert.equal(
  interactions.getCustomExpandedSizeToPersist(
    { isExpanded: true, width: 600, height: 450 },
    expansionConfig
  ),
  null
);
assert.deepEqual(
  toPlainValue(interactions.getCustomExpandedSizeToPersist(
    {
      isExpanded: true,
      customExpandedSize: { width: 720, height: 520 },
      width: 760,
      height: 540,
    },
    expansionConfig
  )),
  { width: 760, height: 540 }
);

assert.equal(
  interactions.createUniqueOntologyFieldName(
    [
      { name: 'attribute' },
      { name: 'attribute2' },
    ],
    'attribute'
  ),
  'attribute3'
);

const nextFields = interactions.appendDefaultOntologyField({
  id: 'class-a',
  name: 'Class A',
  type: 'Class',
  fields: [
    {
      id: 'class-a:field:attribute',
      name: 'attribute',
      dataType: 'string',
      category: 'attribute',
    },
  ],
  tags: [],
}, {
  fieldId: 'class-a:field:test',
});
assert.deepEqual(toPlainValue(nextFields.at(-1)), {
  id: 'class-a:field:test',
  name: 'attribute2',
  dataType: 'string',
  category: 'attribute',
});

assert.deepEqual(
  toPlainValue(interactions.getDefaultOntologyFieldInputForCategory('behavior')),
  {
    category: 'behavior',
    dataType: 'function',
    namePrefix: 'method',
  }
);

const methodFields = interactions.appendDefaultOntologyField({
  id: 'class-a',
  name: 'Class A',
  type: 'Class',
  fields: nextFields,
  tags: [],
}, {
  ...interactions.getDefaultOntologyFieldInputForCategory('behavior'),
  fieldId: 'class-a:field:method',
});
assert.deepEqual(toPlainValue(methodFields.at(-1)), {
  id: 'class-a:field:method',
  name: 'method',
  dataType: 'function',
  category: 'behavior',
});

const interfaceFields = interactions.appendDefaultOntologyField({
  id: 'class-a',
  name: 'Class A',
  type: 'Class',
  fields: methodFields,
  tags: [],
}, {
  ...interactions.getDefaultOntologyFieldInputForCategory('interface'),
  fieldId: 'class-a:field:interface',
});
assert.deepEqual(toPlainValue(interfaceFields.at(-1)), {
  id: 'class-a:field:interface',
  name: 'interface',
  dataType: 'string',
  category: 'interface',
});

const editableFields = [
  {
    id: 'class-a:field:name',
    name: 'name',
    value: 'old value',
    dataType: 'string',
    category: 'attribute',
  },
];
const updatedFields = interactions.updateOntologyField(editableFields, 'class-a:field:name', {
  name: ' displayName ',
  value: '',
  dataType: ' text ',
  category: 'behavior',
});
assert.deepEqual(toPlainValue(updatedFields), [
  {
    id: 'class-a:field:name',
    name: 'displayName',
    dataType: 'text',
    category: 'behavior',
  },
]);
assert.equal(
  interactions.updateOntologyField(editableFields, 'class-a:field:name', { name: '   ' }),
  editableFields,
  'blank field name should keep the previous field list'
);
assert.equal(
  interactions.updateOntologyField(editableFields, 'missing-field', { name: 'ignored' }),
  editableFields,
  'missing field id should keep the previous field list'
);

const sortableFields = [
  {
    id: 'field-a',
    name: 'a',
    dataType: 'string',
    category: 'attribute',
  },
  {
    id: 'field-b',
    name: 'b',
    dataType: 'string',
    category: 'behavior',
  },
  {
    id: 'field-c',
    name: 'c',
    dataType: 'string',
    category: 'attribute',
  },
];
assert.deepEqual(
  toPlainValue(interactions.deleteOntologyField(sortableFields, 'field-b')),
  [
    {
      id: 'field-a',
      name: 'a',
      dataType: 'string',
      category: 'attribute',
    },
    {
      id: 'field-c',
      name: 'c',
      dataType: 'string',
      category: 'attribute',
    },
  ]
);
assert.equal(
  interactions.deleteOntologyField(sortableFields, 'missing-field'),
  sortableFields,
  'deleting a missing field should keep the previous field list'
);
assert.deepEqual(
  toPlainValue(interactions.moveOntologyField(
    sortableFields,
    'field-a',
    'down',
    ['field-a', 'field-c']
  ).map(field => field.id)),
  ['field-c', 'field-b', 'field-a'],
  'section-scoped move should swap with the next field in the visible section order'
);
assert.deepEqual(
  toPlainValue(interactions.moveOntologyField(
    sortableFields,
    'field-b',
    'up'
  ).map(field => field.id)),
  ['field-b', 'field-a', 'field-c'],
  'unscoped move should swap with the adjacent field'
);
assert.equal(
  interactions.moveOntologyField(sortableFields, 'field-a', 'up'),
  sortableFields,
  'moving the first field up should keep the previous field list'
);

const selectionDeletion = interactions.createCanvasSelectionDeletionPlan(
  [
    { id: 'node-a', selected: true },
    { id: 'node-b', selected: false },
  ],
  [
    { id: 'edge-covered-by-node-delete', source: 'node-a', target: 'node-b', selected: true },
    { id: 'edge-selected-alone', source: 'node-c', target: 'node-d', selected: true },
    { id: 'edge-not-selected', source: 'node-c', target: 'node-d', selected: false },
  ]
);
assert.deepEqual(toPlainValue(selectionDeletion), {
  nodeIds: ['node-a'],
  edgeIds: ['edge-selected-alone'],
});

const clearDeletion = interactions.createCanvasClearPlan(
  [
    { id: 'node-a' },
    { id: 'node-b' },
  ],
  [
    { id: 'edge-covered', source: 'node-a', target: 'node-b' },
    { id: 'edge-dangling', source: 'missing-a', target: 'missing-b' },
  ]
);
assert.deepEqual(toPlainValue(clearDeletion), {
  nodeIds: ['node-a', 'node-b'],
  edgeIds: ['edge-dangling'],
});

const resizeGate = interactions.createResizeCommitGate();
assert.equal(resizeGate.hasActiveResize(), false);
assert.equal(
  resizeGate.shouldCommitResizeEnd('node-from-lod'),
  false,
  'LOD dimensions change without a resizing start should not persist node size'
);
resizeGate.markResizing('node-a');
assert.equal(resizeGate.hasActiveResize(), true);
assert.equal(
  resizeGate.shouldCommitResizeEnd('node-a'),
  true,
  'user resize end after resizing start should persist node size'
);
assert.equal(resizeGate.hasActiveResize(), false);
assert.equal(
  resizeGate.shouldCommitResizeEnd('node-a'),
  false,
  'duplicate resize end should not persist twice'
);
resizeGate.markResizing('node-a');
resizeGate.markResizing('node-b');
resizeGate.clear('node-a');
assert.equal(resizeGate.shouldCommitResizeEnd('node-a'), false);
assert.equal(resizeGate.shouldCommitResizeEnd('node-b'), true);
assert.equal(resizeGate.hasActiveResize(), false);

const placementDocument = {
  graph: {
    id: 'placement-doc',
    name: 'Placement Doc',
    schemaVersion: 1,
    nodes: {
      'node-a': {
        id: 'node-a',
        name: 'Node A',
        type: 'Class',
        fields: [],
        tags: [],
      },
      'node-b': {
        id: 'node-b',
        name: 'Node B',
        type: 'Class',
        fields: [],
        tags: [],
        domainId: 'domain-a',
      },
    },
    edges: {},
    domains: {
      'domain-a': {
        id: 'domain-a',
        name: 'Domain A',
        nodeIds: ['node-b'],
        domainIds: [],
      },
    },
    subgraphs: {},
  },
  view: {
    nodeViews: {
      'node-a': {
        id: 'node-a',
        position: { x: 420, y: 40 },
        width: 80,
        height: 72,
      },
      'node-b': {
        id: 'node-b',
        position: { x: 70, y: 120 },
        width: 80,
        height: 72,
      },
    },
    domainViews: {
      'domain-a': {
        id: 'domain-a',
        position: { x: 50, y: 50 },
        width: 180,
        height: 160,
        collapsed: false,
      },
    },
    edgeViews: {},
    viewport: { x: 0, y: 0, zoom: 1 },
    lod: 'full',
    edgeVisibility: { mode: 'all', ids: [] },
  },
  revision: 0,
};
const movedToDomain = documentModel.updateOntologyNodeInDocument(placementDocument, {
  nodeId: 'node-a',
  domainId: 'domain-a',
});
assert.equal(movedToDomain.changed, true);
assert.equal(movedToDomain.document.graph.nodes['node-a'].domainId, 'domain-a');
assert.deepEqual(
  toPlainValue(movedToDomain.document.graph.domains['domain-a'].nodeIds),
  ['node-b', 'node-a'],
  'moving a node into a domain should update domain membership'
);
const placementPatch = interactions.createNodeDomainPlacementPatch(movedToDomain.document, {
  nodeId: 'node-a',
  domainId: 'domain-a',
});
assert.deepEqual(toPlainValue(placementPatch.nodeViews['node-a'].position), {
  x: 70,
  y: 216,
});
assert.equal(
  placementPatch.domainViews['domain-a'].height > placementDocument.view.domainViews['domain-a'].height,
  true,
  'domain boundary should expand when the assigned node needs more space'
);
const removedFromDomain = documentModel.updateOntologyNodeInDocument(movedToDomain.document, {
  nodeId: 'node-a',
  domainId: null,
});
assert.equal(removedFromDomain.changed, true);
assert.equal(removedFromDomain.document.graph.nodes['node-a'].domainId, undefined);
assert.deepEqual(
  toPlainValue(removedFromDomain.document.graph.domains['domain-a'].nodeIds),
  ['node-b'],
  'removing a node from a domain should update domain membership'
);

console.log('Canvas interaction model tests passed.');
