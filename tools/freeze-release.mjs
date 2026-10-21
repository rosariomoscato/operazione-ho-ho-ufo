import assert from 'node:assert/strict';
import { access, copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

// Local artifact only. This tool never publishes and never overwrites a snapshot.
const root = 'snapshots/release-candidate';
try { await access(root); throw Error('Release candidate already exists; refusing to overwrite it'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const readJSON = async path => JSON.parse(await readFile(path, 'utf8'));
const gates = await readJSON('docs/evidence/step-08-m3/release-gates.json');
const full = await readJSON('captures/full-playthrough/report.json');
const captures = await readJSON('captures/square/summary.json');
assert.equal(gates.pass, true, 'Release gates are not complete');
assert.equal(gates.reviewAccepted, true, 'Combined review is not accepted');
assert.equal(gates.playtestCompleted, true, 'Independent playtest is not complete');
assert.equal(full.pass, true, 'New game to ending playthrough failed');
assert.equal(captures.pass, true, 'Final act capture suite failed');
const html = await readFile('dist/index.html', 'utf8');
assert.equal(full.html, html, 'Current build differs from the tested release');
assert.equal(captures.html, html, 'Capture suite belongs to a different build');
const manifest = await readJSON('docs/evidence/step-08-m3/final/source-manifest.json');
assert.equal(manifest.build, gates.build, 'Source manifest belongs to a different release');
assert.equal(manifest.html, html, 'Source manifest is not associated with this bundle');
for (const file of manifest.files) {
  assert.equal(createHash('sha256').update(await readFile(file.path)).digest('hex'), file.sha256, `Source changed after validation: ${file.path}`);
}
const files = [], hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function walk(relative = '') {
  for (const entry of await readdir(join('dist', relative), { withFileTypes: true })) {
    const path = join(relative, entry.name);
    if (entry.isDirectory()) await walk(path);
    else {
      const source = join('dist', path), destination = join(root, path);
      await mkdir(join(destination, '..'), { recursive: true }); await copyFile(source, destination);
      const sha256 = hash(await readFile(source)); assert.equal(hash(await readFile(destination)), sha256, path);
      files.push({ path: path.replaceAll('\\', '/'), sha256 });
    }
  }
}
await walk(); files.sort((a,b) => a.path.localeCompare(b.path));
await writeFile('docs/evidence/step-08-m3/release-snapshot-baseline.json', JSON.stringify({ milestone: 'release-candidate', build: gates.build, files }, null, 2));
console.log(`Release candidate frozen: ${files.length} byte-identical files; no publication.`);
