import assert from 'node:assert/strict';
import { access, copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const root='snapshots/polished-1',evidence='docs/evidence/step-09';
try {await access(root);throw Error('Polished snapshot exists; refusing overwrite');}
catch(error){if(error.code!=='ENOENT')throw error;}
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const gates=await json(`${evidence}/release-gates.json`);
for(const key of ['pass','reviewAccepted','playtestCompleted'])assert.equal(gates[key],true,key);
const captures=await json('captures/polish/summary.json'),full=await json('captures/full-playthrough/report.json');
const controls=await json('captures/polish-controls/report.json'),camera=await json('captures/polish-camera-integration/report.json');
for(const report of [captures,full,controls,camera])assert.equal(report.pass,true,'Unfinished polish gate');
const html=await readFile('dist/index.html','utf8');
assert.equal(captures.html,html);assert.equal(full.html,html);
const manifest=await json(`${evidence}/source-manifest.json`);assert.equal(manifest.html,html);assert.equal(manifest.build,gates.build);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const file of manifest.files)assert.equal(hash(await readFile(file.path)),file.sha256,`Changed source: ${file.path}`);
for(const report of [controls,camera]) {
  assert.deepEqual(report.sourceHashes,report.sourceHashesAfter,'Controlled test ran across source changes');
  for(const [path,sha256] of Object.entries(report.sourceHashes))assert.equal(hash(await readFile(path)),sha256,`Stale controlled evidence: ${path}`);
}
const files=[];
async function walk(relative=''){
  for(const entry of await readdir(join('dist',relative),{withFileTypes:true})){
    const path=join(relative,entry.name);if(entry.isDirectory())await walk(path);
    else {const source=join('dist',path),destination=join(root,path);await mkdir(join(destination,'..'),{recursive:true});await copyFile(source,destination);const sha256=hash(await readFile(source));assert.equal(hash(await readFile(destination)),sha256);files.push({path:path.replaceAll('\\','/'),sha256});}
  }
}
await walk();files.sort((a,b)=>a.path.localeCompare(b.path));
await writeFile(`${evidence}/polished-snapshot-baseline.json`,JSON.stringify({milestone:'polished-1',build:gates.build,files},null,2));
console.log(`Polished local build frozen: ${files.length} byte-identical files. Nothing published.`);
