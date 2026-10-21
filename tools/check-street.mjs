import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { findBrowser } from './capture.mjs';
import { serve } from './serve.mjs';

// Seed only the chapter boundary. All progress afterwards uses real input.
// State inspection is allowed here; this is NOT the fresh-eyes playtest.
const math = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(await readFile('src/engine/math.ts','utf8'))).toString('base64')}`);
const obstacles = [
  { minX:-14,maxX:-10,minZ:-1,maxZ:4 }, { minX:10,maxX:14,minZ:-1,maxZ:4 },
  { minX:-10,maxX:-6,minZ:-2,maxZ:-.5 }, { minX:6,maxX:10,minZ:-2,maxZ:-.5 },
];
const out='captures/street-integration'; await mkdir(out,{recursive:true});
const report={pass:false,errors:[],runs:[]}; const {server,url}=await serve(process.env.GAME_ROOT??'dist');
const browser=await chromium.launch({executablePath:await findBrowser(),headless:true});
let page;
const state=()=>page.evaluate(()=>LC.state());
async function face(target) {
  for(let i=0;i<5;i++) {
    const s=await state(), desired=Math.atan2(s.player.x-target.x,s.player.z-target.z);
    const delta=Math.atan2(Math.sin(desired-s.camera.yaw),Math.cos(desired-s.camera.yaw));
    if(Math.abs(delta)<.025)break;
    const dx=Math.max(-240,Math.min(240,-delta/.004));
    await page.mouse.move(640,360);await page.mouse.down({button:'right'});
    await page.mouse.move(640+dx,360,{steps:3});await page.mouse.up({button:'right'});
    await page.waitForTimeout(60);
  }
}
async function walk(goal,stop=1.6) {
  for(let i=0;i<100;i++) {
    const s=await state();assert.equal(s.chapter,'toystreet','Chapter changed while navigating');assert.ok(s.player.hp>0,'Bot died while navigating');
    if(math.distance(s.player,goal)<stop)return;
    const waypoint=math.nextWaypoint(s.player,goal,obstacles,.55);
    await face(waypoint);await page.keyboard.down('KeyW');
    await page.waitForTimeout(Math.min(250,Math.max(60,(math.distance(s.player,waypoint)-.25)/4.3*1000)));
    await page.keyboard.up('KeyW');
  }
  throw Error(`Navigation stalled: ${JSON.stringify(goal)}`);
}
async function restore() {
  const before=await state();await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Ricomincia checkpoint',exact:true}).click();
  const retry=await state();
  for(const field of ['disabledAnchors','clearedArenas','defeatedEnemies','healed']) assert.deepEqual(retry[field],before[field],`Retry: ${field}`);
  await page.reload();await page.waitForFunction(()=>window.LC?.ready);
  await page.getByRole('button',{name:'Continua',exact:true}).click();
  const continued=await state();
  for(const field of ['disabledAnchors','clearedArenas','defeatedEnemies','healed']) assert.deepEqual(continued[field],before[field],`Continue: ${field}`);
  assert.equal(continued.chapter,'toystreet');
  if(before.defeatedEnemies.some(key=>key.startsWith('workshop:')))assert.equal(continued.rangedLearned,true,'Saved ranged success remains learned after Continue');
}
try {
  for(const order of [['workshop','carousel'],['carousel','workshop']]) {
    const context=await browser.newContext({viewport:{width:1280,height:720}});
    page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
    await page.addInitScript(()=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('ho-ho-ufo.checkpoint.v2',JSON.stringify({version:2,chapter:'toystreet',boundary:'street',healed:false,firstWrapped:true,disabledAnchors:[],clearedArenas:[],activatedArenas:[],defeatedEnemies:[]}));sessionStorage.setItem('seeded','1');}});
    await page.goto(url);await page.waitForFunction(()=>window.LC?.ready);
    await page.getByRole('button',{name:'Continua',exact:true}).click();
    const run={order,shots:0,checks:[],started:Date.now()};report.runs.push(run);
    await page.keyboard.press('KeyE');await page.waitForTimeout(150);
    assert.equal((await state()).disabledAnchors.length,0);
    run.checks.push('Remote interaction does not activate an anchor');
    for(const id of order) {
      await walk({x:id==='workshop'?-8:8,z:-4},4);
      for(let attempt=0;attempt<70;attempt++) {
        const s=await state();assert.equal(s.chapter,'toystreet',`Chapter changed during ${id} combat attempt ${attempt}`);assert.ok(s.player.hp>0,'Bot died in combat');
        run.trace??=[];run.trace.push({id,attempt,chapter:s.chapter,time:s.time,player:s.player,remaining:s.remaining,events:s.eventLog.slice(-4)});
        if(s.clearedArenas.includes(id))break;
        const enemies=s.enemies.filter(e=>e.arenaId===id&&e.hp>0).sort((a,b)=>math.distance(a,s.player)-math.distance(b,s.player));
        const enemy=enemies[0]; if(!enemy){await page.waitForTimeout(150);continue;}
        if(math.distance(s.player,enemy)>8||!math.lineClear(s.player,enemy,obstacles,.2)) {await walk(enemy,5);continue;}
        await face(enemy);
        const beforeClick=await state();
        assert.ok(beforeClick.player.hp>0&&beforeClick.playing,'Bot died or paused while aiming; do not click a menu by accident');
        assert.equal(beforeClick.chapter,'toystreet','Chapter changed while aiming');
        await page.mouse.click(640,360);run.shots++;
        if(s.bolts.length||s.enemies.some(e=>e.status==='windup'))await page.keyboard.press('Space');
        await page.waitForTimeout(650);
      }
      assert.ok((await state()).clearedArenas.includes(id),`${id} must be cleared`);
      await restore();run.checks.push(`${id}: cleared progress survives retry and reload before E`);
      await walk({x:id==='workshop'?-8:8,z:-9});await page.keyboard.press('KeyE');await page.waitForTimeout(180);
      assert.ok((await state()).disabledAnchors.includes(id));
      await page.keyboard.press('KeyE');await page.waitForTimeout(100);
      assert.equal(new Set((await state()).disabledAnchors).size,(await state()).disabledAnchors.length);
      await restore();run.checks.push(`${id}: anchor survives retry/Continue, no duplicate activation`);
    }
    const final=await state();assert.equal(final.beat,'street-complete');assert.equal(final.anchorCount,3);
    assert.equal((await page.evaluate(()=>LC.selfTest())).pass,true);
    await page.screenshot({path:`${out}/${order[0]}-complete.png`});
    run.final=final;run.wallSeconds=(Date.now()-run.started)/1000;await context.close();
  }
  assert.deepEqual(report.errors,[]);report.pass=true;
} catch(error) {
  report.errors.push(error.stack??String(error));process.exitCode=1;
  if(page&&!page.isClosed()){report.failureState=await state().catch(()=>null);await page.screenshot({path:`${out}/failure.png`}).catch(()=>{});}
} finally {
  await browser.close();await new Promise(done=>server.close(done));
  await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
}
console.log(JSON.stringify({pass:report.pass,runs:report.runs.map(({order,shots,checks,wallSeconds})=>({order,shots,checks,wallSeconds})),errors:report.errors},null,2));
