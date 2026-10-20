import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { serve } from './serve.mjs';
import { findBrowser } from './capture.mjs';

const { server, url } = await serve('dist'); let browser;
const report = { pass: false, runs: [], errors: [] };
try {
  browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });
  await mkdir('docs/evidence/step-06/wrap', { recursive: true });
  for (const reduced of [false, true]) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    page.on('pageerror', error => report.errors.push(error.message));
    await page.addInitScript(reduced => { localStorage.setItem('ho-ho-ufo.settings.v1', JSON.stringify({ reducedMotion: reduced })); }, reduced);
    await page.goto(url); await page.waitForFunction(() => LC.ready);
    await page.evaluate(() => { LC.goto('first-wrap'); LC.setView('player'); });
    for (const time of [.25, .9]) {
      await page.evaluate(t => { LC.seek(t); LC.renderNow(); }, time);
      const result = await page.evaluate(() => ({ state: LC.state(), selfTest: LC.selfTest(), label: document.querySelector('.enemy-label:not([hidden])')?.textContent }));
      assert.equal(result.selfTest.pass, true);
      assert.equal(result.label, time < .9 ? 'Pacco rettiliano' : '↑ Spedito alla nave');
      const enemy = result.state.enemies[0];
      assert.equal(enemy.x, 0); assert.equal(enemy.z, -1);
      const file = `wrap-${reduced ? 'reduced' : 'normal'}-${time}.png`;
      await page.screenshot({ path: `docs/evidence/step-06/wrap/${file}` });
      report.runs.push({ reducedMotion: reduced, time, file, label: result.label, enemyPosition: [enemy.x, enemy.z], pass: true });
    }
    await page.close();
  }
  assert.equal(report.errors.length, 0); report.pass = true;
} catch (error) { report.errors.push(error.stack ?? String(error)); process.exitCode = 1; }
finally {
  await browser?.close(); await new Promise(done => server.close(done));
  await mkdir('docs/evidence/step-06/wrap', { recursive: true });
  await writeFile('docs/evidence/step-06/wrap/report.json', JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
