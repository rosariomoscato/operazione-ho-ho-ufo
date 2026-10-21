import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { findBrowser } from './capture.mjs';

// Controlled camera poses, not a playthrough. Only the browser entry is replaced.
const url=process.env.COMBAT_URL??'http://127.0.0.1:5174/';
assert.ok(['127.0.0.1','localhost'].includes(new URL(url).hostname));
const out='captures/polish-camera-integration';await mkdir(out,{recursive:true});
const sources=['src/game.ts','src/engine/camera.ts','src/engine/camera-props.ts','src/levels/courtyard.ts','src/levels/toystreet.ts','src/levels/square.ts'];
const hashes=async()=>Object.fromEntries(await Promise.all(sources.map(async path=>[path,createHash('sha256').update(await readFile(path)).digest('hex')])));
const report={pass:false,sourceHashes:await hashes(),kind:'controlled geometry grid; rendered budget/visual checks in separate named snapshots',errors:[],grids:[]};
const browser=await chromium.launch({executablePath:await findBrowser(),headless:true});
const page=await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',e=>report.errors.push(e.message));
try {
  await page.route(/\/src\/main\.ts(?:\?.*)?$/,route=>route.fulfill({contentType:'application/javascript',body:"import '/src/style.css'; import {Game} from '/src/game.ts'; import {materials} from '/src/visual/style.ts'; window.__shared=materials; window.__testGame=new Game(document.querySelector('#app'));"}));
  await page.goto(url);await page.waitForFunction(()=>window.__testGame&&window.LC?.ready);
  report.grids=await page.evaluate(()=>{
    const g=__testGame,T={Vector3:__testGame.camera3.position.constructor},results=[];
    const check=(ok,message)=>{if(!ok)throw Error(message);};
    const shared=()=>Object.fromEntries(Object.entries(__shared).map(([key,m])=>[key,{opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite,color:m.color.getHexString()}]));
    const baseline=JSON.stringify(shared());
    for(const scenario of ['battle-c','street-both-active','square-entry']) {
      g.goto(scenario);g.playing=false;g.review=true;
      check(g.world.cameraOccluders?.length>0,'Missing real camera occluder metadata for '+scenario);
      const points=[];
      for(const o of g.world.obstacles) {
        const x=(o.minX+o.maxX)/2,z=(o.minZ+o.maxZ)/2;
        points.push({x:o.minX-.7,z},{x:o.maxX+.7,z},{x,z:o.minZ-.7},{x,z:o.maxZ+.7});
      }
      let poses=0,minDistance=Infinity,minClearance=Infinity,maxHeadFraction=0,maxDrawCalls=0,maxTriangles=0,renderedViews=0;
      for(const p of points) {
        if(p.x< -14.5||p.x>14.5||p.z< -14.5||p.z>12.5)continue;
        if(g.world.obstacles.some(o=>Math.hypot(p.x-Math.max(o.minX,Math.min(o.maxX,p.x)),p.z-Math.max(o.minZ,Math.min(o.maxZ,p.z)))<.48))continue;
        Object.assign(g.player,p);g.santa.root.position.set(p.x,0,p.z);
        for(let yaw=0;yaw<8;yaw++)for(const pitch of [.08,.3,.65]) {
          g.yaw=yaw*Math.PI/4;g.pitch=pitch;g.updateCamera();
          const first=g.camera3.position.clone();g.updateCamera();check(first.distanceTo(g.camera3.position)<1e-8,'Camera is history-dependent at an identical pose');
          const distance=g.camera3.position.distanceTo(new T.Vector3(p.x,1.7,p.z));
          check(Number.isFinite(distance)&&distance>=3-.001,'Camera compressed into avatar: '+distance);minDistance=Math.min(minDistance,distance);
          for(const occluder of g.world.cameraOccluders)for(const box of occluder.bounds) {
            const clearance=box.distanceToPoint(g.camera3.position);minClearance=Math.min(minClearance,clearance);
            check(clearance>=.2-.001,'Camera near plane inside solid '+occluder.id+': '+clearance+' '+JSON.stringify({scenario,player:p,yaw:g.yaw,pitch,camera:g.camera3.position.toArray()}));
          }
          const head=new T.Vector3(p.x,1.85,p.z).project(g.camera3);
          check(head.z> -1&&head.z<1&&Math.abs(head.x)<1.05&&Math.abs(head.y)<1.05,'Avatar head left the gameplay view');
          const top=new T.Vector3(p.x,2.26,p.z).project(g.camera3),bottom=new T.Vector3(p.x,1.44,p.z).project(g.camera3);
          const fraction=Math.abs(top.y-bottom.y)/2;maxHeadFraction=Math.max(maxHeadFraction,fraction);check(fraction<.45,'Head fills gameplay screen');poses++;
          if(pitch===.3){g.renderer.render(g.scene,g.camera3);const stats=g.getStats();maxDrawCalls=Math.max(maxDrawCalls,stats.drawCalls);maxTriangles=Math.max(maxTriangles,stats.triangles);renderedViews++;check(stats.drawCalls<=150&&stats.triangles<=150000,'Over-budget camera view '+JSON.stringify({scenario,p,yaw,stats}));}
        }
      }
      g.view='diorama';g.updateCamera();check(JSON.stringify(shared())===baseline,'Camera modified shared palette materials');
      results.push({scenario,poses,minDistance,minClearance,maxHeadFraction,renderedViews,maxDrawCalls,maxTriangles});
    }
    check(JSON.stringify(shared())===baseline,'Shared material mutation leaked across acts');return results;
  });
  for(const [name,scenario,p,yaw] of [
    ['right-shop','street-both-active',{x:9.3,z:1.5},Math.PI/2],
    ['tree','square-entry',{x:8,z:-4.4},Math.PI],
  ]) {
    const result=await page.evaluate(({scenario,p,yaw})=>{const g=__testGame;g.goto(scenario);g.playing=false;g.review=true;Object.assign(g.player,p);g.yaw=yaw;g.pitch=.3;g.view='player';g.renderNow();return {stats:g.getStats(),test:g.selfTest(),state:g.state()};},{scenario,p,yaw});
    assert.equal(result.test.pass,true);assert.ok(result.stats.drawCalls<=150&&result.stats.triangles<=150000);
    await page.screenshot({path:`${out}/${name}.png`});report[name]=result;
  }
  assert.deepEqual(report.errors,[]);report.sourceHashesAfter=await hashes();assert.deepEqual(report.sourceHashesAfter,report.sourceHashes,'Sources changed while checking camera');report.pass=true;
} catch(error){report.errors.push(error.stack??String(error));process.exitCode=1;}
finally{await browser.close();await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({pass:report.pass,grids:report.grids,errors:report.errors},null,2));
