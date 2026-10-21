import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';

// Resolve local extensionless TS imports without emitting or editing game files.
const hooks=registerHooks({
  resolve(specifier,context,next) {
    if(specifier.startsWith('.')&&context.parentURL?.startsWith('file:')) {
      const url=new URL(specifier+'.ts',context.parentURL);
      if(existsSync(url))return {url:url.href,shortCircuit:true};
    }
    return next(specifier,context);
  },
  load(url,context,next) {
    if(url.endsWith('.ts'))return {format:'module',source:stripTypeScriptTypes(readFileSync(fileURLToPath(url),'utf8'),{mode:'transform'}),shortCircuit:true};
    return next(url,context);
  },
});
const {RangedSystem,rangedConfig}=await import('../src/gameplay/systems/ranged.ts');
const {createWorld}=await import('../src/levels/toystreet.ts');

function setup(obstacles=[]) {
  const scene=new THREE.Scene(),system=new RangedSystem(scene),events=[],hits=[];
  const enemy={id:1,key:'workshop:0',kind:'ranged',hp:2,x:0,z:0,status:'approach',since:0,angle:0,attackId:0,hit:false};
  const ctx={scene,time:0,player:{x:0,z:8,hp:6,invulnerableUntil:0},enemies:[enemy],obstacles,
    active:()=>true,visible:()=>true,committed:()=>system.committed()||enemy.status==='windup',canAttack:()=>true,
    reserveAttack:()=>1,delayAttack:()=>{},damage:(...args)=>hits.push(args),log:(type,data)=>events.push({type,...data}),effect:()=>{},notify:()=>{},coverSuccess:()=>{},
  };
  const tick=dt=>{ctx.time+=dt;system.update(ctx,dt);system.pose(ctx);};
  return {system,ctx,enemy,events,hits,tick};
}
test('ranged windup tracks briefly, locks direction and releases after >=1.2 seconds',()=>{
  const {system,ctx,enemy,events,tick}=setup();tick(.01);assert.equal(enemy.status,'windup');
  ctx.player.x=1;tick(.1);const tracking=enemy.angle;assert.ok(tracking>0);
  tick(.15);const locked=enemy.angle;ctx.player.x=-3;
  tick(.7);assert.equal(enemy.angle,locked);assert.equal(system.state().length,0);
  tick(.3);assert.equal(system.state().length,1);
  const release=events.find(e=>e.type==='ranged-release');
  assert.ok(release.windup>=1.2);assert.ok(release.lockedFor>=.8);
  assert.equal(release.speed,6);assert.equal(enemy.status,'recovery');
  assert.ok(system.committed());system.reset();assert.equal(system.state().length,0);
});
test('ranged attacks require visibility and unobstructed initial line of sight',()=>{
  const hidden=setup();hidden.ctx.visible=()=>false;hidden.tick(.1);assert.notEqual(hidden.enemy.status,'windup');
  const covered=setup([{id:'cover',minX:-2,maxX:2,minZ:3,maxZ:4}]);covered.tick(.1);assert.notEqual(covered.enemy.status,'windup');
});
test('launched bolt hits newly interposed cover before a player even in a large frame',()=>{
  const {ctx,system,tick,hits,events}=setup();tick(.01);tick(1.21);
  assert.equal(system.state().length,1);
  ctx.obstacles.push({id:'cover',minX:-2,maxX:2,minZ:3,maxZ:4});
  tick(2);assert.equal(hits.length,0);assert.equal(system.state().length,0);
  assert.ok(events.some(e=>e.type==='bolt-end'&&e.reason==='cover'&&e.collider==='cover'));
});
test('launched bolt damages at most once and has bounded lifetime/pool',()=>{
  const {system,tick,hits}=setup();tick(.01);tick(1.21);tick(2);tick(.1);
  assert.equal(hits.length,1);assert.equal(system.state().length,0);
  assert.equal(system.bolts.length,rangedConfig.pool);
  const miss=setup();miss.tick(.01);miss.tick(1.21);miss.ctx.player.x=10;miss.tick(3.1);
  assert.equal(miss.hits.length,0);assert.equal(miss.system.state().length,0);
});
test('street world keeps independent beacons, deterministic descent and a three-light budget',()=>{
  const scene=new THREE.Scene(),world=createWorld(scene),ship=world.root.getObjectByName('Nave verso la piazza');
  assert.ok(ship);assert.equal(world.anchor,world.anchors.workshop);
  let lights=0;scene.traverse(o=>{if(o.isLight)lights++;});assert.equal(lights,3);
  assert.equal(world.obstacles.length,4);
  for(const id of ['workshop','carousel']) {
    world.setAnchors([id,id,'unknown'],10);world.update(20,'street',false);
    assert.equal(ship.position.y,8,'one unique valid anchor never lowers the ship');
  }
  world.setAnchors(['workshop','carousel'],10);
  for(const [t,y] of [[10,8],[11.5,5.5],[13,3],[10,8]]) {
    world.update(t,'street-complete',false);assert.equal(ship.position.y,y);
  }
  world.setAnchors(['carousel','workshop'],30);world.update(13,'street-complete',true);
  assert.equal(ship.position.y,3,'repeated setter never restarts descent');
  world.setAnchors([],0);world.update(0,'street',false);assert.equal(ship.position.y,8);
  world.setAnchors(['workshop','carousel'],-3);world.update(0,'street-complete',false);
  assert.equal(ship.position.y,3,'restore timestamp yields an already lowered ship');
});
process.on('exit',()=>hooks.deregister());
