import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { serve } from './serve.mjs';
import { findBrowser } from './capture.mjs';

const report = { pass: false, errors: [], checks: [] };
const { server, url } = await serve('dist'); let browser;
try {
  browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(url); await page.waitForFunction(() => window.LC?.ready);
  const before = await page.evaluate(() => localStorage.getItem('ho-ho-ufo.checkpoint.v1'));
  await page.evaluate(() => { LC.goto('battle-a'); LC.play(); });
  await page.waitForFunction(() => LC.state().enemies.some(enemy => enemy.status === 'windup'), null, { timeout: 45000 });
  await mkdir('docs/evidence/step-06', { recursive: true });
  await page.screenshot({ path: 'docs/evidence/step-06/melee-telegraph.png' });
  await page.waitForFunction(() => LC.state().eventLog.filter(event => event.type === 'player-hurt').length >= 2, null, { timeout: 45000 });
  await page.evaluate(() => LC.pause());
  const s = await page.evaluate(() => LC.state());
  const attacks = s.eventLog.filter(event => event.type === 'attack-active');
  const recovery = s.eventLog.filter(event => event.type === 'recovery-end');
  const hurts = s.eventLog.filter(event => event.type === 'player-hurt');
  assert.ok(attacks.length >= 2);
  assert.ok(attacks.every(event => event.windup >= .999));
  assert.ok(recovery.length > 0 && recovery.every(event => event.elapsed >= 1.199));
  assert.equal(new Set(hurts.map(event => event.attackId)).size, hurts.length);
  assert.equal(s.player.hp, 4);
  const lockWindows = attacks.map(attack => {
    const lock = s.eventLog.find(event => event.type === 'attack-lock' && event.attackId === attack.attackId);
    assert.ok(lock);
    const remaining = attack.time - lock.time;
    assert.ok(remaining >= .78, 'At least 0.8s after lock, allowing one 1/60 simulation substep');
    return { attackId: attack.attackId, secondsAfterLock: remaining };
  });
  assert.equal(await page.evaluate(() => localStorage.getItem('ho-ho-ufo.checkpoint.v1')), before);
  assert.equal(await page.evaluate(() => LC.selfTest().pass), true);
  report.checks.push('Live AI: full 1-second windup, ~0.8s locked warning, ≥1.2s recovery, unique damage per attack');
  report.checks.push('Review scenario and live simulation do not write the actual checkpoint');
  report.lockWindows = lockWindows; report.state = s;
  await page.evaluate(() => { LC.goto('battle-c'); LC.play(); });
  await page.waitForFunction(() => LC.state().healed === true, null, { timeout: 10000 });
  await page.evaluate(() => LC.pause());
  report.healState = await page.evaluate(() => LC.state());
  assert.equal(report.healState.player.hp, 4);
  assert.equal(report.healState.eventLog.filter(event => event.type === 'heal').length, 1);
  await page.locator('canvas').focus(); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Ricomincia checkpoint', exact: true }).click();
  await page.evaluate(() => LC.pause());
  report.retryState = await page.evaluate(() => LC.state());
  assert.equal(report.retryState.group, 3);
  assert.equal(report.retryState.player.hp, 6);
  assert.equal(report.retryState.healed, true);
  assert.equal(report.retryState.healAvailable, false);
  report.checks.push('Real heal event grants +2 once; checkpoint retry preserves consumption and restores 6HP');
  assert.equal(report.errors.length, 0); report.pass = true;
} catch (error) { report.errors.push(error.stack ?? String(error)); process.exitCode = 1; }
finally {
  await browser?.close(); await new Promise(done => server.close(done));
  await mkdir('docs/evidence/step-06', { recursive: true });
  await writeFile('docs/evidence/step-06/melee.json', JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ pass: report.pass, checks: report.checks, lockWindows: report.lockWindows, errors: report.errors }, null, 2));
