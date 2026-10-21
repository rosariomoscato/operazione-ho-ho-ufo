import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { serve } from './serve.mjs';
import { findBrowser } from './capture.mjs';
import { state, hold, gift, math } from './input-driver.mjs';
import { firstTwoActs, recover, safeWalk, aimOrRetry, giftOrRetry } from './playthrough-acts.mjs';

// Informed integration bot: state may be read, never mutated. No checkpoint
// seeds, debug jumps, injected damage, clock seeks or artificial game pauses.
const out = 'captures/full-playthrough'; await mkdir(out, { recursive: true });
const report = { pass: false, kind: 'real-input-new-game-to-ending', shots: 0, deaths: [], boundaries: [], errors: [], started: Date.now() };
const { server, url } = await serve(process.env.GAME_ROOT ?? 'dist');
const browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage(); page.on('pageerror', error => report.errors.push(error.message));
const squareObstacles = [
  { id: 'square-tree', minX: 7.2, maxX: 8.8, minZ: -6.8, maxZ: -5.2 },
  { id: 'square-sled', minX: -11, maxX: -7, minZ: -8.5, maxZ: -5.5 },
];
try {
  const response = await page.goto(url); report.html = await response.text();
  await page.waitForFunction(() => window.LC?.ready);
  await firstTwoActs(page, report);
  await safeWalk(page, report, { x: 0, z: 2 }, { obstacles: squareObstacles, stop: 3 });
  let side = 'KeyA'; report.bossObservations = [];
  for (let attempt = 0; attempt < 240; attempt++) {
    const s = await recover(page, report); assert.equal(s.chapter, 'square');
    if (s.beat === 'core') break;
    assert.equal(s.beat, 'boss', 'Approach must start Squamakk');
    const boss = s.boss;
    assert.ok(boss && typeof boss.phase === 'string', 'M3 state must expose the real boss phase');
    report.bossObservations.push({ time: s.time, hp: s.player.hp, boss });
    if (boss.phase === 'vulnerable') {
      if (!await aimOrRetry(page, report, { x: 0, z: -8 })) continue;
      if (math.distance(s.player, { x: 0, z: -8 }) > 10) { await hold(page, 'KeyW', 250); continue; }
      if (!await giftOrRetry(page, report)) continue; await page.waitForTimeout(750);
    } else {
      if (!await aimOrRetry(page, report, { x: 0, z: -8 })) continue;
      const live = await state(page);
      if (live.player.x < -5) side = 'KeyD'; else if (live.player.x > 5) side = 'KeyA';
      try { await hold(page, side, 300); }
      catch(error) { if((await state(page)).player.hp>0)throw error;await recover(page,report);continue; }
      if (['active', 'beam'].includes(boss.phase)) await page.keyboard.press('Space');
    }
  }
  assert.equal((await state(page)).beat, 'core', 'Three boss segments must be defeatable');
  report.boundaries.push({ name: 'Squamakk defeated', state: await state(page) });
  await safeWalk(page, report, { x: 0, z: -6.2 }, { obstacles: squareObstacles, stop: 1.6 });
  await page.keyboard.press('KeyE'); await page.waitForTimeout(100);
  assert.equal((await state(page)).beat, 'return-core');
  report.boundaries.push({ name: 'Core carried', state: await state(page) });
  await safeWalk(page, report, { x: 8, z: -4.4 }, { obstacles: squareObstacles, stop: 1.5 });
  await page.keyboard.press('KeyE'); await page.waitForTimeout(100);
  assert.equal((await state(page)).beat, 'ending');
  await page.waitForFunction(() => LC.state().boss?.completed === true, null, { timeout: 120000 });
  const text = await page.locator('body').innerText(); assert.match(text, /Mondo salvato/i);
  const checks = await page.evaluate(() => LC.selfTest()); assert.equal(checks.pass, true);
  report.final = await state(page); assert.equal(report.final.coreReturned, true); assert.equal(report.final.boss.portalClosed, true);
  report.finalStats = await page.evaluate(() => LC.getStats()); report.selfTest = checks;
  await page.screenshot({ path: `${out}/ending.png` });
  assert.deepEqual(report.errors, []); report.pass = true;
} catch (error) {
  report.errors.push(error.stack ?? String(error)); report.failure = await state(page).catch(() => null);
  await page.screenshot({ path: `${out}/failure.png` }).catch(() => {}); process.exitCode = 1;
} finally {
  report.wallSeconds = (Date.now() - report.started) / 1000;
  await browser.close(); await new Promise(done => server.close(done));
  await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ pass: report.pass, shots: report.shots, deaths: report.deaths.length, boundaries: report.boundaries.map(b => b.name), wallSeconds: report.wallSeconds, errors: report.errors }, null, 2));
