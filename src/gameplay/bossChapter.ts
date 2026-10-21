import * as THREE from 'three';
import type { Game } from '../game';
import type { Checkpoint, BossCheckpoint } from '../storage';
import type { Point } from '../engine/math';
import { distance, lineClear, move } from '../engine/math';
import { squareLayout as layout } from '../acts/square';
import { BossBattle, bossConfig, type BossContext, type BossGift, type BossPhase } from './boss';
import { BossVisual } from './bossVisual';
import { dialogueLines } from '../texts';

export class BossChapter {
  readonly boss=new BossBattle();readonly visual:BossVisual;
  coreCarried=false;coreReturned=false;endingStarted=0;scarfAnnounced=false;closedAnnounced=false;
  private story:'battle'|'core'|'carrying'|'ending'|null=null;
  private deniedRange:'core'|'tree'|null=null;
  constructor(readonly game:Game,save:Checkpoint){
    this.visual=new BossVisual(game.scene);this.boss.reset(save.bossSegments,save.boundary==='boss');this.coreCarried=save.coreCarried;this.coreReturned=save.coreReturned;this.endingStarted=-8;
    if(this.coreReturned)this.visual.depositFrom=new THREE.Vector3(game.player.x+Math.cos(game.yaw)*.9,1.7,game.player.z-Math.sin(game.yaw)*.9);
    this.setStory('battle',0);if(this.coreReturned){this.setStory('ending',this.endingStarted);this.scarfAnnounced=this.closedAnnounced=true;}else if(this.coreCarried)this.setStory('carrying',0);else if(this.boss.segments===3)this.setStory('core',0);
  }
  setStory(state:'battle'|'core'|'carrying'|'ending',time:number):void {if(state===this.story)return;this.game.world.setStoryState?.(state,time);this.story=state;}
  fields():BossCheckpoint{return {bossSegments:this.boss.segments,bossDefeated:this.boss.segments===3,coreCarried:this.coreCarried,coreReturned:this.coreReturned};}
  context():BossContext {const g=this.game;return {time:g.time,origin:layout.boss,player:g.player,canStart:()=>g.visible(layout.boss,1.4)&&!g.systems.some(s=>s.committed())&&!g.enemies.some(e=>e.hp>0&&(e.status==='windup'||e.status==='active')),lineClear:()=>lineClear(layout.boss,g.player,g.world.obstacles),reserveAttack:()=>++g.attackSerial,damage:id=>g.damage(id,'boss'),log:(type,data)=>g.log(type,data),cue:()=>g.effect('sfx.alien'),segmentComplete:()=>this.segmentComplete(),windowOpened:()=>{g.notify('Nucleo esposto: lancia ora · portata12m');g.log('hint',{id:'h.boss.window'});},missed:()=>g.notify('Finestra mancata: stesso ciclo. Schiva e riprova, nessun segmento perso.')};}
  segmentComplete():void {const g=this.game;g.progress('boss-segment');g.effect('sfx.wrap');g.feedbackUntil=0;
    if(this.boss.segments===3){g.beat='core';this.setStory('core',g.time);g.save('core');g.sayLine('vo.squamakk.defeat',5);g.log('boss-defeated',{segments:3});}
    else g.save('boss');
    g.notify(`Colpo riuscito ${this.boss.segments}/3${this.boss.segments===3?' · Recupera il nucleo: E':''}`);
  }
  update():void {
    const g=this.game;
    if(this.boss.segments<3){const d=distance(g.player,layout.boss),r=1.28;if(d<r)move(g.player,(d>1e-6?(g.player.x-layout.boss.x)/d:0)*(r-d),(d>1e-6?(g.player.z-layout.boss.z)/d:1)*(r-d),.48,g.world.obstacles);}
    if(g.beat==='square'&&distance(g.player,layout.encounter)<=layout.encounter.radius){g.beat='boss';this.boss.activate(g.time);g.progress('boss-encounter');g.save('boss');g.log('boss-encounter',{checkpointBeforeAttack:true});g.notify('Raggio in arrivo: esci dalla zona segnalata!');g.audio.music('music.combat');}
    if(g.beat==='boss')this.boss.update(this.context());
    if(g.beat==='ending')this.updateEnding();
    if(this.deniedRange&&g.time<g.feedbackUntil){const target=this.deniedRange==='core'?layout.core:layout.treeInteraction;if(distance(g.player,target)<=2.2&&lineClear(g.player,target,g.world.obstacles)){g.feedbackUntil=0;this.deniedRange=null;}}
    if(g.beat!=='ending'){const idle=g.time-g.lastProgress,stage=idle>=45?3:idle>=30?2:idle>=15?1:0;if(stage>g.hintStage){g.hintStage=stage;this.help(stage);}}
  }
  launch():BossGift {const g=this.game,tag=this.boss.launch(g.time,distance(g.player,layout.boss)<=bossConfig.giftRange+.001);g.log('boss-gift-launch',{...tag,phase:this.boss.phase,segments:this.boss.segments});
    g.notify(this.boss.phase==='approach'?'Avvicinati per affrontare Squamakk':this.boss.segments===3?this.coreCarried?'Nucleo al sicuro · E all’albero':'Squamakk impacchettato · usa E sul nucleo':!tag.inRange?'Avvicinati al nucleo: portata12m':tag.windowId===null?'Scudo del generale attivo · schiva il raggio':'Regalo verso il nucleo esposto');return tag;
  }
  impact(point:Point,tag:BossGift):boolean {const g=this.game;
    if(this.boss.segments===3){const reason=this.coreCarried?'Nucleo al sicuro · E all’albero':'Generale già impacchettato · recupera il nucleo con E';g.log('boss-gift-rejected',{reason,phase:'defeated',launchWindowId:tag.windowId});g.notify(reason);return false;}
    if(this.boss.phase==='approach'||!tag.inRange){const result=this.boss.acceptGift(tag,this.context());g.notify(result.reason);return false;}
    if(distance(point,layout.boss)>bossConfig.giftRadius||!lineClear(point,layout.boss,g.world.obstacles)){g.log('boss-gift-miss',{...tag,x:point.x,z:point.z});g.notify('Mancato · porta il nucleo al+; portata12m');return false;}
    const result=this.boss.acceptGift(tag,this.context());g.notify(result.reason);return result.accepted;
  }
  targeting(hit:THREE.Vector3):boolean {const g=this.game;if(this.boss.segments===3||distance(g.player,layout.boss)>bossConfig.giftRange||!g.visible(layout.boss,1.4))return false;
    const p=new THREE.Vector3(layout.boss.x,1.4,layout.boss.z).project(g.camera3);if(Math.hypot(p.x,p.y*.7)> (g.settings.aimAssist?.5:.12))return false;if(g.settings.aimAssist)hit.set(layout.boss.x,1.4,layout.boss.z);return true;
  }
  private deny(reason:string,target:'core'|'tree'|'boss',text:string,range?:number):void {const g=this.game;this.deniedRange=reason==='out-of-range'&&target!=='boss'?target:null;if(this.deniedRange)g.notifyRange(target==='tree'?layout.treeInteraction:layout.core,target==='tree'?'Albero':'Nucleo libero');else g.notify(text);g.log('interact-denied',{reason,target,distance:range});}
  private clearFlights():void {for(const gift of this.game.gifts){gift.active=false;gift.blast=-1;gift.bossTag=null;gift.root.visible=gift.ring.visible=false;}}
  interact():void {const g=this.game;
    if(g.beat==='ending'){g.notify(this.portalClosed?'Mondo salvato. Natale consegnato.':'Nucleo restituito · il portale si sta chiudendo');return;}
    if(this.boss.segments<3){this.deny('boss-protected','boss','Prima impacchetta Squamakk: schiva il cono e colpisci il nucleo esposto.');return;}
    const target=this.coreCarried?layout.treeInteraction:layout.core,dist=distance(g.player,target);
    if(!this.coreCarried&&distance(g.player,layout.treeInteraction)<=2.2){this.deny('no-core','tree','Prima recupera il nucleo libero davanti al generale.');return;}
    if(this.coreCarried&&distance(g.player,layout.core)<=2.2&&dist>2.2){this.deny('already-carried','core','Nucleo già al sicuro: portalo all’albero.');return;}
    if(dist>2.2||!lineClear(g.player,target,g.world.obstacles)){this.deny('out-of-range',this.coreCarried?'tree':'core',`${this.coreCarried?'Albero':'Nucleo libero'} · ${dist.toFixed(1)} m · E entro2,2m`,dist);return;}
    this.deniedRange=null;g.feedbackUntil=0;
    if(!this.coreCarried){this.clearFlights();this.coreCarried=true;g.beat='return-core';this.setStory('carrying',g.time);g.progress('core-carried');g.log('core-carried');g.save('return-core');g.effect('sfx.checkpoint');g.notify('Nucleo al sicuro · riportalo all’albero: E');}
    else{this.clearFlights();this.coreReturned=true;this.visual.depositFrom=this.visual.core.position.clone();g.beat='ending';this.endingStarted=g.time;this.setStory('ending',g.time);g.progress('core-returned');g.log('core-returned');g.save('ending');g.effect('sfx.anchor');g.notify('Nucleo restituito all’albero');g.audio.music('music.village');}
  }
  get elapsed():number{return Math.max(0,this.game.time-this.endingStarted);}
  get portalClosed():boolean {const portal=this.game.world.root.getObjectByName('Portale alieno');return !!portal&&(!portal.visible||portal.scale.length()<1e-6);}
  updateEnding():void {const g=this.game;g.world.update(g.time,g.beat,g.settings.reducedMotion);
    if(this.elapsed>=1&&this.elapsed<5&&!this.scarfAnnounced){this.scarfAnnounced=true;g.sayLine('vo.santa.scarf',4);g.log('ending-scarf-presentation',{elapsed:this.elapsed});}
    if(this.elapsed>=5&&this.portalClosed&&!this.closedAnnounced){this.closedAnnounced=true;g.log('ending-portal-closed',{elapsed:this.elapsed});g.sayLine('vo.briciola.saved',7);g.feedbackUntil=0;}
  }
  skipEnding():void {const g=this.game;if(!this.coreReturned)return;g.log('ending-skip',{fromElapsed:this.elapsed});g.time=Math.max(g.time,this.endingStarted+8);g.poseTime=g.time;this.updateEnding();g.renderNow();}
  target():Point {return this.game.beat==='square'?layout.encounter:this.game.beat==='boss'?layout.boss:this.coreCarried?layout.treeInteraction:layout.core;}
  objective():string {const beat=this.game.beat;return beat==='square'?'Avvicinati al generale nella piazza':beat==='boss'?'Schiva il cono; poi colpisci il nucleo esposto':beat==='core'?'Recupera il nucleo libero: E':beat==='return-core'?'Riporta il nucleo all’albero: E':this.portalClosed&&this.elapsed>=5?'Mondo salvato. Natale consegnato.':'Nucleo restituito · un regalo anche per Squamakk';}
  help(stage=1):void {const g=this.game,t=this.target(),d=distance(g.player,t),p=new THREE.Vector3(t.x,1,t.z).project(g.camera3),arrow=p.z>1?'↩ Dietro':p.x<-.65?'← Sinistra':p.x>.65?'Destra →':'↑ Avanti';
    g.helpText=g.beat==='ending'?'Il nucleo è restituito. Guarda la sciarpa; Invio o Salta finale per concludere.':g.beat==='square'?`Percorso ${arrow} · raggiungi il cerchio davanti al generale · ${d.toFixed(1)}m`:g.beat==='core'||g.beat==='return-core'?`Percorso ${arrow} · ${g.beat==='core'?'nucleo libero':'albero'} · ${d.toFixed(1)}m · premi E entro2,2m`:this.boss.phase==='vulnerable'?`${d>12?'Avvicinati: portata12m. ':''}Nucleo esposto: portalo al+ e clicca ora. ${arrow} · ${d.toFixed(1)}m`:stage>=2?`Scudo del generale. Esci di lato dal cono, poi avvicinati durante l’apertura. Boss ${arrow} · ${d.toFixed(1)}m`:'Esci dal cono (Spazio di lato). Dopo l’ultimo raggio il nucleo si apre: un regalo per ciclo.';
    g.helpUntil=g.time+10;g.log('help',{stage,reason:'square-no-progress',stalled:g.time-g.lastProgress,text:g.helpText});
  }
  applyCamera(camera:THREE.PerspectiveCamera):boolean {const g=this.game,elapsed=Math.max(0,g.poseTime-this.endingStarted);
    if(g.view==='face'){camera.fov=32;if(this.boss.segments===3&&(g.poseTime-(this.boss.defeatedAt??-2)>=1.4||g.beat==='ending')){camera.position.set(3,6.2,-6);camera.lookAt(layout.parcelOnShip.x,layout.parcelOnShip.y+1.3,layout.parcelOnShip.z);}else{camera.position.set(layout.boss.x+2.7,2.6,layout.boss.z+5);camera.lookAt(layout.boss.x,1.5,layout.boss.z);}camera.updateProjectionMatrix();camera.updateMatrixWorld(true);return true;}
    if(g.beat!=='ending'||g.view!=='player')return false;
    if(!g.settings.reducedMotion&&elapsed>=1&&elapsed<2.5){camera.fov=40;camera.position.set(4,6,-3);camera.lookAt(layout.parcelOnShip.x,layout.parcelOnShip.y+1.1,layout.parcelOnShip.z);}
    else{camera.fov=48;camera.position.set(13,11,8);camera.lookAt(0,3,-9);}camera.updateProjectionMatrix();camera.updateMatrixWorld(true);return true;
  }
  pose():void {const g=this.game;this.visual.pose(this.boss,g.poseTime,g.player,g.yaw,this.coreCarried,this.coreReturned,g.beat==='ending'?Math.max(0,g.poseTime-this.endingStarted):null,g.settings.reducedMotion);}
  occludes(minX:number,maxX:number,minY:number,maxY:number):boolean {if(this.boss.segments!==3||this.visual.onShip)return false;return [.8,1.8].some(y=>{const p=new THREE.Vector3(layout.boss.x,y,layout.boss.z).project(this.game.camera3);return p.z>-1&&p.z<1&&p.x>=minX&&p.x<=maxX&&p.y>=minY&&p.y<=maxY;});}
  renderHUD():void {
    const g=this.game,b=this.boss,t=this.target(),d=distance(g.player,t),p=new THREE.Vector3(t.x,1,t.z).project(g.camera3),arrow=p.z>1?'↩':p.x<-.7?'←':p.x>.7?'→':'↑';
    const destination=g.beat==='square'?'Generale':g.beat==='boss'?'Nucleo sul generale':this.coreCarried?'Albero':'Nucleo libero';
    const status=g.beat==='boss'?b.phase==='vulnerable'?`Nucleo esposto · ${(Math.max(0,b.windowUntil-g.time)).toFixed(1)}s`:b.phase==='waiting'?'Riallinea il generale davanti alla camera':b.phase==='gap'?'Pausa sicura · prepara la schivata':`${b.phase==='active'?'Raggio':'Carica'} ${b.cone}/${b.cycle} · esci dal cono`:b.segments===3?'Squamakk impacchettato':'Nessuna vittoria finché il nucleo non torna all’albero';
    const liveTarget=g.aim().boss;let hint=g.beat==='ending'?(this.portalClosed&&this.elapsed>=5?'Portale chiuso · le consegne possono cominciare':'Una sciarpa per il generale · Invio: salta finale'):g.beat==='boss'?(b.phase==='vulnerable'?(d>12?'Avvicinati al nucleo: portata12m':'Nucleo esposto: porta il bersaglio al+ e lancia'):status):d<=2.2&&(g.beat==='core'||g.beat==='return-core')?`E · ${g.beat==='core'?'Recupera il nucleo':'Restituisci all’albero'}`:'Segui il Percorso · E funziona entro2,2m';
    if(g.time<g.helpUntil)hint=g.helpText;if(g.time<g.feedbackUntil)hint=g.feedback;
    const guide=b.segments===0&&(g.beat==='boss'||g.beat==='square')?'<div class="howto panel">Esci dal cono, poi porta il nucleo al+ e lancia quando è esposto. Un regalo valido per ciclo.</div>':'';
    const reviewLine=g.review&&g.beat==='ending'?(this.elapsed>=1&&this.elapsed<5?'vo.santa.scarf':this.elapsed>=5&&this.portalClosed?'vo.briciola.saved':null):null;
    const dialogue=reviewLine?`${dialogueLines[reviewLine][0]}: «${dialogueLines[reviewLine][1]}»`:g.time<g.dialogueUntil?g.dialogue:'';
    const targetText=g.beat==='core'?'◇ Nucleo libero · E':g.beat==='return-core'?'◇ Albero · E':g.beat==='square'?'Avvicinati al generale':liveTarget?'◎ MIRATO · '+(b.phase==='vulnerable'?'nucleo vulnerabile':'scudo del generale'):'Tira al+ · portata12m';
    const navigation=g.beat==='ending'?'Nucleo restituito · Ancoraggi3/3':`Percorso ${arrow} ${destination} · ${d.toFixed(1)}m · Ancoraggi3/3`;
    const html=`<section class="objective panel"><strong>${this.objective()}</strong><div>${navigation}</div></section>${g.beat!=='ending'?`<section class="vitals panel"><div>Salute ${'▮'.repeat(g.player.hp)}${'▯'.repeat(6-g.player.hp)}</div><div>${g.time<g.player.dodgeReady?'Schivata '+(g.player.dodgeReady-g.time).toFixed(1)+'s':'Spazio · Schivata pronta'}</div></section><div class="boss-status panel">Generale Squamakk · ${'▮'.repeat(3-b.segments)}${'▯'.repeat(b.segments)} · ${b.segments}/3 colpi riusciti · Ciclo${b.cycle}<div>${status}</div></div><div class="target panel">${targetText}</div>`:''}<section class="bottom">${guide}<div class="hint panel">${hint}</div>${dialogue?`<div class="dialogue panel">${dialogue}</div>`:''}<div class="controls panel">${g.beat==='ending'?'Presentazione finale · Invio: salta · Esc: pausa':'WASD: muovi · Destro: mira al+ · Clic: tira · Spazio: schiva · E: usa · H: aiuto · Esc: pausa'}</div>${g.beat==='ending'?this.elapsed<8?'<button data-action="skip-ending">Salta finale</button>':'<button data-action="replay">Nuova avventura</button>':''}</section>`;
    if(html!==g.lastHUD){g.hud.innerHTML=html;g.lastHUD=html;}
  }
  state(){return {...this.boss.state(this.game.time),...this.fields(),completed:this.coreReturned&&this.portalClosed&&this.elapsed>=8,endingStarted:this.endingStarted,endingElapsed:this.game.beat==='ending'?this.elapsed:null,portalClosed:this.portalClosed,visual:this.visual.metadata()};}
  seedPose(phase:BossPhase,time:number):void {this.boss.reviewPose(phase,time);}
  prepareEndingReview():void {this.endingStarted=0;this.scarfAnnounced=this.closedAnnounced=false;this.setStory('battle',0);this.setStory('ending',0);}
  dispose():void {this.visual.dispose();}
}
