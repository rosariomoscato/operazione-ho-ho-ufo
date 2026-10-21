import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
const source=stripTypeScriptTypes(await readFile('src/input.ts','utf8'),{mode:'strip'});
const {Input}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
class Element extends EventTarget { matches(){return false;} focus(){} setPointerCapture(){} }
globalThis.HTMLElement=Element;
const defaults={forward:'KeyW',backward:'KeyS',left:'KeyA',right:'KeyD',dodge:'Space',interact:'KeyE',help:'KeyH'};
function fixture(){globalThis.window=new EventTarget();const canvas=new Element(),input=new Input(canvas);input.setBindings(defaults);return{canvas,input,send:(type,props={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,props);window.dispatchEvent(e);return e;}};}
test('remapping a held key clears canonical and physical state; stale keyup is harmless',()=>{
  const {input,send}=fixture();send('keydown',{code:'KeyW'});assert.ok(input.keys.has('KeyW'));input.setBindings({...defaults,forward:'KeyZ'});assert.equal(input.keys.size,0);send('keyup',{code:'KeyW'});send('keydown',{code:'KeyZ'});assert.ok(input.consume('KeyW'));send('keyup',{code:'KeyZ'});assert.equal(input.keys.size,0);
});
test('capture intercepts Escape, while normal Escape always pauses and browser chords stay untouched',()=>{
  const {input,send}=fixture();let paused=0,captured=0;input.onPause=()=>paused++;input.capture=()=>captured++;send('keydown',{code:'Escape'});assert.equal(captured,1);assert.equal(paused,0);input.capture=null;send('keydown',{code:'Escape'});assert.equal(paused,1);
  for(const modifier of ['ctrlKey','altKey','metaKey'])assert.equal(send('keydown',{code:'KeyW',[modifier]:true}).defaultPrevented,false);
  assert.equal(input.keys.size,0);
});
test('blur clears dragging, throw, held keys and deltas; endFrame preserves held movement',()=>{
  const {input,send}=fixture();send('keydown',{code:'KeyW'});input.endFrame();assert.ok(input.keys.has('KeyW'));assert.equal(input.pressed.size,0);input.dragging=true;input.throwRequested=true;input.dx=10;input.dy=-2;send('blur');assert.equal(input.keys.size,0);assert.equal(input.dragging,false);assert.equal(input.throwRequested,false);assert.equal(input.dx,0);assert.equal(input.dy,0);
});
test('focused credits links keep native keyboard activation instead of queuing game input',()=>{
  const {input}=fixture();
  class Link extends Element {matches(selector){return selector.split(',').includes('a');}}
  for(const code of ['Enter','Space','KeyE']){
    const event=new Event('keydown',{cancelable:true});
    Object.defineProperties(event,{code:{value:code},target:{value:new Link()}});
    window.dispatchEvent(event);
    assert.equal(event.defaultPrevented,false);assert.equal(input.keys.size,0);assert.equal(input.pressed.size,0);
  }
});
