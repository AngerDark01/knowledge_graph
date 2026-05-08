import assert from 'node:assert/strict';
import path from 'node:path';
import process from 'node:process';
import { createTypeScriptModuleLoader } from './load-typescript-module.mjs';

const projectRoot = process.cwd();
const { loadTypeScriptModule } = createTypeScriptModuleLoader(import.meta.url);

const { ELKConfigBuilder } = loadTypeScriptModule(
  path.join(projectRoot, 'services/layout/utils/ELKConfigBuilder.ts')
);
const { ELKGraphConverter } = loadTypeScriptModule(
  path.join(projectRoot, 'services/layout/utils/ELKGraphConverter.ts')
);

const toPlainValue = (value) => JSON.parse(JSON.stringify(value));
const now = new Date('2026-04-30T00:00:00Z');

const layeredConfig = ELKConfigBuilder.getLayeredConfig('RIGHT');
assert.equal(layeredConfig['elk.algorithm'], 'layered');
assert.equal(layeredConfig['elk.direction'], 'RIGHT');
assert.equal(layeredConfig['elk.layered.crossingMinimization.semiInteractive'], true);

const baseConfig = ELKConfigBuilder.getLayeredConfig('DOWN');
const mergedConfig = ELKConfigBuilder.mergeConfig(baseConfig, {
  'elk.direction': 'LEFT',
  'elk.spacing.nodeNode': 160,
});
assert.equal(baseConfig['elk.direction'], 'DOWN');
assert.equal(mergedConfig['elk.direction'], 'LEFT');
assert.equal(mergedConfig['elk.spacing.nodeNode'], 160);

const group = {
  id: 'group-a',
  type: 'group',
  position: { x: 0, y: 0 },
  title: 'Domain A',
  collapsed: false,
  nodeIds: ['node-a'],
  boundary: { minX: 0, minY: 0, maxX: 500, maxY: 400 },
  createdAt: now,
  updatedAt: now,
};

const node = {
  id: 'node-a',
  type: 'node',
  groupId: 'group-a',
  position: { x: 10, y: 20 },
  title: 'Function A',
  isExpanded: true,
  customExpandedSize: { width: 720, height: 520 },
  createdAt: now,
  updatedAt: now,
};

const elkGraph = ELKGraphConverter.toELKGraph([group, node], [], {
  elkOptions: { 'elk.direction': 'LEFT' },
});
const elkGroup = elkGraph.children[0];
const elkChild = elkGroup.children[0];

assert.equal(elkGraph.layoutOptions['elk.direction'], 'LEFT');
assert.equal(elkGroup.id, 'group-a');
assert.equal(elkGroup.layoutOptions['elk.hierarchyHandling'], 'INCLUDE_CHILDREN');
assert.equal(elkChild.width, 720);
assert.equal(elkChild.height, 520);

const positions = ELKGraphConverter.fromELKLayout({
  id: 'root',
  children: [
    {
      id: 'group-a',
      x: 10,
      y: 20,
      width: 500,
      height: 400,
      children: [
        {
          id: 'node-a',
          x: 5,
          y: 6,
          width: 120,
          height: 80,
        },
      ],
    },
  ],
});

assert.deepEqual(toPlainValue(positions.get('group-a')), {
  x: 10,
  y: 20,
  width: 500,
  height: 400,
});
assert.deepEqual(toPlainValue(positions.get('node-a')), {
  x: 15,
  y: 26,
  width: 120,
  height: 80,
});

console.log('ELK layout model tests passed.');
