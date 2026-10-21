import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';

const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const url = new URL(specifier + '.ts', context.parentURL);
      if (existsSync(url)) return { url: url.href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith('.ts')) return { format: 'module', source: stripTypeScriptTypes(readFileSync(fileURLToPath(url), 'utf8'), { mode: 'transform' }), shortCircuit: true };
    return next(url, context);
  },
});
const { createWorld } = await import('../src/levels/square.ts');
const { createSquamakk } = await import('../src/characters/cast/squamakk.ts');
const { BossBattle, bossConfig, bossSectorContains } = await import('../src/gameplay/boss.ts');
function battleFixture(segments = 0) {
  const battle = new BossBattle(), events = [], hits = [];
  battle.reset(segments, true); let serial = 0;
  const ctx = { time:0, origin:{x:0,z:0}, player:{x:0,z:8}, canStart:()=>true, lineClear:()=>true,
    reserveAttack:()=>++serial, damage:id=>hits.push(id), log:(type,data)=>events.push({time:ctx.time,type,...data}),
    cue:()=>{}, segmentComplete:()=>{}, windowOpened:()=>{}, missed:()=>{} };
  const tick = (dt=.01) => { ctx.time += dt; battle.update(ctx); };
  const until = predicate => { for(let i=0;i<6000&&!predicate();i++)tick();assert.ok(predicate(),'Boss unit fixture did not reach expected phase'); };
  return { battle, ctx, events, hits, tick, until };
}
function stats(root) {
  let calls = 0, triangles = 0;
  root.traverseVisible(object => {
    if (!object.isMesh) return;
    calls += Array.isArray(object.material) ? Math.max(1, object.geometry.groups.length) : 1;
    triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3 * (object.isInstancedMesh ? object.count : 1);
  });
  return { calls, triangles };
}
test('square world keeps real solids and its geometry/light budget', () => {
  const scene = new THREE.Scene(), world = createWorld(scene);
  assert.deepEqual(world.obstacles, [
    { id: 'square-tree', minX: 7.2, maxX: 8.8, minZ: -6.8, maxZ: -5.2 },
    { id: 'square-sled', minX: -11, maxX: -7, minZ: -8.5, maxZ: -5.5 },
  ]);
  let lights = 0; scene.traverse(o => { if (o.isLight) lights++; }); assert.equal(lights, 3);
  world.setStoryState('ending', 0); world.update(1, 'ending', false);
  const budget = stats(world.root); assert.ok(budget.calls <= 25); assert.ok(budget.triangles <= 35000);
});
test('square final timeline is gated by restitution, seek-safe and terminal on restore', () => {
  const world = createWorld(new THREE.Scene());
  const ship = world.root.getObjectByName('Nave di Squamakk'), portal = world.root.getObjectByName('Portale alieno'), sled = world.root.getObjectByName('Slitta delle consegne');
  assert.ok(ship && portal && sled);
  const signature = () => [ship, portal, sled].map(o => ({ position: o.position.toArray(), scale: o.scale.toArray(), visible: o.visible }));
  for (const stage of ['battle', 'core', 'carrying']) {
    world.setStoryState(stage, 0); world.update(50, stage === 'battle' ? 'boss' : 'core', false);
    assert.equal(ship.visible, true); assert.equal(portal.visible, true); assert.equal(ship.scale.x, 1);
  }
  world.setStoryState('ending', 10); world.update(13.75, 'ending', false);
  assert.equal(ship.scale.x, .5); const middle = signature();
  world.update(18, 'ending', false); assert.equal(ship.visible, false); assert.equal(portal.visible, false); assert.equal(sled.visible, false);
  world.update(13.75, 'ending', false); assert.deepEqual(signature(), middle);
  world.setStoryState('ending', 100); world.update(13.75, 'ending', false); assert.deepEqual(signature(), middle);
  world.setStoryState('battle', 0); world.update(0, 'square', false); assert.equal(ship.visible, true);
  world.setStoryState('ending', -8); world.update(0, 'ending', true);
  assert.equal(ship.visible, false); assert.equal(portal.visible, false); assert.equal(sled.visible, false);
});
test('Squamakk feet stay planted through 48 actual rig poses within budget', () => {
  const actor = createSquamakk();
  for (let i = 0; i < 48; i++) {
    actor.root.rotation.y = i * .17; actor.update(i / 8, i % 2 === 0, i % 3 === 0);
    actor.root.updateMatrixWorld(true);
    assert.ok(actor.floorError() <= .002);
    const box = new THREE.Box3().setFromObject(actor.root, true);
    assert.ok(Math.abs(box.min.y) <= .002, `Actual vertex floor at pose ${i}: ${box.min.y}`);
  }
  const budget = stats(actor.root); assert.ok(budget.calls <= 20); assert.ok(budget.triangles <= 18000);
  const muzzle = actor.root.userData.muzzleLocal; assert.ok(muzzle?.isVector3);
  const world = actor.root.localToWorld(muzzle.clone()); assert.ok(world.toArray().every(Number.isFinite));
});
test('boss finite cone includes the body margin but not points beyond its real boundary', () => {
  const o={x:0,z:0};
  assert.equal(bossSectorContains(o,{x:0,z:22.48},0),true);
  assert.equal(bossSectorContains(o,{x:0,z:22.481},0),false);
  assert.equal(bossSectorContains(o,{x:0,z:-.48},0),true);
  assert.equal(bossSectorContains(o,{x:0,z:-.481},0),false);
  const r=10,a=bossConfig.halfAngle;
  for(const [margin,inside] of [[.48,true],[.481,false]]) {
    const p={x:r*Math.sin(a)+margin*Math.cos(a),z:r*Math.cos(a)-margin*Math.sin(a)};
    assert.equal(bossSectorContains(o,p,0),inside);
  }
});
test('boss tracks before lock and keeps >=.8s visible lock even with a long frame', () => {
  const f=battleFixture();f.tick();f.ctx.player.x=1;f.tick(.1);const tracking=f.battle.angle;assert.ok(tracking>0);
  f.tick(.25);const locked=f.battle.angle;f.ctx.player.x=-4;
  f.until(()=>f.battle.phase==='active');assert.equal(f.battle.angle,locked);
  const active=f.events.find(e=>e.type==='boss-active');assert.ok(active.windup>=1.4);assert.ok(active.lockedFor>=.8);
  const slow=battleFixture();slow.tick();slow.tick(2);assert.equal(slow.battle.phase,'windup');
  slow.tick(.81);assert.equal(slow.battle.phase,'active');
});
test('boss patterns are 1/2/3 sequential cones, with one damage per attack and one gift per window', () => {
  const f=battleFixture();
  for(let segment=1;segment<=3;segment++) {
    f.until(()=>f.battle.phase==='vulnerable');
    assert.equal(f.battle.cone,segment);assert.equal(f.battle.segments,segment-1);
    const tag=f.battle.launch(f.ctx.time,true);
    assert.equal(f.battle.acceptGift(tag,f.ctx).accepted,true);
    assert.equal(f.battle.acceptGift(tag,f.ctx).accepted,false);
    assert.equal(f.battle.segments,segment);
  }
  assert.equal(f.battle.phase,'defeated');assert.equal(f.events.filter(e=>e.type==='boss-windup').length,6);
  assert.equal(new Set(f.hits).size,f.hits.length);assert.ok(f.hits.length<=6);
  for(const active of f.events.filter(e=>e.type==='boss-active'))assert.ok(active.lockedFor>=.8);
});
test('prefire, expired and previous-window gifts cannot steal boss progress; miss preserves segments', () => {
  const f=battleFixture(1),prefire=f.battle.launch(0,true);
  f.until(()=>f.battle.phase==='vulnerable');assert.equal(f.battle.acceptGift(prefire,f.ctx).accepted,false);
  const old=f.battle.launch(f.ctx.time,true),id=f.battle.windowId;
  assert.equal(f.battle.acceptGift({...old,inRange:false},f.ctx).accepted,false);
  f.tick(bossConfig.window+.01);assert.equal(f.battle.segments,1);assert.equal(f.battle.phase,'windup');
  f.until(()=>f.battle.phase==='vulnerable');assert.ok(f.battle.windowId>id);
  assert.equal(f.battle.acceptGift(old,f.ctx).accepted,false);
  assert.equal(f.battle.acceptGift(f.battle.launch(f.ctx.time,true),f.ctx).accepted,true);assert.equal(f.battle.segments,2);
});
test('offscreen boss waits and a blocked damage line does not hurt the player', () => {
  const f=battleFixture();f.ctx.canStart=()=>false;f.tick(5);assert.equal(f.battle.phase,'waiting');
  f.ctx.canStart=()=>true;f.ctx.lineClear=()=>false;f.until(()=>f.battle.phase==='vulnerable');
  assert.deepEqual(f.hits,[]);
});
process.on('exit', () => hooks.deregister());
