import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { serve } from './serve.mjs';
import { findBrowser } from './capture.mjs';

// Controlled UI checks, not another full playthrough. External navigation is
// intercepted locally; no request is sent to the author's website.
const out='captures/readme-credits';await mkdir(out,{recursive:true});await mkdir('docs/images',{recursive:true});
const report={pass:false,tests:[],errors:[],externalNavigationIntercepted:true};
const expected='\u00a9 2026 Rosario Moscato - handcrafted by a human, upgraded by agents.';
const {server,url}=await serve('dist');
const browser=await chromium.launch({executablePath:await findBrowser(),headless:true});
const context=await browser.newContext({viewport:{width:1280,height:720}});
await context.route('https://rosmoscato.xyz/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Intercepted credits link test</title>'}));
const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
const check=async(name,fn)=>{await fn();report.tests.push({name,pass:true});};
async function creditCheck(){
  const footer=page.locator('.credits');assert.equal(await footer.count(),1);assert.equal(await footer.innerText(),expected);assert.ok(await footer.isVisible());
  const link=footer.getByRole('link',{name:'Rosario Moscato',exact:true});assert.equal(await link.getAttribute('href'),'https://rosmoscato.xyz');assert.equal(await link.getAttribute('target'),'_blank');assert.match(await link.getAttribute('rel'),/noopener/);assert.match(await link.getAttribute('rel'),/noreferrer/);
  const box=await footer.boundingBox(),size=page.viewportSize();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,'Credits outside viewport');
  return link;
}
try{
  await check('MIT license, README link and package metadata agree',async()=>{
    const license=await readFile('LICENSE','utf8'),readme=await readFile('README.md','utf8');
    assert.match(license,/^MIT License\n\nCopyright \(c\) 2026 Rosario Moscato\n/);assert.match(license,/Permission is hereby granted, free of charge/);assert.match(license,/THE SOFTWARE IS PROVIDED "AS IS"/);assert.match(readme,/\[LICENSE\]\(LICENSE\)/);
    assert.equal(JSON.parse(await readFile('package.json','utf8')).license,'MIT');assert.equal(JSON.parse(await readFile('package-lock.json','utf8')).packages[''].license,'MIT');
  });
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});report.html=await response.text();await page.waitForFunction(()=>window.LC?.ready);
  await check('exact attribution and safe author link fit the title at 720p and 1080p',async()=>{
    for(const [width,height] of [[1280,720],[1920,1080]]){await page.setViewportSize({width,height});await creditCheck();await page.screenshot({path:`${out}/title-${height}.png`});}
  });
  await check('Enter on the focused author link opens a new tab without advancing the game',async()=>{
    const link=await creditCheck();await link.focus();const before=await page.evaluate(()=>LC.state().beat);const opened=context.waitForEvent('page');await page.keyboard.press('Enter');const popup=await opened;await popup.waitForLoadState('domcontentloaded');assert.match(popup.url(),/^https:\/\/rosmoscato\.xyz\/?$/);assert.equal(await popup.evaluate(()=>window.opener),null);assert.equal(await page.evaluate(()=>LC.state().beat),before);await popup.close();await page.bringToFront();
  });
  await check('credits are absent from active gameplay and present in pause',async()=>{
    await page.getByRole('button',{name:'Nuova partita',exact:true}).click();await page.keyboard.press('Enter');await page.waitForFunction(()=>LC.state().beat==='training');assert.equal(await page.locator('.credits').count(),0);await page.keyboard.press('Escape');await creditCheck();await page.screenshot({path:`${out}/pause-1080.png`});
  });
  await check('completed ending shows one clickable footer, without duplicating it on redraw',async()=>{
    for(const [width,height] of [[1280,720],[1920,1080]]){await page.setViewportSize({width,height});await page.evaluate(()=>{LC.goto('square-ending');LC.seek(1.5);});assert.equal(await page.locator('.credits').count(),0);await page.evaluate(()=>{LC.seek(8);LC.renderNow();LC.renderNow();});await creditCheck();assert.equal(await page.getByRole('button',{name:'Nuova avventura',exact:true}).isVisible(),true);assert.equal(await page.evaluate(()=>LC.selfTest().pass),true);await page.screenshot({path:`${out}/ending-${height}.png`});}
    const link=await creditCheck(),opened=context.waitForEvent('page');await link.click();const popup=await opened;await popup.waitForLoadState('domcontentloaded');assert.match(popup.url(),/^https:\/\/rosmoscato\.xyz\/?$/);await popup.close();await page.bringToFront();
  });
  await check('README screenshot is an actual, numerically valid gameplay frame',async()=>{
    await page.setViewportSize({width:1920,height:1080});await page.evaluate(()=>{LC.goto('street-both-active');LC.setView('player');LC.seek(0);});assert.equal(await page.locator('.credits').count(),0);report.gameplay=await page.evaluate(()=>({state:LC.state(),stats:LC.getStats(),selfTest:LC.selfTest()}));assert.equal(report.gameplay.selfTest.pass,true);assert.equal(report.gameplay.state.chapter,'toystreet');await page.screenshot({path:'docs/images/gameplay.png'});
    const readme=await readFile('README.md','utf8');assert.match(readme,/\]\(docs\/images\/gameplay\.png\)/);assert.match(readme,/\[Rosario Moscato\]\(https:\/\/rosmoscato\.xyz\)/);
  });
  assert.deepEqual(report.errors,[]);report.pass=true;
}catch(error){report.errors.push(error.stack??String(error));process.exitCode=1;}
finally{await browser.close();await new Promise(done=>server.close(done));await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify({pass:report.pass,tests:report.tests,errors:report.errors},null,2));
