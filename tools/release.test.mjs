import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('frozen full-game release candidate stays byte-for-byte unchanged', async () => {
  const manifest = JSON.parse(await readFile('docs/evidence/step-08-m3/release-snapshot-baseline.json','utf8'));
  assert.equal(manifest.build,'D86qgQyq'); assert.equal(manifest.files.length,27);
  for (const file of manifest.files) {
    const bytes = await readFile(`snapshots/release-candidate/${file.path}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);
  }
});
