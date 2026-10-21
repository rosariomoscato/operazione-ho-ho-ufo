import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
const code=stripTypeScriptTypes(await readFile('src/storage.ts','utf8'),{mode:'strip'});
const s=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('polish settings clamp finite ranges and reject malformed values',()=>{
  assert.deepEqual(s.normalizeSettings(null),s.freshSettings());
  const p=s.normalizeSettings({sensitivity:99,fov:-3,invertY:true});
  assert.equal(p.sensitivity,2);assert.equal(p.fov,45);assert.equal(p.invertY,true);
  for(const n of [NaN,Infinity,'60',null]) {
    const p=s.normalizeSettings({sensitivity:n,fov:n});assert.equal(p.sensitivity,1);assert.equal(p.fov,53);
  }
  assert.equal(s.normalizeSettings({sensitivity:-1,fov:99}).sensitivity,.25);
  assert.equal(s.normalizeSettings({fov:99}).fov,75);
});
test('bindings accept independent remaps but reject conflicts and reserved/browser keys',()=>{
  const bindings={...s.defaultKeyBindings,forward:'KeyZ',left:'KeyQ',help:'ShiftRight'};
  assert.deepEqual(s.normalizeSettings({keyBindings:bindings}).keyBindings,bindings);
  for(const code of ['Escape','Tab','Enter','F5','ControlLeft','KeyS','Unknown','']) {
    assert.deepEqual(s.normalizeSettings({keyBindings:{...bindings,forward:code}}).keyBindings,s.defaultKeyBindings);
  }
  assert.deepEqual(s.normalizeSettings({keyBindings:{forward:'KeyZ'}}).keyBindings,s.defaultKeyBindings);
});
test('preferences are independent, round trip without modifying checkpoints, and survive denied storage',()=>{
  const first=s.freshSettings();first.keyBindings.forward='KeyZ';assert.equal(s.freshSettings().keyBindings.forward,'KeyW');
  const data=new Map([[s.SAVE_KEY,'retained checkpoint']]);
  globalThis.localStorage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const p={...first,sensitivity:1.7,fov:68,invertY:true};s.writeSettings(p);assert.deepEqual(s.readSettings(),p);assert.equal(data.get(s.SAVE_KEY),'retained checkpoint');
  globalThis.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};
  assert.doesNotThrow(()=>s.writeSettings(p));assert.deepEqual(s.readSettings(),s.freshSettings());
});
