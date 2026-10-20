export class Input {
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
      if(e.code==='Escape' && !e.repeat) {e.preventDefault();this.onPause();return;}
      if ((e.target as HTMLElement)?.matches('input,button,select')) return;
      if(['Space','KeyW','KeyA','KeyS','KeyD','Escape','KeyE'].includes(e.code)) e.preventDefault();
      if(!this.keys.has(e.code)) this.pressed.add(e.code); this.keys.add(e.code);this.onGesture();
    });
    window.addEventListener('keyup',e=>this.keys.delete(e.code));
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    canvas.addEventListener('pointerdown',e=>{this.onGesture();canvas.focus();if(e.button===2){this.dragging=true;canvas.setPointerCapture(e.pointerId);}if(e.button===0)this.throwRequested=true;});
    window.addEventListener('pointerup',e=>{if(e.button===2)this.dragging=false;});
    canvas.addEventListener('pointermove',e=>{if(this.dragging){this.dx+=e.movementX;this.dy+=e.movementY;}});
    window.addEventListener('blur',()=>this.clear());
  }
  consume(code:string):boolean {return this.pressed.delete(code);}
  endFrame():void {this.pressed.clear();this.throwRequested=false;this.dx=this.dy=0;}
  clear():void {this.keys.clear();this.endFrame();this.dragging=false;}
}
