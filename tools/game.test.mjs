import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

async function load(file) {
  const code = stripTypeScriptTypes(await readFile(file, 'utf8'), { mode: 'strip' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}
const math = await load('src/engine/math.ts');
const storage = await load('src/storage.ts');
const obstacles = [
  { id: 'cabinWest', minX: -13, maxX: -7, minZ: -6, maxZ: 0 },
  { id: 'cabinEast', minX: 7, maxX: 13, minZ: -9, maxZ: -3 },
  { id: 'crateWest', minX: -8, maxX: -6, minZ: 5, maxZ: 7 },
  { id: 'crateEast', minX: 5, maxX: 7, minZ: 1, maxZ: 3 },
];
test('swept movement cannot tunnel through a cabin or boundary', () => {
  const p = { x: 0, z: -5 };
  math.move(p, 100, 0, .48, obstacles);
  assert.ok(p.x <= 6.52 && !math.blocked(p, .48, obstacles));
  math.move(p, 0, 100, .48, obstacles);
  assert.ok(p.z <= 12.52 && !math.blocked(p, .48, obstacles));
  assert.equal(math.lineClear({ x: -14, z: -3 }, { x: -5, z: -3 }, obstacles), false);
  assert.equal(math.lineClear({ x: 0, z: 9 }, { x: 0, z: -9 }, obstacles), true);
});
test('all three entrances can navigate around the shared cabins to the central player', () => {
  const goal = { x: 0, z: 9 };
  for (const start of [{ x: -9, z: -10 }, { x: 0, z: -13 }, { x: 10, z: -11 }]) {
    const p = { ...start };
    for (let i = 0; i < 1800 && math.distance(p, goal) > .3; i++) {
      const next = math.nextWaypoint(p, goal, obstacles), d = math.distance(p, next);
      if (d < .001) break;
      math.move(p, (next.x - p.x) / d * .06, (next.z - p.z) / d * .06, .42, obstacles);
      assert.equal(math.blocked(p, .42, obstacles), false);
    }
    assert.ok(math.distance(p, goal) < .3, `Route failed from ${JSON.stringify(start)}`);
  }
});
test('save validation, complete checkpoint and settings round trip', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  assert.equal(storage.readCheckpoint(), null);
  const cp = { ...storage.emptyCheckpoint('courtyard', 'complete'), healed: true, firstWrapped: true, disabledAnchors: ['courtyard'] };
  assert.equal(storage.writeCheckpoint(cp), true);
  assert.deepEqual(storage.readCheckpoint(), cp);
  for (const invalid of ['{', 'null', '{"version":99}', '{"version":1,"boundary":"boss","healed":false,"firstWrapped":false}']) {
    values.set(storage.SAVE_KEY, invalid);
    assert.equal(storage.readCheckpoint(), null);
  }
  values.set('ho-ho-ufo.settings.v1', JSON.stringify({ master: 9, music: -3, effects: .5, reducedMotion: true, aimAssist: false }));
  assert.deepEqual(storage.readSettings(), { master: 1, music: 0, effects: .5, reducedMotion: true, aimAssist: false });
});
test('denied storage never crashes gameplay', () => {
  globalThis.localStorage = { getItem() { throw Error('denied'); }, setItem() { throw Error('quota'); }, removeItem() { throw Error('denied'); } };
  assert.equal(storage.readCheckpoint(), null);
  assert.equal(storage.writeCheckpoint({}), false);
  assert.equal(storage.clearCheckpoint(), false);
  assert.deepEqual(storage.readSettings(), storage.defaultSettings);
});
