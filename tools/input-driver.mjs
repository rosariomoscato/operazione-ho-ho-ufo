import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

const math = await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(await readFile(new URL('../src/engine/math.ts', import.meta.url), 'utf8'))).toString('base64')}`);
export const state = page => page.evaluate(() => LC.state());
export { math };

export async function live(page) {
  const s = await state(page);
  assert.ok(s.player.hp > 0, 'Player died during the input test; do not click a menu accidentally');
  assert.equal(s.playing, true, 'Simulation paused unexpectedly during the input test');
  return s;
}

export async function face(page, target) {
  const viewport = page.viewportSize(), x = viewport.width / 2, y = viewport.height / 2;
  for (let attempt = 0; attempt < 6; attempt++) {
    const s = await live(page), desired = Math.atan2(s.player.x - target.x, s.player.z - target.z);
    const delta = Math.atan2(Math.sin(desired - s.camera.yaw), Math.cos(desired - s.camera.yaw));
    if (Math.abs(delta) < .035) break;
    const dx = Math.max(-x + 20, Math.min(x - 20, -delta / .004));
    await page.mouse.move(x, y); await page.mouse.down({ button: 'right' });
    await page.mouse.move(x + dx, y, { steps: 3 }); await page.mouse.up({ button: 'right' });
    await page.waitForTimeout(65);
  }
  await live(page);
}

export async function hold(page, key, milliseconds) {
  await live(page); await page.keyboard.down(key);
  try { await page.waitForTimeout(milliseconds); }
  finally { await page.keyboard.up(key); }
}

export async function walk(page, goal, { obstacles = [], stop = 1.5, maxSteps = 100 } = {}) {
  for (let step = 0; step < maxSteps; step++) {
    const s = await live(page);
    if (math.distance(s.player, goal) <= stop) return;
    const waypoint = math.nextWaypoint(s.player, goal, obstacles, .55);
    await face(page, waypoint);
    await hold(page, 'KeyW', Math.min(250, Math.max(60, (math.distance(s.player, waypoint) - .2) / 4.3 * 1000)));
  }
  throw Error(`Input navigation stalled toward ${JSON.stringify(goal)}`);
}

export async function gift(page) {
  await live(page);
  const size = page.viewportSize(); await page.mouse.click(size.width / 2, size.height / 2);
}
