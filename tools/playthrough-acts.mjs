import assert from 'node:assert/strict';
import { state, face, hold, walk, gift, math } from './input-driver.mjs';

export const streetObstacles = [
  { id: 'street-west-shop', minX: -14, maxX: -10, minZ: -1, maxZ: 4 },
  { id: 'street-east-shop', minX: 10, maxX: 14, minZ: -1, maxZ: 4 },
  { id: 'street-train-cover', minX: -10, maxX: -6, minZ: -2, maxZ: -.5 },
  { id: 'street-carousel-cover', minX: 6, maxX: 10, minZ: -2, maxZ: -.5 },
];
const courtyardObstacles = [
  { id: 'cabinWest', minX: -13, maxX: -7, minZ: -6, maxZ: 0 },
  { id: 'cabinEast', minX: 7, maxX: 13, minZ: -9, maxZ: -3 },
  { id: 'crateWest', minX: -8, maxX: -6, minZ: 5, maxZ: 7 },
  { id: 'crateEast', minX: 5, maxX: 7, minZ: 1, maxZ: 3 },
];

export async function recover(page, report) {
  let s = await state(page);
  if (s.player.hp <= 0) {
    report.deaths ??= []; report.deaths.push({ chapter: s.chapter, time: s.time, checkpoint: s.checkpoint });
    assert.ok(report.deaths.length <= 12, 'Too many deaths; investigate rather than looping indefinitely');
    await page.getByRole('button', { name: 'Ricomincia checkpoint', exact: true }).click();
    await page.waitForTimeout(100); s = await state(page);
  } else if (!s.playing) {
    const resume = page.getByRole('button', { name: 'Riprendi', exact: true });
    assert.equal(await resume.isVisible(), true, 'Unexpected non-playing state');
    await resume.click(); s = await state(page);
  }
  return s;
}

export async function safeWalk(page, report, goal, options) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await recover(page, report);
    try { await walk(page, goal, {...options,beforeStep:async s=>{
      // Checkpoint-restored M2 defenders can already be pursuing the player.
      // Do not march past them repeatedly while trying to reach another arena.
      if(s.chapter!=='toystreet')return false;
      const enemy=s.enemies.filter(e=>e.hp>0&&math.distance(e,s.player)<=8&&math.lineClear(s.player,e,streetObstacles,.2)).sort((a,b)=>math.distance(a,s.player)-math.distance(b,s.player))[0];
      if(!enemy)return false;
      if(s.enemies.some(e=>e.status==='windup'||e.status==='active'))await page.keyboard.press('Space');
      if(!await aimOrRetry(page,report,enemy))return true;
      if(!await giftOrRetry(page,report))return true;
      await page.waitForTimeout(650);return true;
    }}); return; }
    catch (error) { if ((await state(page)).player.hp > 0) throw error; }
  }
  throw Error('Could not reach target after real checkpoint retries');
}

export async function aimOrRetry(page, report, target) {
  try { await face(page, target); return true; }
  catch (error) {
    if ((await state(page)).player.hp > 0) throw error;
    await recover(page, report); return false;
  }
}

export async function giftOrRetry(page, report) {
  try { await gift(page); report.shots++; return true; }
  catch (error) {
    // The simulation can advance between a read and the guarded click. Keep
    // the no-menu-click guard, count the death and use the real retry button.
    if ((await state(page)).player.hp > 0) throw error;
    await recover(page, report); return false;
  }
}

export async function firstTwoActs(page, report) {
  // Fresh browser storage and explicit New game; no seeded checkpoints/debug jumps.
  await page.getByRole('button', { name: 'Nuova partita', exact: true }).click();
  // Intro HUD is refreshed while playing. Use its advertised keyboard skip
  // instead of racing Playwright's stability checks against replaced buttons.
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => LC.state().beat === 'training');
  await face(page, { x: -2, z: 4 });
  for (let i = 0; i < 5 && !(await state(page)).droneHit; i++) {
    await gift(page); report.shots++; await page.waitForTimeout(900);
  }
  assert.equal((await state(page)).droneHit, true);
  await page.keyboard.press('Space'); await page.waitForTimeout(450);
  for (let attempt = 0; attempt < 120; attempt++) {
    const s = await recover(page, report);
    if (s.beat === 'anchor') break;
    assert.equal(s.chapter, 'courtyard');
    const enemy = s.enemies.filter(e => e.hp > 0).sort((a,b) => math.distance(a,s.player)-math.distance(b,s.player))[0];
    if (!enemy) { await page.waitForTimeout(100); continue; }
    if (math.distance(s.player, enemy) > 9 || !math.lineClear(s.player, enemy, courtyardObstacles, .1)) {
      const waypoint = math.nextWaypoint(s.player, enemy, courtyardObstacles, .55);
      if (await aimOrRetry(page, report, waypoint)) await hold(page, 'KeyW', 220); continue;
    }
    if (!await aimOrRetry(page, report, enemy)) continue;
    if (!await giftOrRetry(page, report)) continue; await page.waitForTimeout(700);
  }
  assert.equal((await state(page)).beat, 'anchor', 'M1 defenders not all cleared');
  await safeWalk(page, report, { x: 0, z: -9 }, { obstacles: courtyardObstacles, stop: 1.7 });
  await page.keyboard.press('KeyE'); await page.waitForTimeout(100);
  assert.equal((await state(page)).beat, 'complete');
  report.boundaries.push({ name: 'M1 complete', state: await state(page) });
  await safeWalk(page, report, { x: 0, z: -14 }, { obstacles: courtyardObstacles, stop: 1.7 });
  await page.keyboard.press('KeyE'); await page.waitForTimeout(100);
  assert.equal((await state(page)).chapter, 'toystreet');
  for (const id of ['workshop','carousel']) {
    await safeWalk(page, report, { x: id === 'workshop' ? -8 : 8, z: -4 }, { obstacles: streetObstacles, stop: 4 });
    for (let attempt = 0; attempt < 110; attempt++) {
      const s = await recover(page, report);
      assert.equal(s.chapter, 'toystreet');
      if (s.clearedArenas.includes(id)) break;
      const enemy = s.enemies.filter(e => e.hp > 0).sort((a,b)=>math.distance(a,s.player)-math.distance(b,s.player))[0];
      if (!enemy) { await page.waitForTimeout(120); continue; }
      if (math.distance(s.player, enemy) > 8 || !math.lineClear(s.player, enemy, streetObstacles, .2)) {
        await safeWalk(page, report, enemy, { obstacles: streetObstacles, stop: 5 }); continue;
      }
      if (!await aimOrRetry(page, report, enemy)) continue;
      if ((await state(page)).player.hp <= 0) continue;
      if (!await giftOrRetry(page, report)) continue;
      if (s.bolts.length || s.enemies.some(e=>e.status==='windup')) await page.keyboard.press('Space');
      await page.waitForTimeout(650);
    }
    assert.ok((await state(page)).clearedArenas.includes(id), `${id} not cleared`);
    await safeWalk(page, report, { x: id === 'workshop' ? -8 : 8, z: -9 }, { obstacles: streetObstacles, stop: 1.7 });
    await page.keyboard.press('KeyE'); await page.waitForTimeout(100);
    assert.ok((await state(page)).disabledAnchors.includes(id));
    report.boundaries.push({ name: `${id} disabled`, state: await state(page) });
    const after = await state(page);
    if (after.healAvailable && after.player.hp < 6) await safeWalk(page, report, { x: 0, z: 0 }, { obstacles: streetObstacles, stop: .8 });
  }
  assert.equal((await state(page)).beat, 'street-complete');
  await safeWalk(page, report, { x: 0, z: -13.5 }, { obstacles: streetObstacles, stop: 1.7 });
  await page.keyboard.press('KeyE'); await page.waitForTimeout(100);
  assert.equal((await state(page)).chapter, 'square', 'M2 gate must enter final act');
  report.boundaries.push({ name: 'M3 entry', state: await state(page) });
}
