import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { serve } from './serve.mjs';
import { findBrowser } from './capture.mjs';

const out='captures/mission';await mkdir(out,{recursive:true});
const code=stripTypeScriptTypes(await readFile('src/ui/mission.ts','utf8'),{mode:'strip'});
const {missionParagraphs}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const report={pass:false,tests:[],errors:[]};
const {server,url}=await serve('dist');const browser=await chromium.launch({executablePath:await findBrowser(),headless:true});const page=await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',e=>report.errors.push(e.message));
const check=async(name,fn)=>{await fn();report.tests.push({name,pass:true});};
try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});report.html=await response.text();await page.waitForFunction(()=>window.LC?.ready);
  await check('title keeps New game focused and the mission initially collapsed',async()=>{
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-do')),'new');assert.equal(await page.locator('[data-mission-toggle]').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#mission-description').isVisible(),false);assert.equal(await page.locator('details').count(),1);await page.screenshot({path:`${out}/title-720.png`});
  });
  await check('mission text is exact and fits a scrollable menu at 720p and 1080p',async()=>{
    for(const [width,height] of [[1280,720],[1920,1080]]){
      await page.setViewportSize({width,height});const toggle=page.locator('[data-mission-toggle]');if(await toggle.getAttribute('aria-expanded')==='false')await toggle.click();assert.deepEqual(await page.locator('#mission-description p').allTextContents(),missionParagraphs);
      const layout=await page.locator('.menu').evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight,overflow:getComputedStyle(el).overflowY,viewport:innerHeight}));assert.ok(layout.client<=layout.viewport);assert.equal(layout.overflow,'auto');
      await page.locator('#mission-description p').first().scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/mission-${height}.png`});await page.locator('#mission-description p').last().scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/mission-bottom-${height}.png`});report[`layout${height}`]=layout;
    }
  });
  await check('reading does not start or advance the game; keyboard toggling works',async()=>{
    const before=await page.evaluate(()=>({playing:LC.state().playing,time:LC.state().time,checkpoint:localStorage.getItem('ho-ho-ufo.checkpoint.v3')}));await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>({playing:LC.state().playing,time:LC.state().time,checkpoint:localStorage.getItem('ho-ho-ufo.checkpoint.v3')})),before);assert.equal(before.playing,false);
    const toggle=page.locator('[data-mission-toggle]');await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'false');await page.keyboard.press('Space');assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  });
  await check('mission closes without hiding credits or settings and New game still works',async()=>{
    await page.locator('[data-mission-toggle]').click();await page.locator('.credits').scrollIntoViewIfNeeded();assert.equal(await page.locator('.credits a').getAttribute('href'),'https://rosmoscato.xyz');await page.locator('summary').click();assert.equal(await page.locator('[data-setting="master"]').isVisible(),true);await page.locator('summary').click();
    await page.getByRole('button',{name:'Nuova partita',exact:true}).click();await page.keyboard.press('Enter');await page.waitForFunction(()=>LC.state().beat==='training');assert.equal(await page.locator('[data-mission-toggle]').count(),0);assert.equal(await page.evaluate(()=>LC.selfTest().pass),true);await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Riprendi',exact:true}).isVisible(),true);assert.equal(await page.locator('[data-mission-toggle]').count(),0);
  });
  assert.deepEqual(report.errors,[]);report.pass=true;
}catch(error){report.errors.push(error.stack??String(error));process.exitCode=1;}
finally{await browser.close();await new Promise(done=>server.close(done));await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
