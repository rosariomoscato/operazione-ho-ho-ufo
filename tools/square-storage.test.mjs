import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

const source = stripTypeScriptTypes(await readFile('src/storage.ts', 'utf8'));
const storage = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
function memory() {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) };
  return values;
}
function square(boundary, segments = 0) {
  return { ...storage.emptyCheckpoint('square', boundary), bossSegments: segments, bossDefeated: segments === 3, coreCarried: ['return-core','ending'].includes(boundary), coreReturned: boundary === 'ending' };
}
test('save3 migrates v2 without modifying its original bytes or losing M2 progress', () => {
  const values = memory();
  const legacy = { version:2,chapter:'toystreet',boundary:'street',healed:true,firstWrapped:true,disabledAnchors:['carousel'],clearedArenas:['carousel'],activatedArenas:['carousel','workshop'],defeatedEnemies:['carousel:0','carousel:1','carousel:2','workshop:0'] };
  const raw = JSON.stringify(legacy); values.set(storage.LEGACY_V2_KEY, raw);
  const migrated = storage.readCheckpoint(); assert.equal(migrated.version, 3);
  for (const field of ['chapter','boundary','healed','disabledAnchors','clearedArenas','activatedArenas','defeatedEnemies']) assert.deepEqual(migrated[field], legacy[field]);
  assert.equal(migrated.bossSegments,0); assert.equal(migrated.coreReturned,false);
  assert.equal(values.get(storage.LEGACY_V2_KEY), raw); assert.equal(values.has(storage.SAVE_KEY), false);
});
test('all M3 boundaries and completed segments round-trip independently', () => {
  memory();
  for (const cp of [square('square'),square('boss',0),square('boss',1),square('boss',2),square('core',3),square('return-core',3),square('ending',3)]) {
    assert.deepEqual(storage.normalizeCheckpoint(cp), cp);
    assert.equal(storage.writeCheckpoint(cp), true); assert.deepEqual(storage.readCheckpoint(), cp);
  }
});
test('impossible boss/core/ending ordering and malformed versions are rejected', () => {
  const ending = square('ending',3);
  const invalid = [
    { ...ending, version:'3' }, { ...ending, version:'2' }, { ...ending, version:99 },
    { ...ending, bossSegments:2 }, { ...ending, bossSegments:4 }, { ...ending, bossSegments:1.5 },
    { ...ending, bossDefeated:false }, { ...ending, coreCarried:false }, { ...ending, coreReturned:false },
    { ...ending, boundary:'boss' }, { ...ending, boundary:'core' }, { ...ending, boundary:'return-core' },
    { ...ending, disabledAnchors:['workshop'] }, { ...ending, chapter:'courtyard' },
    { ...square('boss',1), coreCarried:true }, { ...square('square'), bossSegments:1 },
  ];
  for (const cp of invalid) assert.equal(storage.normalizeCheckpoint(cp),null,JSON.stringify(cp));
});
test('corrupt save3 does not silently fall back to an old courtyard save', () => {
  const values = memory(); values.set(storage.SAVE_KEY,'{');
  values.set(storage.LEGACY_KEY,JSON.stringify({version:1,boundary:'training',healed:false,firstWrapped:false}));
  assert.equal(storage.readCheckpoint(),null); assert.ok(storage.storageNotice());
  assert.equal(values.get(storage.SAVE_KEY),'{');
});
test('explicit New game clears v1/v2/v3 but not user settings', () => {
  const values = memory();
  for (const key of [storage.SAVE_KEY,storage.LEGACY_KEY,storage.LEGACY_V2_KEY]) values.set(key,'old');
  values.set('ho-ho-ufo.settings.v1','settings'); assert.equal(storage.clearCheckpoint(),true);
  for (const key of [storage.SAVE_KEY,storage.LEGACY_KEY,storage.LEGACY_V2_KEY]) assert.equal(values.has(key),false);
  assert.equal(values.get('ho-ho-ufo.settings.v1'),'settings');
});
