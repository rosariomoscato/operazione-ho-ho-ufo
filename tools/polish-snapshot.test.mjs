import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile,readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('polished-1 stays byte-for-byte unchanged and has no extra files',async()=>{
  const baseline=JSON.parse(await readFile('docs/evidence/step-09/polished-snapshot-baseline.json','utf8'));
  const files=[];
  async function walk(dir,relative=''){for(const entry of await readdir(dir,{withFileTypes:true})){const path=relative?`${relative}/${entry.name}`:entry.name;if(entry.isDirectory())await walk(`${dir}/${entry.name}`,path);else files.push(path);}}
  await walk('snapshots/polished-1');assert.deepEqual(files.sort(),baseline.files.map(f=>f.path).sort());
  for(const file of baseline.files)assert.equal(createHash('sha256').update(await readFile(`snapshots/polished-1/${file.path}`)).digest('hex'),file.sha256,file.path);
});
