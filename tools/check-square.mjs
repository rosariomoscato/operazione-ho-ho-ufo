import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { findBrowser } from './capture.mjs';

// Controlled real-Game fixtures, NOT the separate input-only full playthrough.
const url = process.env.COMBAT_URL ?? 'http://127.0.0.1:5174/';
assert.ok(['localhost','127.0.0.1'].includes(new URL(url).hostname));
const out = 'captures/square-controlled'; await mkdir(out,{recursive:true});
const files = ['src/game.ts','src/gameplay/boss.ts','src/gameplay/bossChapter.ts','src/gameplay/bossVisual.ts','src/storage.ts','src/levels/square.ts'];
const hashes = async () => Object.fromEntries(await Promise.all(files.map(async f=>[f,createHash('sha256').update(await readFile(f)).digest('hex')])));
const report = { pass:false, kind:'controlled-real-Game-update-not-playthrough', sourceHashes:await hashes(), tests:[], errors:[] };
const browser = await chromium.launch({executablePath:await findBrowser(),headless:true});
const page = await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',e=>report.errors.push(e.message));
try {
  await page.route(/\/src\/main\.ts(?:\?.*)?$/,route=>route.fulfill({contentType:'application/javascript',body:"import '/src/style.css'; import {Game} from '/src/game.ts'; import {SAVE_KEY} from '/src/storage.ts'; window.__saveKey=SAVE_KEY; window.__testGame=new Game(document.querySelector('#app'));"}));
  // These are simulation/input fixtures; media loading is audited separately.
  // Wait for the explicit Game readiness contract, not the document's optional
  // audio/network load event on a cold development server.
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>window.__testGame&&window.LC?.ready);
  report.tests=await page.evaluate(()=>{
    const g=window.__testGame,tests=[];
    const check=(ok,message)=>{if(!ok)throw Error(message);};
    const freeze=()=>{g.playing=false;g.review=true;g.input.clear();g.audio.pause();};
    const fixture=id=>{g.goto(id);freeze();};
    const tick=(n=1)=>{for(let i=0;i<n;i++){g.update(.01);g.input.endFrame();check(g.menu!=='dead','Unexpected fixture death');check(!g.playing,'Fixture accidentally enabled RAF');}};
    const until=(condition,limit=2000)=>{for(let i=0;i<limit&&!condition();i++)tick();check(condition(),'Controlled phase deadline exceeded');};
    const events=type=>g.eventLog.filter(e=>e.type===type);
    const start=()=>{fixture('square-entry');Object.assign(g.player,{x:0,z:3,hp:6,invulnerableUntil:0});g.yaw=0;g.renderNow();tick();check(g.beat==='boss','Approach did not activate encounter');};
    const run=(name,fn)=>{try{const evidence=fn();tests.push({name,pass:true,evidence});}catch(error){tests.push({name,pass:false,error:String(error),state:g.state()});}finally{freeze();}};
    run('approach saves before first real windup and a real cone damages once',()=>{
      start();const encounter=events('boss-encounter')[0];check(encounter?.checkpointBeforeAttack,'Missing checkpoint-before-attack evidence');
      until(()=>g.boss.phase==='active');const active=events('boss-active')[0];check(active.windup>=1.4&&active.lockedFor>=.8,'Real windup/lock too short');
      until(()=>g.boss.phase==='vulnerable');const hurt=events('player-hurt');check(hurt.length===1&&g.player.hp===5,'One cone did not give exactly one damage');
      check(g.boss.windowUntil-g.boss.windowStarted>=5.5-1e-8,'Window shorter than5.5s');
      return {encounter,active,hurt,window:g.boss.state(g.time)};
    });
    run('real dodge protects a cone contact and preserves completed segments',()=>{
      start();until(()=>g.boss.phase==='windup'&&g.time-g.boss.since>=1.35);
      g.input.keys.add('KeyA');g.dodge();g.input.keys.clear();until(()=>g.boss.phase==='vulnerable');
      check(g.player.hp===6,'Actual dodge lost HP');check(events('dodge').length===1,'Actual dodge not called');
      check(events('hit-avoided').some(e=>e.kind==='boss'),'No real protected boss contact observed');
      return {hp:g.player.hp,avoided:events('hit-avoided'),dodge:events('dodge')[0]};
    });
    run('real gift prefire is rejected and two valid launches cannot double-hit one window',()=>{
      start();until(()=>g.boss.phase==='active');g.throwGift();tick(100);
      check(g.boss.segments===0,'Prefire stole a boss segment');check(events('boss-gift-rejected').length>0,'Missing prefire rejection');
      check(g.boss.phase==='vulnerable','Prefire fixture missed the open window');
      g.throwGift();tick(56);g.throwGift();tick(110);
      check(g.boss.segments===1,'Duplicate gifts counted more than one segment');check(events('boss-segment-hit').length===1,'Unexpected hit count');
      return {segments:g.boss.segments,hits:events('boss-segment-hit'),rejected:events('boss-gift-rejected')};
    });
    run('late real gift misses its launch window without losing previous progress',()=>{
      start();until(()=>g.boss.phase==='vulnerable');until(()=>g.boss.windowUntil-g.time<.3);
      g.throwGift();tick(110);check(g.boss.segments===0,'Late gift counted after its window closed');
      check(events('boss-window-miss').length===1,'Missed window did not restart its pattern');check(events('boss-gift-rejected').length>0,'Late gift rejection not observed');
      return {phase:g.boss.phase,segments:g.boss.segments,miss:events('boss-window-miss'),rejected:events('boss-gift-rejected')};
    });
    run('core cannot be skipped; pickup, return and terminal Continue persist',()=>{
      fixture('square-core');Object.assign(g.player,{x:8,z:-4.4});g.interact();check(events('interact-denied').at(-1)?.reason==='no-core','Tree accepted missing core');
      Object.assign(g.player,{x:0,z:-3});g.interact();check(events('interact-denied').at(-1)?.reason==='out-of-range','Remote core was accepted');
      Object.assign(g.player,{x:0,z:-5});g.review=false;g.interact();freeze();check(g.beat==='return-core'&&g.square.coreCarried&&!g.square.coreReturned,'Core pickup order broken');
      let saved=JSON.parse(localStorage.getItem(window.__saveKey));check(saved.coreCarried&&!saved.coreReturned&&saved.bossSegments===3,'Pickup did not save immediately');
      g.retry();freeze();check(g.beat==='return-core'&&g.square.coreCarried&&g.player.hp===6,'Retry lost carried core');
      Object.assign(g.player,{x:8,z:-4.4});g.review=false;g.interact();freeze();check(g.beat==='ending'&&g.square.coreReturned,'Accessible tree interaction failed');
      saved=JSON.parse(localStorage.getItem(window.__saveKey));check(saved.coreReturned,'Return did not persist before animation');
      g.continueGame();freeze();g.renderNow();check(g.beat==='ending'&&g.square.state().completed,'Continue replayed unfinished ending or resurrected boss');
      return {saved,state:g.square.state()};
    });
    run('real parcel/scarf supports and world withdrawal are measured across ending poses',()=>{
      fixture('square-ending');const frames=[];
      for(const time of [0,1.5,3.5,5,8,1.5]){
        g.seek(time);const ship=g.world.root.getObjectByName('Nave di Squamakk'),portal=g.world.root.getObjectByName('Portale alieno');
        const scarf=g.square.visual.measureScarfContacts(),support=g.square.visual.measureShipSupport();
        for(const c of [...scarf,...support])check(Number.isFinite(c.value)&&c.value<=c.limit,c.name);
        if(time===1.5){check(g.square.visual.scarfVisible&&g.square.visual.onShip,'Scarf/parcel presentation missing');check(scarf.length>0&&support.length>0,'Support checks absent during actual presentation');}
        if(time>=5)check(!ship.visible&&!portal.visible,'Ship/portal still visible after5s');
        frames.push({time,shipVisible:ship.visible,portalVisible:portal.visible,scarf,support});
      }
      check(g.selfTest().pass,'Final fixture selfTest failed');return {frames};
    });
    run('15/30/45 help ladder fires before approach and progress resets it',()=>{
      fixture('square-entry');tick(4510);const hints=events('help');
      for(const stage of [1,2,3])check(hints.some(e=>e.stage===stage&&e.stalled>=stage*15),'Missing stuck hint stage '+stage);
      Object.assign(g.player,{x:0,z:3});g.renderNow();tick();check(g.hintStage===0&&g.time-g.lastProgress<.1,'Encounter did not reset help ladder');
      return {hints,lastProgress:g.lastProgress,time:g.time};
    });
    return tests;
  });
  await page.evaluate(()=>{__testGame.goto('boss-vulnerable');LC.play();});
  await page.keyboard.press('Escape');
  const paused=await page.evaluate(()=>LC.state());
  await page.waitForTimeout(1000);
  const afterPause=await page.evaluate(()=>LC.state());
  assert.equal(afterPause.time,paused.time);assert.equal(afterPause.boss.windowUntil,paused.boss.windowUntil);assert.equal(afterPause.boss.phase,paused.boss.phase);
  await page.getByRole('button',{name:'Riprendi',exact:true}).click();await page.waitForTimeout(150);
  const resumed=await page.evaluate(()=>LC.state());assert.ok(resumed.time>paused.time);
  await page.evaluate(()=>LC.pause());
  report.tests.push({name:'real Esc pause freezes the vulnerable boss clock/window and resumes explicitly',pass:true,evidence:{pausedTime:paused.time,afterPauseTime:afterPause.time,resumedTime:resumed.time,windowUntil:paused.boss.windowUntil}});
  const firstInput=await page.evaluate(()=>{
    const g=__testGame;g.goto('boss-vulnerable');g.input.clear();g.lastFrame=0;g.menu='none';g.playing=true;
    g.input.throwRequested=true;g.frame(1000);
    const pendingAfterFirst=g.input.throwRequested;
    g.frame(1000+1000/60);g.playing=false;
    const throws=g.eventLog.filter(e=>e.type==='throw').length;
    g.goto('square-core');Object.assign(g.player,{x:0,z:-5});g.lastFrame=0;g.menu='none';g.playing=true;g.input.pressed.add('KeyE');
    g.frame(2000);g.frame(2000+1000/60);g.playing=false;
    const corePicked=g.beat==='return-core'&&g.square.coreCarried;
    return {pass:throws===1&&corePicked,pendingAfterFirst,throws,corePicked,kind:'controlled first-RAF gift/E input queue, no clock timing claim'};
  });
  report.tests.push({name:'first input after resume survives the initial zero-delta animation frame',pass:firstInput.pass,evidence:firstInput});
  report.sourceHashesAfter=await hashes();assert.deepEqual(report.sourceHashesAfter,report.sourceHashes,'Source changed while test ran; rerun on a stable revision');
  report.pass=report.tests.length===9&&report.tests.every(t=>t.pass)&&report.errors.length===0;
  if(!report.pass)process.exitCode=1;
} catch(error){report.errors.push(error.stack??String(error));process.exitCode=1;}
finally {await browser.close();await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({pass:report.pass,tests:report.tests.map(t=>({name:t.name,pass:t.pass,error:t.error})),errors:report.errors},null,2));
