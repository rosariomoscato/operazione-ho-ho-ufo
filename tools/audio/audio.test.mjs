import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderAsset, encodeWav, inspectWav, contentHash } from '../gen-audio.mjs';

const manifest = JSON.parse(await readFile(new URL('./manifest/opening.json', import.meta.url), 'utf8'));
test('all free recipes render deterministic, nonclipped audio with clean seams', () => {
  for (const asset of manifest.assets) {
    const first = encodeWav(renderAsset(asset)), second = encodeWav(renderAsset(asset));
    assert.ok(first.equals(second), asset.id + ' determinism');
    const stats = inspectWav(first);
    assert.ok(Math.abs(stats.duration - asset.duration) < .001);
    assert.equal(stats.clippedSamples, 0);
    assert.ok(stats.seamDelta <= .001, asset.id + ' seam');
    assert.ok(Math.abs(stats.dcOffset) < .01);
    assert.ok(Math.abs(stats.peakDb - asset.peakDb) < .02);
    assert.ok(stats.rmsDb > -65, asset.id + ' not silent');
  }
});
test('exact request settings change the cache key', () => {
  const asset = manifest.assets[0];
  assert.equal(contentHash(asset), contentHash({ ...asset }));
  assert.notEqual(contentHash(asset), contentHash({ ...asset, seed: asset.seed + 1 }));
});
test('reject unsupported recipe and clipping', () => {
  assert.throws(() => renderAsset({ ...manifest.assets[0], recipe: 'unknown' }));
  assert.throws(() => encodeWav([1]));
  assert.throws(() => encodeWav([NaN]));
});
