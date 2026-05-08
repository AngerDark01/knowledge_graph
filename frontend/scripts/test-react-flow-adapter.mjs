import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);
const adapter = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/adapters/react-flow/index.ts'));

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));
const createdAt = new Date('2026-01-01T00:00:00.000Z');

const groupA = {
  id: 'group-a',
  type: 'group',
  title: 'Group A',
  position: { x: 80, y: 90 },
  width: 300,
  height: 200,
  collapsed: false,
  nodeIds: ['node-a'],
  boundary: { minX: 80, minY: 90, maxX: 380, maxY: 290 },
  createdAt,
  updatedAt: createdAt,
};

const groupB = {
  id: 'group-b',
  type: 'group',
  title: 'Group B',
  position: { x: 500, y: 90 },
  width: 300,
  height: 200,
  collapsed: false,
  nodeIds: ['node-b'],
  boundary: { minX: 500, minY: 90, maxX: 800, maxY: 290 },
  createdAt,
  updatedAt: createdAt,
};

const nodeA = {
  id: 'node-a',
  type: 'node',
  title: 'Node A',
  position: { x: 110, y: 140 },
  groupId: 'group-a',
  width: 370,
  height: 290,
  createdAt,
  updatedAt: createdAt,
};

const nodeB = {
  id: 'node-b',
  type: 'node',
  title: 'Node B',
  position: { x: 540, y: 150 },
  groupId: 'group-b',
  createdAt,
  updatedAt: createdAt,
};

const projectedNodes = adapter.projectNodesToReactFlowNodes(
  [nodeA, groupA, nodeB, groupB],
  { selectedNodeId: 'node-a' }
);

assert.deepEqual(toPlainValue(projectedNodes.map(node => node.id)), ['group-a', 'group-b', 'node-a', 'node-b']);
assert.equal(adapter.resolveReactFlowLodMode(1), 'full');
assert.equal(adapter.resolveReactFlowLodMode(0.5), 'compact');
assert.equal(adapter.resolveReactFlowLodMode(0.3), 'outline');
assert.equal(adapter.resolveReactFlowLodMode(0.1), 'dot');
assert.deepEqual(
  toPlainValue(adapter.resolveReactFlowNodeDisplaySize(nodeA, 'compact')),
  { width: 220, height: 150 }
);
assert.deepEqual(
  toPlainValue(adapter.resolveReactFlowNodeDisplaySize(nodeA, 'outline')),
  { width: 160, height: 58 }
);
assert.deepEqual(
  toPlainValue(adapter.resolveReactFlowNodeDisplaySize(nodeA, 'dot')),
  { width: 36, height: 36 }
);
assert.deepEqual(
  toPlainValue(adapter.resolveReactFlowNodeDisplaySize(groupA, 'dot')),
  { width: 300, height: 200 },
  'container display dimensions stay stable until container aggregation is implemented'
);
assert.deepEqual(
  toPlainValue(adapter.resolveReactFlowNodePersistedPosition(
    nodeA,
    'outline',
    { x: 135, y: 166 }
  )),
  { x: 30, y: 50 },
  'LOD drag stop should convert centered display position back to persisted node position'
);
assert.deepEqual(
  toPlainValue(adapter.resolveReactFlowNodePersistedPosition(
    groupA,
    'dot',
    { x: 80, y: 90 }
  )),
  { x: 80, y: 90 },
  'container position is unchanged while container display shrink is deferred'
);

const projectedNodeA = projectedNodes.find(node => node.id === 'node-a');
assert.equal(projectedNodeA.type, 'custom');
assert.equal(projectedNodeA.selected, true);
assert.equal(projectedNodeA.parentId, 'group-a');
assert.deepEqual(toPlainValue(projectedNodeA.position), { x: 30, y: 50 });
assert.deepEqual(toPlainValue(projectedNodeA.style), { width: 370, height: 290 });
assert.equal(projectedNodeA.data.lodMode, 'full');

const projectedNodeB = projectedNodes.find(node => node.id === 'node-b');
assert.deepEqual(toPlainValue(projectedNodeB.style), { width: 350, height: 280 });

const projectedGroupA = projectedNodes.find(node => node.id === 'group-a');
assert.equal(projectedGroupA.type, 'group');
assert.deepEqual(toPlainValue(projectedGroupA.style), { width: 300, height: 200 });

const culledNodes = adapter.projectNodesToReactFlowNodes(
  [nodeA, groupA, nodeB, groupB],
  {
    cullingEnabled: true,
    lodMode: 'outline',
    viewportBounds: { minX: 0, minY: 0, maxX: 400, maxY: 400 },
    viewportPadding: 0,
  }
);

assert.deepEqual(toPlainValue(culledNodes.map(node => node.id)), ['group-a', 'node-a']);
const culledNodeA = culledNodes.find(node => node.id === 'node-a');
assert.equal(culledNodeA.data.lodMode, 'outline');
assert.deepEqual(toPlainValue(culledNodeA.style), { width: 160, height: 58 });
assert.deepEqual(
  toPlainValue(culledNodeA.position),
  { x: 135, y: 166 },
  'LOD display size should remain centered over the persisted node bounds'
);

const selectedOutsideNodes = adapter.projectNodesToReactFlowNodes(
  [nodeA, groupA, nodeB, groupB],
  {
    selectedNodeId: 'node-b',
    cullingEnabled: true,
    viewportBounds: { minX: 0, minY: 0, maxX: 400, maxY: 400 },
    viewportPadding: 0,
  }
);

assert.deepEqual(
  toPlainValue(selectedOutsideNodes.map(node => node.id)),
  ['group-a', 'group-b', 'node-a', 'node-b']
);

const collapsedGroupA = {
  ...groupA,
  collapsed: true,
};
const collapsedGroupNodes = adapter.projectNodesToReactFlowNodes(
  [nodeA, collapsedGroupA, nodeB, groupB],
  { selectedNodeId: 'node-a' }
);
assert.deepEqual(
  toPlainValue(collapsedGroupNodes.map(node => node.id)),
  ['group-a', 'group-b', 'node-b'],
  'collapsed containers should project themselves but not their descendants'
);
assert.deepEqual(
  toPlainValue(Array.from(adapter.resolveRenderableNodeIds(
    [nodeA, collapsedGroupA, nodeB, groupB]
  )).sort()),
  ['group-a', 'group-b', 'node-b'],
  'renderable node ids should exclude descendants of collapsed containers'
);

const nodeById = adapter.createGraphNodeLookup([groupA, groupB, nodeA, nodeB]);
const projectedEdges = adapter.projectEdgesToReactFlowEdges(
  [
    { id: 'edge-cross', source: 'node-a', target: 'node-b', createdAt, updatedAt: createdAt },
    { id: 'edge-hidden', source: 'node-a', target: 'missing-node', createdAt, updatedAt: createdAt },
  ],
  [groupA, groupB, nodeA, nodeB],
  {
    nodeById,
    selectedEdgeId: 'edge-cross',
    edgeVisibility: { mode: 'custom', ids: ['edge-cross'] },
  }
);

assert.equal(projectedEdges.length, 1);
assert.equal(projectedEdges[0].id, 'edge-cross');
assert.equal(projectedEdges[0].type, 'crossGroup');
assert.equal(projectedEdges[0].selected, true);
assert.equal(projectedEdges[0].zIndex, 1000);

assert.deepEqual(
  toPlainValue(
    adapter.projectEdgesToReactFlowEdges(
      [{ id: 'edge-culled', source: 'node-a', target: 'node-b', createdAt, updatedAt: createdAt }],
      [groupA, groupB, nodeA, nodeB],
      { visibleNodeIds: new Set(['group-a', 'node-a']) }
    )
  ),
  []
);
assert.deepEqual(
  toPlainValue(
    adapter.projectEdgesToReactFlowEdges(
      [{ id: 'edge-collapsed', source: 'node-a', target: 'node-b', createdAt, updatedAt: createdAt }],
      [nodeA, collapsedGroupA, nodeB, groupB]
    )
  ),
  [],
  'edges connected to descendants of a collapsed container should not render'
);
assert.deepEqual(
  toPlainValue(
    adapter.projectEdgesToReactFlowEdges(
      [{ id: 'edge-missing-endpoint', source: 'node-a', target: 'missing-node', createdAt, updatedAt: createdAt }],
      [groupA, groupB, nodeA, nodeB]
    )
  ),
  [],
  'edges connected to missing endpoints should not render'
);

const cyclicA = { ...groupA, id: 'cyclic-a', groupId: 'cyclic-b', nodeIds: [] };
const cyclicB = { ...groupB, id: 'cyclic-b', groupId: 'cyclic-a', nodeIds: [] };

assert.deepEqual(
  toPlainValue(
    adapter.projectEdgesToReactFlowEdges(
      [{ id: 'edge-none', source: 'node-a', target: 'node-b', createdAt, updatedAt: createdAt }],
      [nodeA, nodeB],
      { edgeVisibility: { mode: 'none', ids: [] } }
    )
  ),
  []
);

assert.deepEqual(
  toPlainValue(
    adapter.sortNodesByNestingLevel([cyclicA, cyclicB]).map(node => node.id).sort()
  ),
  ['cyclic-a', 'cyclic-b']
);

const ontologyDocument = {
  graph: {
    id: 'ontology-doc',
    name: 'Ontology Doc',
    schemaVersion: 1,
    nodes: {
      'class-a': {
        id: 'class-a',
        name: 'Class A',
        type: 'Class',
        fields: [
          {
            id: 'class-a:field:order-id',
            name: 'orderId',
            value: 'required',
            dataType: 'String',
            category: 'attribute',
          },
          {
            id: 'class-a:method:submit',
            name: 'submit',
            dataType: 'Command',
            category: 'behavior',
          },
          {
            id: 'class-a:rule:payment',
            name: 'requiresPayment',
            dataType: 'Constraint',
            category: 'constraint',
          },
        ],
        tags: [],
        domainId: 'domain-a',
        subgraphId: 'subgraph-a',
      },
      'class-b': {
        id: 'class-b',
        name: 'Class B',
        type: 'Function',
        fields: [],
        tags: [],
        domainId: 'domain-b',
      },
    },
    edges: {
      'relation-a': {
        id: 'relation-a',
        source: 'class-a',
        target: 'class-b',
        relation: 'ProvidesService',
        direction: 'bidirectional',
      },
    },
    domains: {
      'domain-a': {
        id: 'domain-a',
        name: 'Domain A',
        nodeIds: ['class-a'],
        domainIds: [],
        collapsed: false,
      },
      'domain-b': {
        id: 'domain-b',
        name: 'Domain B',
        nodeIds: ['class-b'],
        domainIds: [],
        collapsed: false,
      },
    },
    subgraphs: {
      'subgraph-a': {
        id: 'subgraph-a',
        name: 'Class A Internal Canvas',
        rootNodeId: 'class-a',
        nodeIds: ['class-a', 'class-b'],
        edgeIds: [],
      },
    },
  },
  view: {
    nodeViews: {
      'class-a': {
        id: 'class-a',
        position: { x: 120, y: 160 },
        width: 350,
        height: 280,
      },
      'class-b': {
        id: 'class-b',
        position: { x: 520, y: 180 },
        width: 350,
        height: 280,
      },
    },
    domainViews: {
      'domain-a': {
        id: 'domain-a',
        position: { x: 80, y: 90 },
        width: 300,
        height: 200,
        collapsed: false,
      },
      'domain-b': {
        id: 'domain-b',
        position: { x: 500, y: 90 },
        width: 300,
        height: 200,
        collapsed: false,
      },
    },
    edgeViews: {
      'relation-a': {
        id: 'relation-a',
        sourceHandle: 'right',
        targetHandle: 'left',
      },
    },
    viewport: { x: 0, y: 0, zoom: 1 },
    lod: 'full',
    edgeVisibility: { mode: 'all', ids: [] },
  },
  revision: 0,
};

const ontologyProjectedNodes = adapter.projectOntologyDocumentToReactFlowNodes(ontologyDocument, {
  selectedNodeId: 'class-a',
});
assert.deepEqual(
  toPlainValue(ontologyProjectedNodes.map(node => node.id)),
  ['domain-a', 'domain-b', 'class-a', 'class-b']
);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'class-a').parentId, 'domain-a');
assert.equal(ontologyProjectedNodes.find(node => node.id === 'class-a').data.ontologyType, 'Class');
assert.equal(ontologyProjectedNodes.find(node => node.id === 'domain-a').data.ontologyDomainViewModel.counts.childNodes, 1);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'domain-a').data.ontologyDomainViewModel.counts.childDomains, 0);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'domain-a').data.ontologyDomainViewModel.counts.relationships, 1);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'domain-a').data.ontologyDomainViewModel.hasInternalSpace, true);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'class-a').data.ontologyViewModel.counts.fields, 1);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'class-a').data.ontologyViewModel.counts.methods, 1);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'class-a').data.ontologyViewModel.counts.rules, 1);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'class-a').data.ontologyViewModel.counts.relationships, 1);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'class-a').data.ontologyViewModel.counts.childNodes, 1);
assert.equal(ontologyProjectedNodes.find(node => node.id === 'class-a').data.ontologyViewModel.hasSubcanvas, true);
assert.deepEqual(
  toPlainValue(ontologyProjectedNodes.find(node => node.id === 'class-a').data.ontologyViewModel.sections.map(section => section.id)),
  ['fields', 'methods', 'rules', 'interfaces', 'relationships']
);

const ontologyProjectedEdges = adapter.projectOntologyDocumentToReactFlowEdges(ontologyDocument, {
  selectedEdgeId: 'relation-a',
});
assert.equal(ontologyProjectedEdges.length, 1);
assert.equal(ontologyProjectedEdges[0].label, 'ProvidesService');
assert.equal(ontologyProjectedEdges[0].type, 'crossGroup');
assert.equal(ontologyProjectedEdges[0].data.direction, 'bidirectional');
assert.equal(ontologyProjectedEdges[0].data.customProperties.relation, 'ProvidesService');

const collapsedOntologyDocument = {
  ...ontologyDocument,
  view: {
    ...ontologyDocument.view,
    domainViews: {
      ...ontologyDocument.view.domainViews,
      'domain-a': {
        ...ontologyDocument.view.domainViews['domain-a'],
        collapsed: true,
      },
    },
  },
};
const collapsedOntologyProjectedNodes = adapter.projectOntologyDocumentToReactFlowNodes(
  collapsedOntologyDocument,
  { selectedNodeId: 'class-a' }
);
assert.deepEqual(
  toPlainValue(collapsedOntologyProjectedNodes.map(node => node.id)),
  ['domain-a', 'domain-b', 'class-b'],
  'collapsed ontology domains should hide their descendant node projections'
);
assert.equal(
  collapsedOntologyProjectedNodes.find(node => node.id === 'domain-a').data.ontologyDomainViewModel.collapsed,
  true
);
assert.deepEqual(
  toPlainValue(adapter.projectOntologyDocumentToReactFlowEdges(collapsedOntologyDocument)),
  [],
  'ontology edges connected to hidden descendants should not render by default'
);

console.log('ReactFlow adapter projection tests passed.');
