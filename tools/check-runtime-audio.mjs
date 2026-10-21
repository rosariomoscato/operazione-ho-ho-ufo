import { chromium } from 'playwright-core';
import { stripTypeScriptTypes } from 'node:module';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { serve } from './serve.mjs';
import { findBrowser } from './capture.mjs';

// Tests the real runtime mixer with real HTMLAudio, independently of gameplay.
const source = await readFile('src/audio.ts', 'utf8');
const compiled = stripTypeScriptTypes(source, { mode: 'strip' });
const { server, url } = await serve('public'); let browser;
const report = { pass: false, errors: [], checks: [] };
const evidence = process.env.GAME_EVIDENCE ?? 'docs/evidence/step-06';
try {
  browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });
  const page = await browser.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(`${url}/audio/index.json`);
  await page.setContent('<button id="unlock">Avvia audio</button>');
  await page.evaluate(async encoded => {
    const NativeAudio = window.Audio;
    window.__audioElements = [];
    window.Audio = function(...args) { const audio = new NativeAudio(...args); window.__audioElements.push(audio); return audio; };
    const { createGameAudio } = await import(`data:text/javascript;base64,${encoded}`);
    window.__mixer = createGameAudio();
    window.__mixer.music('music.village');
    await window.__mixer.init();
    document.querySelector('#unlock').onclick = () => window.__mixer.unlock();
  }, Buffer.from(compiled).toString('base64'));
  assert.equal(await page.evaluate(() => window.__mixer.stats().loaded), true);
  await page.locator('#unlock').click();
  await page.waitForFunction(() => window.__audioElements.filter(audio => !audio.paused).length === 2);
  report.checks.push('Real mixer initializes and starts one music loop plus ambience after user gesture');
  await page.evaluate(() => { __mixer.setVolumes({ master: 1, music: 1, effects: 1 }); for (let i = 0; i < 8; i++) __mixer.effect('sfx.wrap'); });
  const active = await page.evaluate(() => ({ stats: __mixer.stats(), count: __audioElements.filter(audio => !audio.paused).length }));
  assert.ok(active.stats.activeEffects <= 8);
  report.checks.push('Effect pool remains bounded with eight simultaneous requests');
  await page.evaluate(() => __mixer.pause());
  assert.equal(await page.evaluate(() => __audioElements.every(audio => audio.paused)), true);
  await page.evaluate(() => __mixer.music('music.combat'));
  assert.equal(await page.evaluate(() => __audioElements.every(audio => audio.paused)), true);
  await page.locator('#unlock').evaluate(button => { button.onclick = () => __mixer.resume(); });
  await page.locator('#unlock').click();
  await page.waitForFunction(() => window.__audioElements.some(audio => !audio.paused && audio.loop));
  assert.equal(await page.evaluate(() => __audioElements.filter(audio => !audio.paused && audio.loop && audio.src.includes('/audio/')).length), 2);
  report.checks.push('Pause freezes every track; music changes remain silent until explicit resume');
  await page.evaluate(() => __mixer.stop());
  assert.equal(await page.evaluate(() => __audioElements.every(audio => audio.paused && audio.currentTime === 0)), true);
  assert.equal(await page.evaluate(() => __mixer.stats().error), null);
  report.checks.push('Stop clears loops/effects and real playback reports no errors');
  assert.equal(report.errors.length, 0); report.pass = true;
} catch (error) { report.errors.push(error.stack ?? String(error)); process.exitCode = 1; }
finally {
  await browser?.close(); await new Promise(done => server.close(done));
  await mkdir(evidence, { recursive: true });
  await writeFile(`${evidence}/runtime-audio.json`, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
