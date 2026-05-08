import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);
const editorDrafts = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/model/inspector/index.ts'));

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));

const edge = {
  id: 'edge-a',
  source: 'node-a',
  target: 'node-b',
  label: 'Produces',
  data: {
    color: '#FF0000',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    weight: 3,
    strength: 4,
    direction: 'bidirectional',
    customProperties: {
      relationship: 'OldRelationship',
      source: 'legacy',
    },
  },
  createdAt: new Date('2026-04-29T00:00:00Z'),
  updatedAt: new Date('2026-04-29T00:00:00Z'),
};

const edgeDraft = editorDrafts.createEdgeEditorDraft(edge);
assert.equal(edgeDraft.label, 'Produces');
assert.equal(edgeDraft.color, '#FF0000');
assert.equal(edgeDraft.direction, 'bidirectional');

const parsedCustomProperties = editorDrafts.parseCustomPropertiesText('{"domain":"Function","relationship":"DraftOverride"}');
assert.equal(parsedCustomProperties.ok, true);

const edgeUpdate = editorDrafts.buildEdgeUpdate(
  edge,
  {
    ...edgeDraft,
    label: 'Consumes',
  },
  parsedCustomProperties.value
);

assert.equal(edgeUpdate.label, 'Consumes');
assert.equal(edgeUpdate.data.customProperties.source, 'legacy');
assert.equal(edgeUpdate.data.customProperties.domain, 'Function');
assert.equal(edgeUpdate.data.customProperties.relation, 'Consumes');
assert.equal(edgeUpdate.data.customProperties.relationship, 'Consumes');

const invalidJson = editorDrafts.parseCustomPropertiesText('{"broken":');
assert.equal(invalidJson.ok, false);

const invalidShape = editorDrafts.parseCustomPropertiesText('[]');
assert.equal(invalidShape.ok, false);

const validEdgeSavePlan = editorDrafts.createEdgeInspectorSavePlan(edge, {
  ...edgeDraft,
  label: 'ProvidesService',
  customPropertiesText: '{"domain":"Communication"}',
});
assert.equal(validEdgeSavePlan.ok, true);
assert.equal(validEdgeSavePlan.edgeId, 'edge-a');
assert.equal(validEdgeSavePlan.update.label, 'ProvidesService');
assert.equal(validEdgeSavePlan.update.data.customProperties.domain, 'Communication');
assert.equal(validEdgeSavePlan.update.data.customProperties.relation, 'ProvidesService');
assert.equal(validEdgeSavePlan.update.data.customProperties.relationship, 'ProvidesService');

const invalidEdgeSavePlan = editorDrafts.createEdgeInspectorSavePlan(edge, {
  ...edgeDraft,
  customPropertiesText: '[]',
});
assert.equal(invalidEdgeSavePlan.ok, false);
assert.equal(invalidEdgeSavePlan.error, '自定义属性必须是 JSON 对象');

const node = {
  id: 'node-a',
  type: 'node',
  title: 'Function A',
  content: 'Logical behavior',
  summary: 'Summary',
  tags: ['function', 'ontology'],
  attributes: {
    priority: 1,
  },
  groupId: 'domain-a',
  position: { x: 0, y: 0 },
  createdAt: new Date('2026-04-29T00:00:00Z'),
  updatedAt: new Date('2026-04-29T00:00:00Z'),
};

const nodeDraft = editorDrafts.createNodeEditorDraft(node);
assert.equal(nodeDraft.groupId, 'domain-a');
assert.equal(nodeDraft.tags, 'function, ontology');

const nodeUpdate = editorDrafts.buildNodeUpdate({
  ...nodeDraft,
  title: 'Function B',
  tags: 'class, concept,  ',
  groupId: 'domain-b',
});

assert.equal(nodeUpdate.title, 'Function B');
assert.deepEqual(toPlainValue(nodeUpdate.tags), ['class', 'concept']);
assert.equal('groupId' in nodeUpdate, false, 'node update payload must not directly write groupId');

const validationCandidate = editorDrafts.buildNodeValidationCandidate(node, {
  ...nodeDraft,
  groupId: 'domain-b',
});
assert.equal(validationCandidate.groupId, 'domain-b');

const moveNodeSavePlan = editorDrafts.createNodeInspectorSavePlan('node-a', node, {
  ...nodeDraft,
  title: 'Function B',
  groupId: 'domain-b',
});
assert.equal(moveNodeSavePlan.ok, true);
assert.deepEqual(
  toPlainValue(moveNodeSavePlan.membership),
  {
    type: 'move',
    nodeId: 'node-a',
    groupId: 'domain-b',
  }
);
assert.equal(moveNodeSavePlan.update.title, 'Function B');
assert.equal('groupId' in moveNodeSavePlan.update, false, 'save plan update payload must not directly write groupId');
assert.equal(moveNodeSavePlan.ontology.kind, 'node');
assert.equal(moveNodeSavePlan.ontology.input.name, 'Function B');
assert.equal(moveNodeSavePlan.ontology.input.domainId, 'domain-b');
assert.equal(moveNodeSavePlan.ontology.input.type, 'Class');
assert.deepEqual(
  toPlainValue(moveNodeSavePlan.ontology.input.tags),
  ['function', 'ontology']
);
assert.equal(
  moveNodeSavePlan.ontology.input.fields.find(field => field.name === 'priority').value,
  '1'
);

const removeNodeSavePlan = editorDrafts.createNodeInspectorSavePlan('node-a', node, {
  ...nodeDraft,
  groupId: '',
});
assert.equal(removeNodeSavePlan.ok, true);
assert.equal(removeNodeSavePlan.ontology.kind, 'node');
assert.equal(removeNodeSavePlan.ontology.input.domainId, null);
assert.deepEqual(
  toPlainValue(removeNodeSavePlan.membership),
  {
    type: 'remove',
    nodeId: 'node-a',
  }
);

const unchangedNodeSavePlan = editorDrafts.createNodeInspectorSavePlan('node-a', node, nodeDraft);
assert.equal(unchangedNodeSavePlan.ok, true);
assert.deepEqual(toPlainValue(unchangedNodeSavePlan.membership), { type: 'none' });

const invalidNodeSavePlan = editorDrafts.createNodeInspectorSavePlan('node-a', node, {
  ...nodeDraft,
  title: '',
});
assert.equal(invalidNodeSavePlan.ok, false);
assert.equal(invalidNodeSavePlan.errors.includes('标题不能为空'), true);

const domainNode = {
  ...node,
  id: 'domain-a',
  type: 'group',
  title: 'Domain A',
  collapsed: false,
  nodeIds: ['node-a'],
  boundary: { minX: 0, minY: 0, maxX: 500, maxY: 300 },
};
const domainDraft = editorDrafts.createNodeEditorDraft(domainNode);
const domainSavePlan = editorDrafts.createNodeInspectorSavePlan('domain-a', domainNode, {
  ...domainDraft,
  title: 'Domain A Updated',
  groupId: '',
});
assert.equal(domainSavePlan.ok, true);
assert.equal(domainSavePlan.ontology.kind, 'domain');
assert.equal(domainSavePlan.ontology.input.name, 'Domain A Updated');
assert.equal(domainSavePlan.ontology.input.parentDomainId, null);

assert.deepEqual(
  toPlainValue(editorDrafts.createNodeRemoveFromGroupPlan('node-a')),
  {
    type: 'remove',
    nodeId: 'node-a',
  }
);

const items = editorDrafts.createAttributeItems({
  count: 2,
  nested: { enabled: true },
  plain: 'text',
});
assert.deepEqual(
  toPlainValue(editorDrafts.buildAttributesFromItems(items)),
  {
    count: 2,
    nested: { enabled: true },
    plain: 'text',
  }
);

console.log('Editor draft runtime tests passed.');
