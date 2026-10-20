import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { findBrowser } from './capture.mjs';
import { serve } from './serve.mjs';

const { server, url } = await serve();
let browser;
const report = { pass: false, errors: [], checks: [] };
try {
  browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  await page.goto(`${url}/design/styles/index.html`);
  for (const view of ['player', 'face', 'turntable', 'diorama']) {
    await page.locator(`[data-view="${view}"]`).click();
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
    assert.equal(await page.locator('button[aria-pressed="true"]').count(), 1);
    assert.equal(await page.locator('img').evaluateAll(images => images.filter(img => img.complete && img.naturalWidth > 0).length), 3);
  }
  report.checks.push('All comparison view buttons and local image assets pass');
  await page.locator('[data-view="player"]').click();
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
  await mkdir('docs/evidence/step-03', { recursive: true });
  await page.screenshot({ path: 'docs/evidence/step-03/comparison.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  report.checks.push('Comparison has no horizontal overflow at 390px');
  for (const style of ['vinyl', 'wood', 'action']) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${url}/design/styles/${style}.html`);
    await page.waitForFunction(() => window.LC?.ready);
    await page.locator('[data-view="face"]').click();
    await page.locator('#timeline').fill('3');
    assert.equal(await page.evaluate(() => window.LC.selfTest().pass), true);
    assert.equal(await page.locator('#time').textContent(), '3.0 s');
    await page.locator('#play').click();
    assert.equal(await page.locator('#play').textContent(), 'Pausa');
    await page.locator('#play').click();
    assert.equal(await page.locator('#play').textContent(), 'Riproduci');
    report.checks.push(`${style}: view, scrubber, play/pause and contacts pass`);
  }
  assert.equal(report.errors.length, 0);
  report.pass = true;
} catch (error) { report.errors.push(error.stack ?? String(error)); process.exitCode = 1; }
finally {
  await browser?.close();
  await new Promise(done => server.close(done));
  await mkdir('docs/evidence/step-03', { recursive: true });
  await writeFile('docs/evidence/step-03/ui-checks.json', JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
