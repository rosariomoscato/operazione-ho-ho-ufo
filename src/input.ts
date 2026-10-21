import type { KeyBindings } from './storage';
export class Input {
  private physical=new Map<string,string>();
  mapCode:(code:string)=>string|null=code=>code;
  capture:((event:KeyboardEvent)=>void)|null=null;
  setBindings(bindings:KeyBindings):void {this.clear();const canonical={forward:'KeyW',backward:'KeyS',left:'KeyA',right:'KeyD',dodge:'Space',interact:'KeyE',help:'KeyH'};const map=new Map(Object.entries(bindings).map(([action,code])=>[code,canonical[action as keyof KeyBindings]]));this.mapCode=code=>map.get(code)??(code==='Enter'?'Enter':null);}
  keys = new Set<string>();
  pressed = new Set<string>();
  throwRequested = false;
  dragging = false;
  dx = 0;
  dy = 0;
  onGesture: () => void = () => {};
  onPause: () => void = () => {};
  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', e => {
      if(this.capture){e.preventDefault();e.stopImmediatePropagation();this.capture(e);return;}
      if(e.code==='Escape' && !e.repeat) {e.preventDefault();this.onPause();return;}
      if(e.altKey||e.ctrlKey||e.metaKey)return;
      if (e.target instanceof HTMLElement&&e.target.matches('input,button,select,a')) return;
      const code=this.mapCode(e.code);if(!code)return;e.preventDefault();
      if(e.repeat&&!this.physical.has(e.code))return;
      if(!this.physical.has(e.code)&&!e.repeat){this.pressed.add(code);this.physical.set(e.code,code);}this.keys.add(code);this.onGesture();
    },true);
    window.addEventListener('keyup',e=>{const code=this.physical.get(e.code);this.physical.delete(e.code);if(code&&!Array.from(this.physical.values()).includes(code))this.keys.delete(code);});
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    canvas.addEventListener('pointerdown',e=>{this.onGesture();canvas.focus();if(e.button===2){this.dragging=true;canvas.setPointerCapture(e.pointerId);}if(e.button===0)this.throwRequested=true;});
    window.addEventListener('pointerup',e=>{if(e.button===2)this.dragging=false;});
    canvas.addEventListener('pointermove',e=>{if(this.dragging){this.dx+=e.movementX;this.dy+=e.movementY;}});
    window.addEventListener('blur',()=>this.clear());
  }
  consume(code:string):boolean {return this.pressed.delete(code);}
  endFrame():void {this.pressed.clear();this.throwRequested=false;this.dx=this.dy=0;}
  clear():void {this.physical.clear();this.keys.clear();this.endFrame();this.dragging=false;}
}
