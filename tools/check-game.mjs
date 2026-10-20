import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { serve } from './serve.mjs';
import { findBrowser } from './capture.mjs';

// Integration bot may inspect LC.state, but never mutates it or uses debug jumps.
// This is NOT the independent fresh-eyes player required by the production plan.
const report = { pass: false, errors: [], checks: [], shots: 0 };
const { server, url } = await serve('dist'); let browser, page;
const state = page => page.evaluate(() => LC.state());
const wait = (page, ms) => page.waitForTimeout(ms); // Actual simulated input/playback time, not background-job polling.
async function face(page, target) {
  const s = await state(page);
  const desired = Math.atan2(s.player.x - target.x, s.player.z - target.z);
  let diff = Math.atan2(Math.sin(desired - s.camera.yaw), Math.cos(desired - s.camera.yaw));
  for (let i = 0; i < 5 && Math.abs(diff) > .03; i++) {
    const dx = Math.max(-220, Math.min(220, -diff / .004));
    await page.mouse.move(640, 360); await page.mouse.down({ button: 'right' });
    await page.mouse.move(640 + dx, 360, { steps: 3 }); await page.mouse.up({ button: 'right' });
    await wait(page, 50);
    const next = await state(page); diff = Math.atan2(Math.sin(desired - next.camera.yaw), Math.cos(desired - next.camera.yaw));
  }
  await page.mouse.move(640, 360);
}
try {
  browser = await chromium.launch({ executablePath: await findBrowser(), headless: true });
  page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  await page.goto(url); await page.waitForFunction(() => window.LC?.ready);
  await page.getByRole('button', { name: 'Nuova partita', exact: true }).click();
  await page.getByRole('button', { name: 'Salta introduzione', exact: true }).click();
  assert.equal((await state(page)).beat, 'training');
  await face(page, { x: -2, z: 4 });
  for (let i = 0; i < 4 && !(await state(page)).droneHit; i++) { await page.mouse.click(640, 360); report.shots++; await wait(page, 950); }
  assert.equal((await state(page)).droneHit, true, 'Drone must be hittable with actual camera/mouse input');
  await page.keyboard.press('Space'); await wait(page, 450);
  assert.equal((await state(page)).dodgeUsed, true);
  assert.equal((await state(page)).beat, 'battle');
  report.checks.push('Title, skip, drone throw and dodge tutorial complete with actual controls');
  await page.keyboard.press('Escape');
  const paused = (await state(page)).time; await wait(page, 350);
  assert.ok(Math.abs((await state(page)).time - paused) < .001);
  await page.getByRole('button', { name: 'Riprendi', exact: true }).click();
  report.checks.push('Pause freezes the simulation clock and resumes explicitly');
  const before = (await state(page)).player;
  await page.keyboard.down('KeyW'); await wait(page, 500); await page.keyboard.up('KeyW');
  const after = (await state(page)).player;
  assert.ok(Math.hypot(before.x - after.x, before.z - after.z) > .5);
  const started = Date.now();
  const checkedGroups = new Set(); report.boundaries = [];
  // Three groups, finite live-control attempt. No LC.goto, seek or injected damage.
  for (let attempt = 0; attempt < 90; attempt++) {
    const s = await state(page);
    if (s.beat === 'anchor') break;
    assert.ok(s.player.hp > 0, 'Bot died; real-control flow needs investigation');
    if (!checkedGroups.has(s.group)) {
      checkedGroups.add(s.group);
      await page.locator('canvas').focus(); await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Ricomincia checkpoint', exact: true }).click();
      const retry = await state(page);
      assert.equal(retry.group, s.group); assert.equal(retry.player.hp, 6);
      await page.reload(); await page.waitForFunction(() => LC.ready);
      await page.getByRole('button', { name: 'Continua', exact: true }).click();
      const continued = await state(page);
      assert.equal(continued.group, s.group);
      assert.deepEqual(continued.enemies.filter(enemy => enemy.hp > 0).map(enemy => enemy.id), s.group === 1 ? [1] : s.group === 2 ? [2, 3] : [4, 5, 6]);
      report.boundaries.push({ group: s.group, checkpoint: continued.checkpoint, hp: continued.player.hp, enemyIds: continued.enemies.map(enemy => enemy.id) });
      continue;
    }
    const enemy = s.enemies.filter(e => e.hp > 0).sort((a, b) => Math.hypot(a.x - s.player.x, a.z - s.player.z) - Math.hypot(b.x - s.player.x, b.z - s.player.z))[0];
    if (enemy) {
      await face(page, enemy);
      // The final guard deliberately stays at the device: a real player must
      // approach instead of repeatedly throwing beyond the 12m range.
      if (Math.hypot(enemy.x - s.player.x, enemy.z - s.player.z) > 9) {
        await page.keyboard.down('KeyW'); await wait(page, 250); await page.keyboard.up('KeyW');
        continue;
      }
      await page.mouse.click(640, 360); report.shots++;
    }
    await wait(page, 720);
    const live = await state(page);
    if (!report.liveWrap && live.enemies.some(enemy => enemy.status === 'wrapped')) {
      await mkdir('docs/evidence/step-06', { recursive: true });
      await page.waitForFunction(() => { const s = LC.state(); return s.enemies.some(enemy => enemy.status === 'wrapped' && s.time - enemy.since >= .3 && s.time - enemy.since < .85); }, null, { timeout: 3000 });
      await page.screenshot({ path: 'docs/evidence/step-06/live-wrap.png' });
      report.liveWrap = await state(page);
      await wait(page, 700);
      await page.screenshot({ path: 'docs/evidence/step-06/live-shipping.png' });
    }
  }
  const cleared = await state(page);
  assert.equal(cleared.beat, 'anchor', 'All six defenders must be defeatable');
  report.combatWallSeconds = (Date.now() - started) / 1000;
  report.checks.push('All 1+2+3 defenders defeated using only physical mouse/keyboard events');
  assert.equal(checkedGroups.size, 3);
  report.checks.push('Actual A/B/C boundaries each survive checkpoint retry and reload/Continue without replaying earlier groups');
  for (let step = 0; step < 30; step++) {
    const s = await state(page), d = Math.hypot(s.player.x, s.player.z + 9);
    if (d < 1.9) break;
    await face(page, { x: 0, z: -9 });
    await page.keyboard.down('KeyW'); await wait(page, Math.min(300, Math.max(70, (d - 1.8) / 4.3 * 1000))); await page.keyboard.up('KeyW');
  }
  await page.keyboard.press('KeyE'); await wait(page, 200);
  assert.equal((await state(page)).beat, 'complete');
  assert.equal((await state(page)).checkpoint.boundary, 'complete');
  assert.equal((await page.evaluate(() => LC.selfTest())).pass, true);
  await mkdir('docs/evidence/step-06', { recursive: true });
  await page.screenshot({ path: 'docs/evidence/step-06/bot-complete.png' });
  report.finalState = await state(page);
  await page.reload(); await page.waitForFunction(() => LC.ready);
  await page.getByRole('button', { name: 'Continua', exact: true }).click();
  assert.equal((await state(page)).beat, 'complete');
  assert.equal((await state(page)).remaining, 0);
  report.checks.push('Anchor 1/3 is saved and Continue restores completion after a real reload');
  const denied = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await denied.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage denied', 'QuotaExceededError'); }; });
  await denied.goto(url); await denied.waitForFunction(() => LC.ready);
  await denied.getByRole('button', { name: 'Nuova partita', exact: true }).click();
  assert.equal((await state(denied)).storageAvailable, false);
  report.checks.push('Storage write failure is nonfatal and reported honestly');
  assert.equal(report.errors.length, 0); report.pass = true;
} catch (error) {
  report.errors.push(error.stack ?? String(error)); process.exitCode = 1;
  if (page) {
    await mkdir('docs/evidence/step-06', { recursive: true });
    await page.screenshot({ path: 'docs/evidence/step-06/integration-failure.png' }).catch(() => {});
    report.failureState = await state(page).catch(() => null);
  }
}
finally {
  await browser?.close(); await new Promise(done => server.close(done));
  await mkdir('docs/evidence/step-06', { recursive: true });
  await writeFile('docs/evidence/step-06/integration.json', JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ pass: report.pass, checks: report.checks, shots: report.shots, combatWallSeconds: report.combatWallSeconds, errors: report.errors }, null, 2));
