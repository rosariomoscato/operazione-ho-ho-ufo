import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

async function load(path) {
  const source = stripTypeScriptTypes(await readFile(path, 'utf8'), { mode: 'strip' });
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
const { default: act, squareLayout: points } = await load('src/acts/square.ts');
const math = await load('src/engine/math.ts');
const obstacles = [
  { id: 'square-tree', minX: 7.2, maxX: 8.8, minZ: -6.8, maxZ: -5.2 },
  { id: 'square-sled', minX: -11, maxX: -7, minZ: -8.5, maxZ: -5.5 },
];
test('final act has no filler enemies or extra anchors', () => {
  assert.equal(act.id, 'square'); assert.equal(act.levelId, 'square');
  assert.equal(act.anchors.length, 0); assert.equal(act.arenas.length, 0);
  assert.ok(points.encounter.radius > 0);
});
test('core and tree interactions are accessible outside real solids', () => {
  for (const goal of [points.core, points.treeInteraction]) {
    assert.equal(math.blocked(goal, .48, obstacles), false);
    const p = { ...act.start };
    for (let i = 0; i < 1600 && math.distance(p, goal) > .5; i++) {
      const next = math.nextWaypoint(p, goal, obstacles, .55), distance = math.distance(p, next);
      if (distance < .001) break;
      math.move(p, (next.x - p.x) / distance * .08, (next.z - p.z) / distance * .08, .48, obstacles);
      assert.equal(math.blocked(p, .48, obstacles), false);
    }
    assert.ok(math.distance(p, goal) <= .5, JSON.stringify(goal));
  }
  assert.equal(math.lineClear(points.core, points.treeInteraction, obstacles), true);
  assert.equal(math.blocked(points.tree, .48, obstacles), true);
});
