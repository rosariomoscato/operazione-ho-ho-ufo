import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { findBrowser } from './capture.mjs';
const out='captures/polish-controls';await mkdir(out,{recursive:true});
const sources=['src/game.ts','src/input.ts','src/storage.ts','src/style.css','src/ui/controls.ts'];
const hashes=async()=>Object.fromEntries(await Promise.all(sources.map(async path=>[path,createHash('sha256').update(await readFile(path)).digest('hex')])));
const report={pass:false,sourceHashes:await hashes(),tests:[],errors:[]};
const browser=await chromium.launch({executablePath:await findBrowser(),headless:true});
const page=await browser.newPage({viewport:{width:1920,height:1080}});
page.on('pageerror',e=>report.errors.push(e.message));
const check=async(name,fn)=>{await fn();report.tests.push({name,pass:true});};
const state=()=>page.evaluate(()=>LC.state());
const open=async()=>{await page.locator('details').evaluate(e=>e.open=true);};
const range=async(key,value)=>page.locator(`[data-setting="${key}"]`).evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
try {
  await page.route(/\/src\/main\.ts(?:\?.*)?$/,route=>route.fulfill({contentType:'application/javascript',body:"import '/src/style.css';import {Game} from '/src/game.ts';window.__testGame=new Game(document.querySelector('#app'));"}));
  await page.goto(process.env.COMBAT_URL??'http://127.0.0.1:5174/');await page.waitForFunction(()=>window.LC?.ready);await open();
  await check('all sliders and checkboxes persist through a real reload',async()=>{
    for(const [key,value] of Object.entries({master:.4,music:.2,effects:.55,sensitivity:1.5,fov:70}))await range(key,value);
    assert.equal(await page.locator('[data-value="sensitivity"]').innerText(),'1.5×');assert.equal(await page.locator('[data-value="fov"]').innerText(),'70°');
    await page.locator('[data-setting="invertY"]').check();await page.locator('[data-setting="reducedMotion"]').check();await page.locator('[data-setting="aimAssist"]').uncheck();
    await page.reload();await page.waitForFunction(()=>window.LC?.ready);const s=(await state()).settings;
    for(const [key,value] of Object.entries({master:.4,music:.2,effects:.55,sensitivity:1.5,fov:70,invertY:true,reducedMotion:true,aimAssist:false}))assert.equal(s[key],value,key);await open();
  });
  await check('conflicting and reserved remaps explain rejection; Escape cancels without closing settings',async()=>{
    await page.locator('[data-bind="forward"]').click();await page.keyboard.press('s');assert.match(await page.locator('[role="status"]').innerText(),/già|conflitto|usato/i);assert.equal((await state()).settings.keyBindings.forward,'KeyW');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.bind),'forward');await page.keyboard.press('Tab');assert.equal((await state()).settings.keyBindings.forward,'KeyW');await page.keyboard.press('Escape');assert.equal((await state()).settings.keyBindings.forward,'KeyW');assert.equal(await page.locator('[data-bind="forward"]').isVisible(),true);assert.equal(await page.evaluate(()=>document.activeElement.dataset.bind),'forward');
  });
  await check('all seven actions can be remapped through their UI controls',async()=>{
    const codes={forward:['z','KeyZ'],backward:['ArrowDown','ArrowDown'],left:['q','KeyQ'],right:['ArrowRight','ArrowRight'],dodge:['ShiftLeft','ShiftLeft'],interact:['f','KeyF'],help:['j','KeyJ']};
    for(const [action,[key,code]] of Object.entries(codes)){await open();await page.locator(`[data-bind="${action}"]`).click();await page.keyboard.press(key);assert.equal((await state()).settings.keyBindings[action],code);assert.equal(await page.evaluate(()=>document.activeElement.dataset.bind),action);}
    await page.reload();await page.waitForFunction(()=>window.LC?.ready);for(const [action,[,code]] of Object.entries(codes))assert.equal((await state()).settings.keyBindings[action],code);await open();
  });
  await check('remapped forward key is used by actual input and keyup releases it',async()=>{
    await page.locator('[data-bind="forward"]').click();await page.keyboard.press('z');assert.equal((await state()).settings.keyBindings.forward,'KeyZ');
    await page.locator('[data-do="new"]').click();await page.keyboard.press('Enter');await page.waitForFunction(()=>LC.state().beat==='training');await page.locator('canvas').focus();
    const z=(await state()).player.z;await page.keyboard.down('z');await page.waitForFunction(z=>LC.state().player.z<z-.5,z);await page.keyboard.up('z');assert.ok((await state()).player.z<z-.5);
    assert.equal(await page.evaluate(()=>__testGame.input.keys.size),0);await page.keyboard.down('w');assert.equal(await page.evaluate(()=>__testGame.input.keys.has('KeyW')),false);await page.keyboard.up('w');
  });
  await check('sensitivity, inverted pitch and FOV affect the real game camera',async()=>{
    const r=await page.evaluate(()=>{const g=__testGame;g.yaw=0;g.pitch=.3;g.input.dx=10;g.input.dy=10;g.update(.01);return{yaw:g.yaw,pitch:g.pitch,fov:g.camera3.fov};});assert.ok(Math.abs(r.yaw+.06)<1e-8);assert.ok(Math.abs(r.pitch-.27)<1e-8);assert.equal(r.fov,70);
  });
  await check('real DOM key events map every action and HUD uses the configured controls',async()=>{
    const evidence=await page.evaluate(()=>{const g=__testGame,canonical={forward:'KeyW',backward:'KeyS',left:'KeyA',right:'KeyD',dodge:'Space',interact:'KeyE',help:'KeyH'};document.querySelector('canvas').focus();const results=[];for(const [action,code] of Object.entries(g.settings.keyBindings)){window.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true,cancelable:true}));results.push(g.input.keys.has(canonical[action]));window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));}g.renderNow();return{results,held:g.input.keys.size,text:g.overlay.innerText};});
    assert.ok(evidence.results.every(Boolean));assert.equal(evidence.held,0);assert.match(evidence.text,/Shift/);assert.match(evidence.text,/F/);assert.match(evidence.text,/J/);
  });
  await check('Escape opens pause; reset restores settings without deleting checkpoint',async()=>{
    await page.keyboard.press('Escape');assert.equal(await page.locator('[data-do="resume"]').isVisible(),true);await open();
    const saved=await page.evaluate(()=>localStorage.getItem('ho-ho-ufo.checkpoint.v3'));await page.locator('[data-reset-controls]').click();const s=(await state()).settings;assert.equal(s.fov,53);assert.equal(s.sensitivity,1);assert.equal(s.invertY,false);assert.equal(s.aimAssist,true);assert.equal(s.reducedMotion,false);assert.equal(s.keyBindings.forward,'KeyW');assert.equal(await page.evaluate(()=>localStorage.getItem('ho-ho-ufo.checkpoint.v3')),saved);
    await open();await page.screenshot({path:`${out}/settings-1080.png`});
  });
  assert.deepEqual(report.errors,[]);report.sourceHashesAfter=await hashes();assert.deepEqual(report.sourceHashesAfter,report.sourceHashes,'Sources changed while checking controls');report.pass=true;
}catch(error){report.errors.push(error.stack??String(error));process.exitCode=1;}
finally{await browser.close();await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
