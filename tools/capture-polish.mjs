import { execSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { capture } from './capture.mjs';
import { serve } from './serve.mjs';

if (!process.env.GAME_ROOT) execSync(process.platform === 'win32' ? 'npm.cmd run build' : 'npm run build', { stdio: 'inherit' });
const root = process.env.GAME_ROOT ?? 'dist', { server, url } = await serve(root);
const hashes=async()=>{const result={};for(const file of ['index.html',...(await readdir(join(root,'assets'))).map(name=>`assets/${name}`)])result[file]=createHash('sha256').update(await readFile(join(root,file))).digest('hex');return result;};
const summary = { pass:true, buildHashes:await hashes(), html:await readFile(join(root,'index.html'),'utf8'), runs:[] };
const cases = [
  ['training',[0]], ['battle-c',[0]], ['first-wrap',[.5]],
  ['street-both-active',[0]], ['street-one-anchor',[0]],
  ['boss-cycle-3',[0]], ['boss-vulnerable',[0]], ['square-carrying',[0]], ['square-ending',[1.5,8]],
];
function covered(scenario,frames) {
  const chapter=scenario.startsWith('street')?'toystreet':scenario.startsWith('boss')||scenario.startsWith('square')?'square':'courtyard';
  return frames.length>0&&frames.every(({state:s})=>s?.chapter===chapter
    &&(scenario!=='street-both-active'||s.activatedArenas.length===2)
    &&(scenario!=='boss-cycle-3'||s.boss?.cycle===3)
    &&(scenario!=='boss-vulnerable'||s.boss?.phase==='vulnerable')
    &&(scenario!=='square-ending'||s.coreReturned===true));
}
try {
  for (const [scenario,times] of cases) {
    const report = await capture({ page:'index.html',url,scenario,times,views:['player','diorama'],size:[1280,720],out:`captures/polish/default/${scenario}`,selftest:true });
    const semanticPass=covered(scenario,report.frames);
    summary.runs.push({scenario,profile:'default',pass:report.pass&&semanticPass,semanticPass,errors:report.errors,maxCalls:Math.max(...report.frames.map(f=>f.stats.drawCalls)),maxTriangles:Math.max(...report.frames.map(f=>f.stats.triangles))});summary.pass &&= report.pass&&semanticPass;
  }
  for (const scenario of ['training','street-both-active','boss-cycle-3','square-ending']) {
    const report = await capture({page:'index.html',url,scenario,times:[scenario==='square-ending'?1.5:0],views:['player'],size:[1920,1080],out:`captures/polish/accessible/${scenario}`,preferences:{reducedMotion:true,aimAssist:false},selftest:true,visualChecks:true});
    summary.runs.push({scenario,profile:'reduced-motion/free-aim/audit1080',pass:report.pass,errors:report.errors,audit:report.visualAudit});summary.pass &&=report.pass;
  }
  for (const scenario of ['battle-c','street-both-active','boss-cycle-3']) {
    const report=await capture({page:'index.html',url,scenario,times:[0],views:['player'],size:[1280,720],out:`captures/polish/software/${scenario}`,gpu:'swiftshader',selftest:true});
    summary.runs.push({scenario,profile:'software-correctness-not-hardware-fps',pass:report.pass,errors:report.errors,maxCalls:Math.max(...report.frames.map(f=>f.stats.drawCalls)),maxTriangles:Math.max(...report.frames.map(f=>f.stats.triangles))});summary.pass &&=report.pass;
  }
} catch(error) { summary.pass=false;summary.error=error.stack??String(error);throw error; }
finally { summary.buildHashesAfter=await hashes();if(JSON.stringify(summary.buildHashes)!==JSON.stringify(summary.buildHashesAfter)){summary.pass=false;summary.integrityError='Build files changed during captures';}await new Promise(done=>server.close(done));await mkdir('captures/polish',{recursive:true});await writeFile('captures/polish/summary.json',JSON.stringify(summary,null,2)); }
console.log(`Polish captures: ${summary.pass?'PASS':'FAIL'}`);process.exitCode=summary.pass?0:1;
