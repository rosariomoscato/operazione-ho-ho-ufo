import { chromium } from 'playwright-core';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { findBrowser } from './capture.mjs';
import { serve } from './serve.mjs';

const report = { pass: false, errors: [], checks: [], assets: [] };
const { server, url } = await serve(); let browser;
try {
  browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  await page.goto(`${url}/tools/audio/audition.html`);
  await page.waitForFunction(() => document.querySelectorAll('audio').length === 11 && !document.querySelector('#preview').disabled);
  await page.waitForFunction(() => [...document.querySelectorAll('audio')].every(audio => audio.readyState >= 1));
  report.assets = await page.evaluate(async () => {
    const results = [];
    for (const audio of document.querySelectorAll('audio')) {
      audio.volume = 0;
      await audio.play();
      results.push({ id: audio.closest('article').dataset.id, duration: audio.duration, canPlay: !audio.paused && !audio.error });
      audio.pause(); audio.currentTime = 0;
    }
    return results;
  });
  assert.ok(report.assets.every(asset => asset.canPlay && asset.duration > 0));
  report.checks.push('All 11 static WAV files load and start playback in Edge');
  const index = JSON.parse(await readFile('public/audio/index.json', 'utf8'));
  for (const asset of report.assets) assert.ok(Math.abs(index.assets.find(item => item.id === asset.id).duration - asset.duration) < .01);
  await page.getByRole('button', { name: 'Ascolta la scena', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#caption').textContent.includes('Briciola:'));
  await page.waitForFunction(() => document.querySelector('#caption').textContent.startsWith('Fine della prova'), null, { timeout: 20000 });
  assert.equal(await page.locator('audio').evaluateAll(audios => audios.every(audio => audio.paused)), true);
  report.checks.push('12-second static-file preview finishes and stops every audio track');
  await page.getByRole('button', { name: 'Ascolta la scena', exact: true }).click();
  await page.getByRole('button', { name: 'Ferma tutto', exact: true }).click();
  assert.equal(await page.locator('audio').evaluateAll(audios => audios.every(audio => audio.paused && audio.currentTime === 0)), true);
  report.checks.push('Restart and stop controls reset all tracks');
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
  await mkdir('docs/evidence/step-04', { recursive: true });
  await page.screenshot({ path: 'docs/evidence/step-04/audition.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  report.checks.push('Listening page has no horizontal overflow at 390px');
  assert.equal(await page.locator('#error').textContent(), '');
  assert.equal(report.errors.length, 0); report.pass = true;
} catch (error) { report.errors.push(error.stack ?? String(error)); process.exitCode = 1; }
finally {
  await browser?.close(); await new Promise(done => server.close(done));
  await mkdir('docs/evidence/step-04', { recursive: true });
  await writeFile('docs/evidence/step-04/checks.json', JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
