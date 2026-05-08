import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);
const layoutModel = loadTypeScriptModule(path.join(projectRoot, 'features/ontology-canvas/model/layout/index.ts'));

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));

assert.deepEqual(toPlainValue(layoutModel.createCanvasLayoutOptions()), {
  animate: true,
  strategy: 'elk-layout',
});

assert.deepEqual(toPlainValue(layoutModel.createGroupLayoutOptions('group-a')), {
  animate: true,
  strategy: 'elk-group-layout',
  groupId: 'group-a',
});

const group = {
  id: 'group-a',
  type: 'group',
  position: { x: 0, y: 0 },
  title: 'Domain A',
  collapsed: false,
  nodeIds: ['node-a'],
  boundary: { minX: 0, minY: 0, maxX: 300, maxY: 200 },
  createdAt: new Date('2026-04-29T00:00:00Z'),
  updatedAt: new Date('2026-04-29T00:00:00Z'),
};

const node = {
  id: 'node-a',
  type: 'node',
  groupId: 'group-a',
  position: { x: 10, y: 20 },
  title: 'Function A',
  createdAt: new Date('2026-04-29T00:00:00Z'),
  updatedAt: new Date('2026-04-29T00:00:00Z'),
};

assert.equal(layoutModel.isGroupNode(group), true);
assert.equal(layoutModel.isGroupNode(node), false);
assert.deepEqual(toPlainValue(layoutModel.getDirectGroupChildren([group, node], 'group-a')), [toPlainValue(node)]);

assert.deepEqual(
  toPlainValue(layoutModel.createLayoutNodeUpdate({
    x: 100,
    y: 200,
    width: 360,
    height: 240,
    boundary: { minX: 100, minY: 200, maxX: 460, maxY: 440 },
  }, true)),
  {
    position: { x: 100, y: 200 },
    width: 360,
    height: 240,
    boundary: { minX: 100, minY: 200, maxX: 460, maxY: 440 },
    style: { width: 360, height: 240 },
  }
);

assert.deepEqual(
  toPlainValue(layoutModel.createLayoutEdgeUpdate({
    sourceHandle: 'right',
    targetHandle: 'left',
  })),
  {
    sourceHandle: 'right',
    targetHandle: 'left',
  }
);

console.log('Layout control model tests passed.');
