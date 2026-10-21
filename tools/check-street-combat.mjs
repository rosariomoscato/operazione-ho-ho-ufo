import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { findBrowser } from './capture.mjs';

// Controlled integration fixtures, NOT a playthrough/fresh-eyes test.
// No source/dist edits, damage overrides, visibility stubs or external server.
const target=new URL(process.env.COMBAT_URL??'http://127.0.0.1:5174/');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(target.hostname),'Only a local Vite server is allowed');
const output='captures/street-combat',permanent='docs/evidence/step-08/combat';
await Promise.all([mkdir(output,{recursive:true}),mkdir(permanent,{recursive:true})]);
const sourceFiles=['src/game.ts','src/gameplay/systems/ranged.ts','src/engine/math.ts','src/storage.ts','src/levels/toystreet.ts','src/contracts.ts'];
async function hashes(){return Object.fromEntries(await Promise.all(sourceFiles.map(async file=>[file,createHash('sha256').update(await readFile(file)).digest('hex')])));}
const report={pass:false,kind:'controlled-real-Game-update-not-playthrough',url:target.href,sourceHashes:await hashes(),fixtures:{viewport:[960,540],stepSeconds:.01,raf:'playing=false',review:'true except automatic persistence/Continue assertions; RAF remains stopped',mutations:'Only initial actor/player positions, initial HP, active arena fixtures and irrelevant NPC exclusion. No methods/formulas/obstacles are overridden.',entry:'Only browser response for /src/main.ts is replaced; source and dist remain untouched.'},pageErrors:[],tests:[]};
let browser;
try{
  browser=await chromium.launch({executablePath:await findBrowser(),headless:true});
  const context=await browser.newContext({viewport:{width:960,height:540}});
  const page=await context.newPage();page.on('pageerror',error=>report.pageErrors.push(error.message));
  page.setDefaultTimeout(20000);
  await page.route(/\/src\/main\.ts(?:\?.*)?$/,route=>{report.entryIntercepted=true;return route.fulfill({contentType:'application/javascript',body:"import '/src/style.css'; import { Game } from '/src/game.ts'; window.__testGame = new Game(document.querySelector('#app'));"});});
  await page.goto(target.href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__testGame&&window.LC?.ready);
  const results=await page.evaluate(()=>{
    const g=window.__testGame,tests=[];
    const check=(condition,message)=>{if(!condition)throw Error(message);};
    const near=(actual,expected,epsilon=1e-8)=>Math.abs(actual-expected)<=epsilon;
    const freeze=()=>{g.playing=false;g.review=true;g.input.clear();g.audio.pause();};
    const fixture=id=>{g.goto(id);freeze();};
    const tick=(count=1,dt=.01)=>{for(let i=0;i<count;i++){g.update(dt);g.input.endFrame();check(!g.playing,'Manual fixture unexpectedly enabled RAF');check(g.menu!=='dead','Unexpected player death in fixture');check(committedCount()<=1,'Multiple committed attacks/individual live bolts in a simulation sample');}};
    const until=(predicate,limit,message)=>{let ticks=0;while(!predicate()&&ticks<limit){tick();ticks++;}check(predicate(),message);return ticks;};
    const events=type=>g.eventLog.filter(event=>event.type===type);
    const bolts=()=>g.systems.flatMap(system=>system.state());
    const committedCount=()=>g.enemies.filter(e=>e.hp>0&&(e.status==='windup'||e.status==='active')).length+bolts().length;
    const isolate=(keep)=>{for(const enemy of g.enemies)if(!keep.includes(enemy.key)){enemy.hp=0;enemy.status='gone';}};
    const setupShot=(cover=false)=>{
      fixture('street-left');isolate(['workshop:0']);
      const shooter=g.enemies.find(enemy=>enemy.key==='workshop:0');
      Object.assign(shooter,{x:cover?-8:0,z:cover?-5:-9,angle:0});
      Object.assign(g.player,{x:shooter.x,z:-3,hp:6,invulnerableUntil:0});
      g.yaw=0;g.renderNow();
      check(g.visible(shooter),'Real camera/LOS must see the shooter before acquisition');
      return shooter;
    };
    const run=(name,fn)=>{try{freeze();const evidence=fn();tests.push({name,pass:true,evidence});}catch(error){tests.push({name,pass:false,error:String(error),state:g.state()});}finally{freeze();}};

    run('1: real telegraph/lock and one global melee/ranged/flying-bolt slot',()=>{
      fixture('street-both-active');isolate(['workshop:0','carousel:0']);
      const shooter=g.enemies.find(e=>e.key==='workshop:0'),melee=g.enemies.find(e=>e.key==='carousel:0');
      Object.assign(shooter,{x:0,z:-10,angle:0});Object.assign(melee,{x:4,z:-7,angle:0});Object.assign(g.player,{x:0,z:-3,hp:6,invulnerableUntil:0});g.yaw=0;g.renderNow();
      check(g.visible(shooter),'Positive acquisition must use real visibility');tick();check(shooter.status==='windup','Shooter did not acquire a real visible target');
      g.player.x=.4;tick(10);const tracked=shooter.angle;check(Math.abs(tracked)>.01,'Direction did not track during initial .2 seconds');
      tick(16);const locked=shooter.angle;check(shooter.lockAt!==undefined,'Missing actual lock timestamp');g.player.x=-1;Object.assign(melee,{x:1,z:-4.6});g.renderNow();check(g.visible(melee),'Melee must be visible and eligible, not artificially hidden');
      let maxCommitted=0,lockedSamples=0;
      while(shooter.status==='windup'&&g.time<1.6){tick();maxCommitted=Math.max(maxCommitted,committedCount());check(shooter.angle===locked,'Direction tracked after lock');lockedSamples++;check(!['windup','active'].includes(melee.status),'Melee overlapped ranged wind-up');}
      const release=events('ranged-release')[0];check(release,'No real ranged release');check(release.windup>=1.2,'Wind-up below1.2s');check(release.lockedFor>=.8,'Locked interval below.8s');check(near(release.angle,locked),'Release changed locked direction');check(bolts().length===1,'Expected exactly one dangerous bolt');
      const boltDirection={dx:bolts()[0].dx,dz:bolts()[0].dz};let flightSamples=0;
      while(bolts().length&&flightSamples<400){tick();maxCommitted=Math.max(maxCommitted,committedCount());check(!['windup','active'].includes(melee.status),'Melee began while hostile bolt remained in flight');for(const bolt of bolts())check(near(bolt.dx,boltDirection.dx)&&near(bolt.dz,boltDirection.dz),'Bolt homed after release');flightSamples++;}
      check(flightSamples>0&&bolts().length===0,'Bolt did not expire/impact within bounded lifetime');check(maxCommitted<=1,'More than one global committed attack');
      const recovery=events('recovery-end').find(event=>event.id===shooter.id);check(recovery&&recovery.elapsed>=1.2,'Shooter recovery below1.2s or not observed');
      const rangedFirst={tracked,locked,lockedSamples,release,recovery,boltDirection,flightSamples,maxCommitted,boltEnd:events('bolt-end')[0]};
      fixture('street-both-active');isolate(['workshop:0','carousel:0']);const s=g.enemies.find(e=>e.key==='workshop:0'),m=g.enemies.find(e=>e.key==='carousel:0');Object.assign(s,{x:1,z:-10});Object.assign(m,{x:0,z:-5});Object.assign(g.player,{x:0,z:-3,invulnerableUntil:0});g.yaw=0;g.renderNow();check(g.visible(m)&&g.visible(s),'Both candidates must be actually visible');tick(50);check(events('attack-windup').length===1,'Expected real melee acquisition');check(events('ranged-windup').length===0,'Ranged acquired during melee committed slot');
      const meleeFirst={meleeWindup:events('attack-windup')[0],rangedWindups:events('ranged-windup').length,committed:g.state().committed};
      setupShot();g.yaw=Math.PI;g.renderNow();check(!g.visible(g.enemies[0]),'Negative fixture did not turn away from shooter');tick();check(events('ranged-windup').length===0,'Off-screen shooter acquired a target');
      return {rangedFirst,meleeFirst,realOffscreenAcquisitionRejected:true};
    });

    run('2: actual train cover wins a large-delta sweep, no HP lost',()=>{
      setupShot(true);tick(30);check(events('ranged-lock').length===1,'Shot was not locked before player moved behind cover');g.player.z=1;g.renderNow();
      check(!g.visible(g.enemies[0]),'Cover fixture must block the real acquisition LOS');until(()=>events('ranged-release').length===1,150,'Missing cover-fixture release');check(bolts().length===1,'Bolt missing before sweep stress');
      const before={time:g.time,hp:g.player.hp,bolt:bolts()[0]};tick(1,2);
      const impact=events('bolt-end').find(event=>event.reason==='cover');check(impact?.collider==='street-train-cover','Wrong first collider, or no cover impact');check(g.player.hp===6,'Damage crossed actual train cover');check(events('player-hurt').length===0,'Unexpected hurt event behind cover');check(bolts().length===0,'Cover impact did not consume bolt');
      return {manualStressDelta:2,before,impact,hp:g.player.hp,obstacles:g.world.obstacles};
    });

    run('3: covered acquisition rejected, clear lane gives exactly one damage per bolt',()=>{
      setupShot(true);g.player.z=1;g.renderNow();check(!g.visible(g.enemies[0]),'Wall negative fixture has clear LOS');tick();check(events('ranged-windup').length===0,'Acquisition ignored real cover');
      setupShot(false);until(()=>events('bolt-end').length===1,300,'Clear-lane bolt did not reach player');tick(20);
      const hits=events('player-hurt'),end=events('bolt-end')[0];check(g.player.hp===5,'Clear lane must apply exactly1HP damage');check(hits.length===1,'Bolt damaged more than once');check(end.reason==='player'&&hits[0].attackId===end.attackId,'Damage not associated with consumed bolt ID');check(bolts().length===0,'Consumed clear-lane bolt still active');
      return {coveredAcquisitionRejected:true,hp:g.player.hp,hits,impact:end};
    });

    run('4: real Game.dodge during arrival avoids damage and consumes bolt',()=>{
      setupShot(false);until(()=>bolts().some(bolt=>Math.hypot(bolt.x-g.player.x,bolt.z-g.player.z)<1.5),300,'No incoming bolt within dodge fixture range');const before={time:g.time,hp:g.player.hp,player:{...g.player},bolt:bolts()[0]};g.dodge();const started=g.time,protectedUntil=g.player.invulnerableUntil;
      check(protectedUntil>started,'Real dodge did not grant movement protection');until(()=>events('bolt-end').length===1,80,'Dodged bolt did not resolve');
      const avoided=events('hit-avoided'),impact=events('bolt-end')[0];check(g.player.hp===6,'Dodge fixture lost HP');check(events('player-hurt').length===0,'Damage applied during dodge protection');check(avoided.length===1&&avoided[0].kind==='ranged','Missing actual ranged hit-avoided event');check(impact.reason==='player'&&impact.attackId===avoided[0].attackId,'Protected contact did not consume the same bolt');check(bolts().length===0,'Dodged bolt remains dangerous');
      return {before,dodgeStarted:started,protectedUntil,hp:g.player.hp,avoided:avoided[0],impact};
    });

    run('5: healing +2, cap6, no farm after actual retry/Continue',()=>{
      fixture('street-left-clear');Object.assign(g.player,{x:0,z:0,hp:3});g.review=false;tick();g.review=true;
      check(g.player.hp===5&&g.healed&&!g.healAvailable,'Pickup did not heal3→5 and consume once');const pickupHP=g.player.hp,saved=JSON.parse(localStorage.getItem('ho-ho-ufo.checkpoint.v2'));check(saved.healed===true&&saved.chapter==='toystreet','Automatic pickup boundary was not persisted');tick(20);check(g.player.hp===5,'Standing on consumed pickup healed again');
      g.retry();freeze();check(g.act.id==='toystreet'&&g.player.hp===6&&g.healed&&!g.healAvailable,'Retry lost healing flag or chapter');Object.assign(g.player,{x:0,z:0,hp:3});tick();check(g.player.hp===3,'Retry recreated consumed cure');const retry={chapter:g.act.id,hp:g.player.hp,healed:g.healed,available:g.healAvailable};
      g.continueGame();freeze();check(g.act.id==='toystreet'&&g.healed&&!g.healAvailable,'Continue lost consumed cure');Object.assign(g.player,{x:0,z:0,hp:3});tick();check(g.player.hp===3,'Continue recreated consumed cure');const continued={chapter:g.act.id,hp:g.player.hp,healed:g.healed,available:g.healAvailable};
      fixture('street-left-clear');Object.assign(g.player,{x:0,z:0,hp:6});tick();check(g.player.hp===6&&!g.healed&&g.healAvailable,'Full health consumed the cure');g.player.hp=5;tick();check(g.player.hp===6&&g.healed&&!g.healAvailable,'Cure exceeded cap6 or failed5→6');
      return {pickupFrom3:pickupHP,saved,retry,continued,fullHealthPreservedPickup:true,cappedFrom5:g.player.hp};
    });

    run('6: actual ship node8/5.5/3, live E descent and completed restore already3',()=>{
      fixture('street-complete');const seek=[];for(const [time,height]of[[0,8],[1.5,5.5],[3,3]]){g.seek(time);const actual=g.world.root.getObjectByName('Nave verso la piazza')?.position.y;check(near(actual,height),'Wrong actual ship height at seek '+time);seek.push({time,height:actual});}
      fixture('street-right-last');tick(70);g.interact();check(g.beat==='street-complete'&&g.anchorCount()===3,'Live second E did not immediately complete3/3');const start=g.time,live=[];for(const [ticks,height]of[[0,8],[150,5.5],[150,3]]){tick(ticks);g.renderNow();const actual=g.getStats().shipHeight;check(near(actual,height),'Wrong live ship height at '+g.time);live.push({time:g.time,height:actual});}
      g.review=false;g.save('street-complete');g.review=true;g.continueGame();freeze();const actual=g.getStats().shipHeight;check(g.time===0&&near(actual,3),'Completed Continue replayed descent instead of restoring already down');check(g.anchorCount()===3,'Completed Continue lost anchor count');
      return {seek,liveStart:start,live,restored:{time:g.time,height:actual,count:g.anchorCount()}};
    });

    run('7: E gives local protected/range reasons; either cleared side works independently',()=>{
      fixture('street-left');Object.assign(g.player,{x:-8,z:-7});g.interact();let denied=events('interact-denied').at(-1);check(denied?.reason==='protected'&&denied.id==='workshop'&&denied.guards===3,'Wrong local protected denial');check(g.feedback.includes('protetto')&&g.feedbackUntil>g.time,'Protected interaction has no visible explanation');g.renderHUD();check(g.hud.querySelector('.hint')?.textContent===g.feedback,'Protected reason not rendered into visible hint');const protectedResult={event:denied,feedback:g.feedback};
      fixture('street-start');g.interact();denied=events('interact-denied').at(-1);check(denied?.reason==='out-of-range'&&denied.distance>2.2,'Missing out-of-range reason');g.renderHUD();check(g.hud.querySelector('.hint')?.textContent===g.feedback,'Out-of-range reason not rendered into visible hint');const far={event:denied,feedback:g.feedback};
      const independent=[];for(const [scenario,id,other]of[['street-left-clear','workshop','carousel'],['street-right-clear','carousel','workshop']]){fixture(scenario);const remaining=g.living().filter(e=>e.arenaId===other).length;check(remaining===3,'Other side must remain hostile for independence fixture');g.interact();check(g.disabledAnchors.includes(id)&&!g.disabledAnchors.includes(other)&&g.anchorCount()===2,'Uncleared other side blocked local E or incorrectly completed');g.interact();check(g.anchorCount()===2&&g.disabledAnchors.length===1,'Repeated E double counted');independent.push({side:id,otherLiving:remaining,disabled:[...g.disabledAnchors],count:g.anchorCount(),feedback:g.feedback});}
      return {protected:protectedResult,far,independent};
    });
    freeze();return tests;
  });
  report.tests=results;
  assert.equal(results.length,7,'All seven verification groups must run');
  assert.ok(results.every(test=>test.pass),'Controlled combat assertion failed; see report');
  assert.deepEqual(report.pageErrors,[],'Browser emitted a page error');
  report.sourceHashesAfter=await hashes();assert.deepEqual(report.sourceHashesAfter,report.sourceHashes,'Core changed during verification: rerun against a stable source');
  report.pass=true;
}catch(error){report.error=error.stack??String(error);process.exitCode=1;}
finally{
  const json=JSON.stringify(report,null,2);await Promise.all([writeFile(`${output}/report.json`,json),writeFile(`${permanent}/report.json`,json)]);
  console.log(JSON.stringify({pass:report.pass,kind:report.kind,tests:report.tests.map(({name,pass,error})=>({name,pass,error})),error:report.error,output:`${permanent}/report.json`},null,2));
  if(browser)await browser.close();
}
