import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);

const commandsRoot = path.join(projectRoot, 'domain/ontology/commands');
const edgeVisibility = loadTypeScriptModule(path.join(commandsRoot, 'edgeVisibility.ts'));
const graphConsistency = loadTypeScriptModule(path.join(commandsRoot, 'graphConsistency.ts'));

const edges = [
  { id: 'e1', source: 'n1', target: 'n2' },
  { id: 'e2', source: 'n2', target: 'n3' },
  { id: 'e3', source: 'n4', target: 'n5' },
];

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));

const assertDeepPlainEqual = (actual, expected, message) => {
  assert.deepEqual(toPlainValue(actual), expected, message);
};

const assertVisibility = assertDeepPlainEqual;

assertVisibility(
  edgeVisibility.createAllEdgeVisibility(),
  { mode: 'all', ids: [] },
  'all visibility should have no explicit ids'
);

assertDeepPlainEqual(
  edgeVisibility.getVisibleEdgeIds(edges, edgeVisibility.createAllEdgeVisibility()),
  ['e1', 'e2', 'e3'],
  'all visibility should expose every edge id'
);

assertDeepPlainEqual(
  edgeVisibility.getVisibleEdgeIds(edges, edgeVisibility.createNoEdgeVisibility()),
  [],
  'none visibility should expose no edge ids'
);

assertVisibility(
  edgeVisibility.createCustomEdgeVisibility(['e2', 'missing', 'e2'], edges),
  { mode: 'custom', ids: ['e2'] },
  'custom visibility should dedupe and drop unknown edge ids'
);

assert.equal(
  edgeVisibility.isEdgeVisible('e2', { mode: 'custom', ids: ['e2'] }),
  true,
  'custom visibility should show listed edges'
);

assert.equal(
  edgeVisibility.isEdgeVisible('e1', { mode: 'custom', ids: ['e2'] }),
  false,
  'custom visibility should hide unlisted edges'
);

assertVisibility(
  edgeVisibility.addEdgeToVisibility({ mode: 'custom', ids: ['e1'] }, 'e2'),
  { mode: 'custom', ids: ['e1', 'e2'] },
  'adding an edge should extend custom visibility'
);

assertVisibility(
  edgeVisibility.addEdgeToVisibility(edgeVisibility.createNoEdgeVisibility(), 'e2'),
  { mode: 'none', ids: [] },
  'adding an edge should not change none visibility semantics'
);

assertVisibility(
  edgeVisibility.removeEdgeIdsFromVisibility({ mode: 'custom', ids: ['e1', 'e2', 'e3'] }, ['e2']),
  { mode: 'custom', ids: ['e1', 'e3'] },
  'removing an edge should clean custom visibility'
);

assertVisibility(
  edgeVisibility.toggleEdgeInVisibility('e2', edges, edgeVisibility.createAllEdgeVisibility()),
  { mode: 'custom', ids: ['e1', 'e3'] },
  'toggling a visible edge from all mode should create custom visibility without that edge'
);

assertVisibility(
  edgeVisibility.toggleEdgeInVisibility('e2', edges, edgeVisibility.createNoEdgeVisibility()),
  { mode: 'custom', ids: ['e2'] },
  'toggling an edge from none mode should create custom visibility with that edge'
);

assertDeepPlainEqual(
  graphConsistency.removeEdgesConnectedToNodes(edges, ['n2']),
  {
    edges: [{ id: 'e3', source: 'n4', target: 'n5' }],
    removedEdgeIds: ['e1', 'e2'],
  },
  'removing node n2 should remove both incident edges'
);

assertDeepPlainEqual(
  graphConsistency.removeEdgesConnectedToNodesWithVisibility(
    edges,
    ['n2'],
    { mode: 'custom', ids: ['e1', 'e2', 'e3'] }
  ),
  {
    edges: [{ id: 'e3', source: 'n4', target: 'n5' }],
    removedEdgeIds: ['e1', 'e2'],
    edgeVisibility: { mode: 'custom', ids: ['e3'] },
  },
  'incident edge removal should clean custom visibility'
);

assertDeepPlainEqual(
  graphConsistency.removeEdgesConnectedToNodesWithVisibility(
    edges,
    ['n2'],
    edgeVisibility.createAllEdgeVisibility()
  ),
  {
    edges: [{ id: 'e3', source: 'n4', target: 'n5' }],
    removedEdgeIds: ['e1', 'e2'],
    edgeVisibility: { mode: 'all', ids: [] },
  },
  'incident edge removal should preserve all mode without legacy visible ids'
);

assert.equal(edges.length, 3, 'domain commands should not mutate the input edge array');

console.log('Domain command runtime tests passed.');
