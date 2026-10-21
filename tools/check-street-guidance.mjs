import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { serve } from './serve.mjs';
import { findBrowser } from './capture.mjs';
const out='captures/street-guidance';await mkdir(out,{recursive:true});
const report={pass:false,checks:[],errors:[]};const {server,url}=await serve('dist');
const browser=await chromium.launch({executablePath:await findBrowser(),headless:true});
const page=await browser.newPage({viewport:{width:1280,height:720}});
page.on('pageerror',e=>report.errors.push(e.message));
const state=()=>page.evaluate(()=>LC.state());
try {
  await page.goto(url);await page.waitForFunction(()=>window.LC?.ready);
  await page.evaluate(()=>{LC.goto('street-start');LC.play();});
  await page.keyboard.press('KeyH');await page.waitForTimeout(200);
  assert.ok((await state()).eventLog.some(e=>e.type==='help'));
  report.checks.push('H displays an immediate hint without a required delay');
  await page.keyboard.press('Escape');const paused=await state();
  await page.waitForTimeout(1400);assert.equal((await state()).time,paused.time);
  assert.equal((await state()).hintStage,paused.hintStage);
  report.checks.push('Pause freezes hint clock and stage');
  await page.getByRole('button',{name:'Riprendi',exact:true}).click();
  for(const stage of [1,2,3]) {
    await page.waitForFunction(stage=>LC.state().hintStage>=stage,stage,{timeout:100000});
    const s=await state();const hint=s.eventLog.find(e=>e.type==='help'&&e.stage===stage&&e.stalled>=stage*15);
    assert.ok(hint,`Hint ${stage} fired at ${stage*15} simulated seconds`);
    await page.screenshot({path:`${out}/hint-${stage}.png`});
    report.checks.push(`Hint ${stage} triggered after ${hint.stalled.toFixed(2)}s without progress`);
  }
  // First arena entry is real player progress; it must reset the ladder.
  await page.keyboard.down('KeyW');
  await page.waitForFunction(()=>LC.state().player.z<0,null,{timeout:60000});
  await page.keyboard.up('KeyW');
  await page.keyboard.down('KeyA');
  await page.waitForFunction(()=>LC.state().activatedArenas.length>0,null,{timeout:60000});
  await page.keyboard.up('KeyA');
  const progressed=await state();assert.ok(progressed.activatedArenas.length>0,'Walk must activate an arena');
  assert.equal(progressed.hintStage,0);assert.ok(progressed.time-progressed.lastProgress<15);
  report.checks.push('Actual arena entry resets hint ladder');
  report.final=progressed;assert.deepEqual(report.errors,[]);report.pass=true;
} catch(error) {report.errors.push(error.stack??String(error));report.failure=await state().catch(()=>null);process.exitCode=1;}
finally {await browser.close();await new Promise(done=>server.close(done));await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({pass:report.pass,checks:report.checks,errors:report.errors},null,2));
