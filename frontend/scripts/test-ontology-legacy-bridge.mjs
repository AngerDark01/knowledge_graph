import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);
const feature = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/index.ts'));

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));

const assertDeepPlainEqual = (actual, expected, message) => {
  assert.deepEqual(toPlainValue(actual), expected, message);
};

const createdAt = new Date('2026-01-01T00:00:00.000Z');

const legacyDomain = {
  id: 'domain-a',
  type: 'group',
  title: 'Domain A',
  position: { x: 80, y: 90 },
  width: 640,
  height: 420,
  collapsed: false,
  nodeIds: ['function-a'],
  boundary: { minX: 80, minY: 90, maxX: 720, maxY: 510 },
  createdAt,
  updatedAt: createdAt,
};

const legacyNode = {
  id: 'function-a',
  type: 'node',
  title: 'Function A',
  content: 'Transforms information',
  position: { x: 120, y: 160 },
  width: 350,
  height: 280,
  groupId: 'domain-a',
  attributes: {
    ontologyType: 'Function',
    behavior: {
      value: 'Transform',
      dataType: 'text',
      category: 'behavior',
    },
  },
  createdAt,
  updatedAt: createdAt,
};

const legacyEdge = {
  id: 'edge-a',
  source: 'function-a',
  target: 'function-a',
  label: 'Produces',
  sourceHandle: 'right',
  targetHandle: 'left',
  createdAt,
  updatedAt: createdAt,
};

const document = feature.createOntologyDocumentFromLegacyGraph({
  id: 'legacy-bridge',
  name: 'Legacy Bridge',
  nodes: [legacyDomain, legacyNode],
  edges: [legacyEdge],
});

assert.equal(document.graph.nodes['function-a'].type, 'Function');
assert.equal(document.graph.nodes['function-a'].domainId, 'domain-a');
assert.equal(document.graph.domains['domain-a'].nodeIds.includes('function-a'), true);
assertDeepPlainEqual(document.view.nodeViews['function-a'], {
  id: 'function-a',
  position: { x: 120, y: 160 },
  width: 350,
  height: 280,
});
assertDeepPlainEqual(document.view.domainViews['domain-a'], {
  id: 'domain-a',
  position: { x: 80, y: 90 },
  width: 640,
  height: 420,
  collapsed: false,
});
assertDeepPlainEqual(document.view.edgeViews['edge-a'], {
  id: 'edge-a',
  sourceHandle: 'right',
  targetHandle: 'left',
});

const createNodeResult = feature.createOntologyClassNodeInDocument(document, {
  id: 'class-a',
  name: 'Class A',
  type: 'Class',
  domainId: 'domain-a',
  subgraphId: 'legacy-bridge:root',
  position: { x: 220, y: 260 },
});

assert.equal(createNodeResult.changed, true);
const projectedNodeWithoutMembership = feature.projectOntologyNodeToLegacyNode(
  createNodeResult.document,
  'class-a',
  { includeMembership: false, now: createdAt }
);

assert.equal(projectedNodeWithoutMembership.type, 'node');
assert.equal(projectedNodeWithoutMembership.title, 'Class A');
assert.equal(projectedNodeWithoutMembership.groupId, undefined);
assert.equal(projectedNodeWithoutMembership.attributes.ontologyType, 'Class');
assert.equal(projectedNodeWithoutMembership.attributes.ontologyNodeId, 'class-a');

const projectedNodeWithMembership = feature.projectOntologyNodeToLegacyNode(
  createNodeResult.document,
  'class-a',
  { includeMembership: true, now: createdAt }
);
assert.equal(projectedNodeWithMembership.groupId, 'domain-a');
assert.equal(feature.isLegacyOntologyClassDisplay(projectedNodeWithMembership), true);
assert.equal(feature.isLegacyOntologyDomainDisplay(projectedNodeWithMembership), false);

const createDomainResult = feature.createOntologyDomainInDocument(createNodeResult.document, {
  id: 'domain-b',
  name: 'Domain B',
  parentDomainId: 'domain-a',
  collapsed: true,
  position: { x: 260, y: 300 },
  width: 300,
  height: 200,
});

assert.equal(createDomainResult.changed, true);
const projectedDomainWithoutMembership = feature.projectOntologyDomainToLegacyGroup(
  createDomainResult.document,
  'domain-b',
  { includeMembership: false, now: createdAt }
);

assert.equal(projectedDomainWithoutMembership.type, 'group');
assert.equal(projectedDomainWithoutMembership.title, 'Domain B');
assert.equal(projectedDomainWithoutMembership.groupId, undefined);
assert.equal(projectedDomainWithoutMembership.collapsed, true);
assertDeepPlainEqual(projectedDomainWithoutMembership.boundary, {
  minX: 260,
  minY: 300,
  maxX: 560,
  maxY: 500,
});
assert.equal(feature.isLegacyOntologyDomainDisplay(projectedDomainWithoutMembership), true);

const projectedDomainWithMembership = feature.projectOntologyDomainToLegacyGroup(
  createDomainResult.document,
  'domain-b',
  { includeMembership: true, now: createdAt }
);
assert.equal(projectedDomainWithMembership.groupId, 'domain-a');

const createRelationResult = feature.createOntologyRelationInDocument(createDomainResult.document, {
  id: 'edge-class-function',
  source: 'class-a',
  target: 'function-a',
  relation: 'ProvidesService',
  direction: 'bidirectional',
  sourceHandle: 'bottom',
  targetHandle: 'top',
});
assert.equal(createRelationResult.changed, true);

const projectedRelation = feature.projectOntologyEdgeToLegacyEdge(
  createRelationResult.document,
  'edge-class-function',
  {
    now: createdAt,
    data: {
      color: '#0088ff',
      strokeWidth: 2,
      customProperties: {
        source: 'bridge-test',
      },
    },
  }
);

assert.equal(projectedRelation.id, 'edge-class-function');
assert.equal(projectedRelation.label, 'ProvidesService');
assert.equal(projectedRelation.sourceHandle, 'bottom');
assert.equal(projectedRelation.targetHandle, 'top');
assert.equal(projectedRelation.data.direction, 'bidirectional');
assert.equal(projectedRelation.data.customProperties.source, 'bridge-test');
assert.equal(projectedRelation.data.customProperties.relation, 'ProvidesService');
assert.equal(projectedRelation.data.customProperties.relationship, 'ProvidesService');

console.log('Ontology legacy bridge tests passed.');
