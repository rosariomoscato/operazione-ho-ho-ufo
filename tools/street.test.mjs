import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { stripTypeScriptTypes } from 'node:module';

async function load(file) {
  const code = stripTypeScriptTypes(await readFile(file, 'utf8'), { mode: 'strip' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}
const { default: street } = await load('src/acts/toystreet.ts');
const math = await load('src/engine/math.ts');
const storage = await load('src/storage.ts');
const cover = [
  { id: 'street-west-shop', minX: -14, maxX: -10, minZ: -1, maxZ: 4 },
  { id: 'street-east-shop', minX: 10, maxX: 14, minZ: -1, maxZ: 4 },
  { id: 'street-train-cover', minX: -10, maxX: -6, minZ: -2, maxZ: -.5 },
  { id: 'street-carousel-cover', minX: 6, maxX: 10, minZ: -2, maxZ: -.5 },
];

test('M2 data has two independent anchors and exactly six defenders', () => {
  assert.equal(street.id, 'toystreet');
  assert.equal(street.anchors.length, 2);
  assert.equal(new Set(street.anchors.map(anchor => anchor.id)).size, 2);
  assert.equal(street.arenas.flatMap(arena => arena.enemies).length, 6);
  for (const arena of street.arenas) {
    assert.equal(street.anchors.filter(anchor => anchor.arenaId === arena.id).length, 1);
    assert.ok(arena.enemies.every(enemy => enemy.kind === (arena.id === 'workshop' ? 'ranged' : 'melee')));
    assert.ok(arena.enemies.every(enemy => !math.blocked(enemy, .42, cover)));
  }
});
test('fast bolts cannot tunnel through cover or the player', () => {
  const a = { x: -8, z: -5 }, b = { x: -8, z: 5 };
  const wall = cover.find(o => o.id === 'street-train-cover');
  const wallImpact = math.segmentBox(a, b, wall, .18);
  const playerImpact = math.segmentCircle(a, b, { x: -8, z: 0 }, .66);
  assert.ok(wallImpact >= 0 && wallImpact < playerImpact && playerImpact < 1);
  assert.equal(math.segmentBox({ x: 0, z: -5 }, { x: 0, z: 5 }, wall, .18), null);
  assert.equal(math.segmentCircle({ x: 0, z: -5 }, { x: 0, z: 5 }, { x: -8, z: 0 }, .66), null);
  assert.equal(math.segmentCircle({ x: 0, z: 0 }, { x: 0, z: 0 }, { x: 0, z: 0 }, .66), 0);
  assert.equal(math.segmentCircle({ x: 0, z: 0 }, { x: 0, z: 0 }, { x: 5, z: 0 }, .66), null);
  assert.equal(math.segmentBox({ x: -8, z: -1 }, { x: -8, z: -1 }, wall, .18), 0);
});
test('M2 both anchors and every defender are reachable around real cover', () => {
  for (const goal of [...street.anchors, ...street.arenas.flatMap(arena => arena.enemies)]) {
    const p = { ...street.start };
    for (let i = 0; i < 1500 && math.distance(p, goal) > .6; i++) {
      const waypoint = math.nextWaypoint(p, goal, cover, .52);
      const d = math.distance(p, waypoint); if (d < .001) break;
      math.move(p, (waypoint.x - p.x) / d * .08, (waypoint.z - p.z) / d * .08, .48, cover);
      assert.equal(math.blocked(p, .48, cover), false);
    }
    assert.ok(math.distance(p, goal) <= .6, `Unreachable: ${JSON.stringify(goal)}`);
  }
  assert.equal(math.lineClear({ x: -8, z: 0 }, { x: -8, z: -5 }, cover), false);
  assert.equal(math.lineClear({ x: 0, z: 10 }, { x: 0, z: -13 }, cover), true);
});
test('approved M1 snapshot remains byte-for-byte unchanged', async () => {
  const manifest = JSON.parse(await readFile('docs/evidence/step-08/m1-snapshot-baseline.json', 'utf8'));
  assert.equal(manifest.files.length, 27);
  for (const file of manifest.files) {
    const bytes = await readFile(`snapshots/m1-slice/${file.path}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
  }
});

test('legacy M1 saves migrate without overwriting their original bytes', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
  for (const boundary of ['training', 'A', 'B', 'C', 'anchor', 'complete']) {
    const original = JSON.stringify({ version: 1, boundary, healed: true, firstWrapped: true });
    values.set(storage.LEGACY_KEY, original);
    const migrated = storage.readCheckpoint();
    assert.equal(migrated.version, 2);
    assert.equal(migrated.chapter, 'courtyard');
    assert.equal(migrated.boundary, boundary);
    assert.deepEqual(migrated.disabledAnchors, boundary === 'complete' ? ['courtyard'] : []);
    assert.equal(values.get(storage.LEGACY_KEY), original);
    assert.equal(values.has(storage.SAVE_KEY), false);
  }
});

test('M2 checkpoint round-trips in both arena orders and rejects inconsistent progress', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
  for (const order of [['workshop', 'carousel'], ['carousel', 'workshop']]) {
    const cp = storage.emptyCheckpoint('toystreet');
    for (const id of order) {
      cp.activatedArenas.push(id); cp.clearedArenas.push(id);
      cp.defeatedEnemies.push(...[0, 1, 2].map(n => `${id}:${n}`));
      assert.equal(storage.writeCheckpoint(cp), true);
      assert.deepEqual(storage.readCheckpoint(), cp, 'cleared but not activated anchor persists');
      cp.disabledAnchors.push(id);
      if (cp.disabledAnchors.length === 2) cp.boundary = 'street-complete';
      cp.healed = true;
      assert.equal(storage.writeCheckpoint(cp), true);
      assert.deepEqual(storage.readCheckpoint(), cp);
    }
    const invalid = [
      { ...cp, disabledAnchors: ['workshop', 'workshop'] },
      { ...cp, activatedArenas: [] },
      { ...cp, clearedArenas: [] },
      { ...cp, boundary: 'street' },
      { ...cp, defeatedEnemies: ['workshop:99'] },
      { ...cp, chapter: 'boss' },
    ];
    for (const value of invalid) assert.equal(storage.normalizeCheckpoint(value), null);
  }
  assert.equal(storage.clearCheckpoint(), true);
  assert.equal(storage.readCheckpoint(), null);
});
