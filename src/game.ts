import * as THREE from 'three';
import type { ActDefinition, ActId, Beat, CourtyardWorld } from './contracts';
import { cast, createCharacter } from './characters';
import { acts, getAct, levels, scenarios, systemDefinitions } from './registries';
import type { Enemy, GameplaySystem, SystemContext } from './gameplay/types';
import { toyMaterial } from './visual/style';
import { createGameAudio } from './audio';
import { Input } from './input';
import { dialogueLines, type DialogueId } from './texts';
import { blocked, clamp, distance, lineClear, move, nextWaypoint, segmentBox, type Point } from './engine/math';
import { clearCheckpoint, emptyCheckpoint, readCheckpoint, readSettings, storageNotice, writeCheckpoint, writeSettings, type Checkpoint } from './storage';

interface Gift { root: THREE.Group; active: boolean; age: number; from: THREE.Vector3; to: THREE.Vector3; previous: THREE.Vector3; ring: THREE.Mesh; blast: number }
const PALETTE = { red:'#e94750',green:'#7cbf56',purple:'#7062b8',snow:'#e1eff5',cream:'#fff0d5',skin:'#f4ba93',ink:'#202d42',gold:'#f8be55',roof:'#596a9b',timber:'#987562',mint:'#a4f8d9',sack:'#9b6547',cabin:'#a5585b',sky:'#182c49' };
const toy = toyMaterial;
const boxGeometry = new THREE.BoxGeometry(1,1,1);
const parcelMaterial=toy(PALETTE.purple), ribbonMaterial=toy(PALETTE.gold);
function parcel():THREE.Group {
  const group=new THREE.Group();
  for(const [x,y,z,material] of [[.54,.44,.42,parcelMaterial],[.09,.46,.44,ribbonMaterial],[.56,.46,.08,ribbonMaterial]] as const){const m=new THREE.Mesh(boxGeometry,material);m.scale.set(x,y,z);group.add(m);}return group;
}
const sectorGeometry = new THREE.CircleGeometry(2.68,24, -Math.PI/2-38*Math.PI/180,76*Math.PI/180);
sectorGeometry.rotateX(-Math.PI/2);
const sectorMaterial = new THREE.MeshBasicMaterial({color:PALETTE.gold,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false});
const ringGeometry = new THREE.RingGeometry(.96,1,40); ringGeometry.rotateX(-Math.PI/2);
const goldMaterial = new THREE.MeshBasicMaterial({color:PALETTE.gold,side:THREE.DoubleSide});
const mintMaterial = new THREE.MeshBasicMaterial({color:PALETTE.mint,side:THREE.DoubleSide});

export class Game {
  readonly scene = new THREE.Scene();
  readonly camera3 = new THREE.PerspectiveCamera(53,1,.1,100);
  readonly renderer = new THREE.WebGLRenderer({antialias:true,alpha:false});
  world: CourtyardWorld;
  act:ActDefinition=getAct('courtyard');
  readonly santa = createCharacter('santa');
  readonly drone = createCharacter('drone');
  readonly audio = createGameAudio();
  readonly input: Input;
  readonly settings=readSettings();
  readonly registry=levels;
  readonly systems:GameplaySystem[]=[];
  readonly player = {x:0,z:9,hp:6,invulnerableUntil:0,dodgeUntil:0,dodgeReady:0,dx:0,dz:-1};
  beat:Beat='intro'; group=0; time=0; poseTime=0; introStart=0;
  checkpoint:Checkpoint=emptyCheckpoint();
  disabledAnchors:string[]=[];clearedArenas:string[]=[];activatedArenas:string[]=[];defeatedEnemies:string[]=[];
  preview=false;lastProgress=0;hintStage=0;helpUntil=0;helpText='';rangedLearned=false;rangedSeen=false;shipDescentAt=0;lastStreetCombat:boolean|null=null;
  enemies:Enemy[]=[]; gifts:Gift[]=[]; eventLog:{time:number;type:string;[key:string]:unknown}[]=[];
  droneHit=false; dodgeUsed=false; healed=false; healAvailable=false;
  firstWrapped=false; firstWrapTime=-Infinity; nextAttack=0; attackSerial=0; enemySerial=0;
  throwReady=0; yaw=0; pitch=.30; view='player'; review=false; reviewScenario='intro'; playing=false; menu:'title'|'pause'|'dead'|'none'='title';
  feedback=''; feedbackUntil=0; dialogue=''; dialogueUntil=0; audioReady=false; audioStarting=false;
  lastFrame=0; moving=false; lastUI=0; storageAvailable=true; lastHUD=''; checkpointSoundAt=Infinity;
  readonly overlay:HTMLDivElement; readonly hud:HTMLDivElement; readonly menuElement:HTMLDivElement; readonly labels:HTMLDivElement;
  readonly healthRing:THREE.Mesh; readonly aimRing:THREE.Mesh; readonly heal:THREE.Mesh; readonly trainingSign:THREE.Mesh;
  readonly lockRing:THREE.Mesh;
  readonly lockLabel:HTMLDivElement; readonly healLabel:HTMLDivElement;
  cameraOverride:{position:THREE.Vector3;look:THREE.Vector3}|null=null;
  readonly santaMaterials:{material:THREE.Material;opacity:number;transparent:boolean;depthWrite:boolean}[]=[];
  trainingCycle=-1;trainingAngle=0;
  readonly transitions:Record<string,unknown>[]=[];
  recordTransition(action:string,data:Record<string,unknown>={}):void {this.transitions.push({action,chapter:this.act.id,boundary:this.checkpoint.boundary,menu:this.menu,hp:this.player.hp,time:this.time,...data});if(this.transitions.length>60)this.transitions.shift();}
  constructor(readonly app:HTMLDivElement) {
    this.scene.background=new THREE.Color(PALETTE.sky);this.scene.fog=new THREE.Fog(PALETTE.sky,24,55);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.domElement.tabIndex=0;this.renderer.domElement.setAttribute('aria-label','Cortile giocabile. WASD, clic sinistro, Spazio, E. Tasto destro trascinato per guardare.');app.append(this.renderer.domElement);
    const level=this.registry.find(l=>l.id==='courtyard');if(!level)throw new Error('Livello courtyard mancante');this.world=level.createWorld(this.scene);
    this.systems=systemDefinitions.map(s=>s.create(this.scene));
    this.scene.add(this.santa.root,this.drone.root);this.drone.root.position.set(-2,0,4);
    // Only Santa's clones become translucent, never shared cast materials.
    this.santa.root.traverse(object=>{if(object instanceof THREE.Mesh){const cloned=(Array.isArray(object.material)?object.material:[object.material]).map(original=>{const material=original.clone();if(!material.transparent)this.santaMaterials.push({material,opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite});return material;});object.material=Array.isArray(object.material)?cloned:cloned[0];}});
    this.healthRing=new THREE.Mesh(ringGeometry,mintMaterial);this.healthRing.scale.setScalar(.66);this.healthRing.position.y=.015;this.scene.add(this.healthRing);
    this.aimRing=new THREE.Mesh(ringGeometry,goldMaterial);this.aimRing.scale.setScalar(2);this.aimRing.position.y=.025;this.scene.add(this.aimRing);
    this.lockRing=new THREE.Mesh(ringGeometry,mintMaterial);this.lockRing.scale.setScalar(.8);this.lockRing.visible=false;this.scene.add(this.lockRing);
    this.heal=new THREE.Mesh(new THREE.OctahedronGeometry(.45),toy(PALETTE.gold));this.heal.position.set(0,.65,-4);this.scene.add(this.heal);
    this.trainingSign=new THREE.Mesh(sectorGeometry,sectorMaterial);this.trainingSign.position.set(-2,.02,4);this.trainingSign.rotation.y=Math.PI;this.scene.add(this.trainingSign);
    for(let i=0;i<5;i++){const root=parcel(),ring=new THREE.Mesh(ringGeometry,goldMaterial);root.visible=ring.visible=false;this.scene.add(root,ring);this.gifts.push({root,ring,active:false,age:0,from:new THREE.Vector3(),to:new THREE.Vector3(),previous:new THREE.Vector3(),blast:-1});}
    this.overlay=document.createElement('div');this.overlay.className='overlay';this.overlay.innerHTML='<div class="hud"></div><div class="labels"></div><div class="reticle" aria-hidden="true">＋</div><div class="menu-layer"></div>';app.append(this.overlay);
    this.hud=this.overlay.querySelector('.hud')!;this.menuElement=this.overlay.querySelector('.menu-layer')!;this.labels=this.overlay.querySelector('.labels')!;
    this.lockLabel=document.createElement('div');this.lockLabel.className='enemy-label target-lock';this.lockLabel.hidden=true;this.labels.append(this.lockLabel);
    this.healLabel=document.createElement('div');this.healLabel.className='enemy-label heal-label';this.healLabel.hidden=true;this.healLabel.textContent='✚ Cura +2';this.labels.append(this.healLabel);
    this.hud.addEventListener('click',event=>{const action=(event.target as HTMLElement).closest<HTMLButtonElement>('button')?.dataset.action;if(action==='skip')this.enterTraining();if(action==='replay')this.startNew();});
    this.input=new Input(this.renderer.domElement);this.input.onGesture=()=>{void this.unlockAudio();};this.input.onPause=()=>this.togglePause();
    document.addEventListener('visibilitychange',()=>{if(document.hidden){if(this.menu==='none')this.openMenu('pause');this.input.clear();this.audio.pause();this.lastFrame=0;}});
    window.addEventListener('resize',()=>this.resize());this.resize();this.reset('training');this.beat='intro';this.menu='title';this.playing=false;this.renderMenu();this.renderNow();this.installDebug();requestAnimationFrame(this.frame);
  }
  log(type:string,data:Record<string,unknown>={}):void {this.eventLog.push({time:Number(this.time.toFixed(3)),type,...data});if(this.eventLog.length>400)this.eventLog.shift();}
  notify(text:string):void {this.feedback=text;this.feedbackUntil=this.time+2.7;}
  say(text:string,seconds=5):void {this.dialogue=text;this.dialogueUntil=this.time+seconds;}
  sayLine(id:DialogueId,seconds=5):void {const [speaker,text]=dialogueLines[id];this.say(`${speaker}: «${text}»`,seconds);this.log('dialogue',{id});}
  async unlockAudio():Promise<void> {if(this.audioStarting)return;this.audioStarting=true;try{this.audio.setVolumes(this.settings);const unlocked=this.audio.unlock();await unlocked;this.audioReady=true;if(this.playing&&this.menu==='none'&&!document.hidden){this.audio.resume();this.audio.music(this.combatMusic()?'music.combat':'music.village');}else this.audio.pause();}catch{this.log('audio-unavailable');}finally{this.audioStarting=false;}}
  effect(id:string):void {if(this.playing&&this.menu==='none')this.audio.effect(id);}
  save(boundary:Checkpoint['boundary']):void {
    this.checkpoint={version:2,chapter:this.act.id,boundary,healed:this.healed,firstWrapped:this.firstWrapped,disabledAnchors:[...this.disabledAnchors],clearedArenas:[...this.clearedArenas],activatedArenas:[...this.activatedArenas],defeatedEnemies:[...this.defeatedEnemies]};
    if(this.review||this.preview)return;this.storageAvailable=writeCheckpoint(this.checkpoint);this.log('checkpoint',{chapter:this.act.id,boundary,persisted:this.storageAvailable});this.checkpointSoundAt=this.time+(boundary==='complete'||boundary==='street-complete'?1.5:.15);if(!this.storageAvailable)this.notify('Salvataggio non disponibile: puoi continuare questa partita.');
  }
  clearActors():void {for(const system of this.systems)system.reset();for(const e of this.enemies){this.scene.remove(e.actor.root,e.sign,e.parcel);e.label.remove();}this.enemies=[];for(const g of this.gifts){g.active=false;g.blast=-1;g.root.visible=g.ring.visible=false;}}
  switchAct(id:ActId):void {if(this.act.id===id)return;this.clearActors();this.scene.remove(this.world.root);const oldLights:THREE.Light[]=[];this.scene.traverse(o=>{if(o instanceof THREE.Light)oldLights.push(o);});for(const light of oldLights)light.removeFromParent();this.act=getAct(id);const level=this.registry.find(l=>l.id===this.act.levelId)!;this.world=level.createWorld(this.scene);this.cameraOverride=null;this.lockLabel.hidden=this.healLabel.hidden=true;this.log('act-enter',{chapter:id});}
  reset(boundary:Checkpoint['boundary'],save?:Checkpoint):void {
    if(boundary==='street'||boundary==='street-complete'){this.restoreStreet(save??emptyCheckpoint('toystreet',boundary));return;}
    this.switchAct('courtyard');this.disabledAnchors=boundary==='complete'?['courtyard']:[];this.clearedArenas=[];this.activatedArenas=[];this.defeatedEnemies=[];this.heal.position.set(0,.65,-4);
    this.clearActors();this.time=this.poseTime=0;this.eventLog=[];this.throwReady=0;this.nextAttack=0;this.firstWrapTime=-Infinity;this.enemySerial=0;this.checkpointSoundAt=Infinity;
    this.droneHit=this.dodgeUsed=boundary!=='training';this.healed=save?.healed??false;this.firstWrapped=save?.firstWrapped??!['training','A'].includes(boundary);
    this.player.x=0;this.player.z=boundary==='training'?9:boundary==='C'||boundary==='anchor'||boundary==='complete'?-4:3;
    this.player.hp=6;this.player.invulnerableUntil=1.25;this.player.dodgeUntil=0;this.player.dodgeReady=0;this.yaw=0;this.pitch=.30;this.view='player';this.cameraOverride=null;this.group=0;this.healAvailable=false;this.santa.root.rotation.y=Math.PI;
    this.beat=boundary==='training'?'training':boundary==='complete'?'complete':boundary==='anchor'?'anchor':'battle';
    this.checkpoint={...emptyCheckpoint('courtyard',boundary),healed:this.healed,firstWrapped:this.firstWrapped,disabledAnchors:[...this.disabledAnchors]};
    if(['A','B','C'].includes(boundary)){this.enemySerial=boundary==='A'?0:boundary==='B'?1:3;this.spawnGroup(boundary==='A'?1:boundary==='B'?2:3,false);}
    if(boundary==='C'&&!this.healed)this.healAvailable=true;this.dialogue='';this.feedback='';this.dialogueUntil=this.feedbackUntil=-Infinity;this.input?.clear();
  }
  startNew():void {this.recordTransition('new-game');this.review=false;this.preview=false;this.storageAvailable=clearCheckpoint();this.reset('training');this.beat='intro';this.introStart=0;this.menu='none';this.playing=true;this.save('training');this.sayLine('vo.squamakk.battery',6);this.renderMenu();void this.unlockAudio();}
  continueGame():void {const s=readCheckpoint();if(!s){this.renderMenu();return;}this.review=false;this.preview=false;this.reset(s.boundary,s);this.storageAvailable=writeCheckpoint(s);this.menu='none';this.playing=true;this.renderMenu();void this.unlockAudio();}
  enterStreet(preview=false):void {this.preview=preview;this.reset('street',emptyCheckpoint('toystreet'));this.menu='none';this.playing=true;this.save('street');this.sayLine('vo.briciola.street',7);this.notify(preview?'Prova M2 · questa partita non sostituisce il salvataggio':'Due ancoraggi: Officina o Giostra, scegli tu');this.renderMenu();void this.unlockAudio();}
  restoreStreet(save:Checkpoint):void {
    this.switchAct('toystreet');this.clearActors();this.time=this.poseTime=0;this.eventLog=[];this.throwReady=this.nextAttack=0;this.checkpointSoundAt=Infinity;this.enemySerial=this.attackSerial=0;this.firstWrapTime=-Infinity;
    this.disabledAnchors=[...save.disabledAnchors];this.clearedArenas=[...save.clearedArenas];this.activatedArenas=[...save.activatedArenas];this.defeatedEnemies=[...save.defeatedEnemies];this.healed=save.healed;this.firstWrapped=save.firstWrapped;this.droneHit=this.dodgeUsed=true;
    Object.assign(this.player,{...this.act.start,hp:6,invulnerableUntil:1.25,dodgeUntil:0,dodgeReady:0,dx:0,dz:-1});this.yaw=0;this.pitch=.5;this.view='player';this.cameraOverride=null;this.group=0;this.moving=false;this.santa.root.rotation.y=Math.PI;
    this.beat=save.boundary==='street-complete'?'street-complete':'street';this.healAvailable=this.clearedArenas.length>0&&!this.healed;this.heal.position.set(0,.65,0);this.checkpoint=structuredClone(save);this.shipDescentAt=this.review?0:-3;
    for(const arena of this.act.arenas)for(const [index,enemy] of arena.enemies.entries())if(!this.clearedArenas.includes(arena.id)&&!this.defeatedEnemies.includes(`${arena.id}:${index}`))this.spawnEnemy(enemy,enemy.kind,`${arena.id}:${index}`,arena.id);
    this.world.setAnchors?.([],0);this.world.setAnchors?.(this.disabledAnchors,this.shipDescentAt);this.dialogue=this.feedback='';this.dialogueUntil=this.feedbackUntil=-Infinity;this.lastProgress=0;this.hintStage=0;this.helpText='';this.helpUntil=0;this.rangedLearned=this.act.arenas.some(arena=>arena.enemies.some((enemy,index)=>enemy.kind==='ranged'&&(this.clearedArenas.includes(arena.id)||this.defeatedEnemies.includes(`${arena.id}:${index}`))));this.rangedSeen=false;this.lastStreetCombat=null;this.input?.clear();
  }
  spawnEnemy(p:Point,kind:'melee'|'ranged',key:string,arenaId?:string):Enemy {
    const actor=createCharacter(kind==='ranged'?'shooter':'alien');actor.root.position.set(p.x,0,p.z);const sign=new THREE.Mesh(sectorGeometry,sectorMaterial);sign.visible=false;const pack=parcel();pack.visible=false;pack.scale.setScalar(2.3);const label=document.createElement('div');label.className='enemy-label';this.labels.append(label);this.scene.add(actor.root,sign,pack);
    const enemy:Enemy={x:p.x,z:p.z,id:++this.enemySerial,key,kind,arenaId,hp:2,actor,status:'approach',since:this.time,angle:0,attackId:0,hit:false,sign,parcel:pack,label};this.enemies.push(enemy);return enemy;
  }
  enterTraining():void {this.beat='training';this.log('beat',{beat:this.beat});this.sayLine('vo.briciola.training');}
  spawnGroup(group:number,persist=true):void {
    this.group=group;this.beat='battle';
    const spawns:Point[][]=[[{x:0,z:-13}],[{x:-9,z:-10},{x:-7,z:-11.5}],[{x:10,z:-11},{x:8,z:-12},{x:0,z:-13}]];
    for(let i=0;i<group;i++) {
      let p={...spawns[group-1][i]};
      if(distance(p,this.player)<4){const alternatives=[{x:-4,z:-12},{x:4,z:-12},{x:0,z:-11}];p=alternatives.find(v=>distance(v,this.player)>=4&&!blocked(v,.42,this.world.obstacles))??p;this.log('spawn-adjusted',{group,x:p.x,z:p.z});}
      this.spawnEnemy(p,'melee',`courtyard:${this.enemySerial+1}`);
    }
    this.log('group-enter',{group});if(persist)this.save(group===1?'A':group===2?'B':'C');this.audio.music('music.combat');this.notify(`G r u p p o ${['A','B','C'][group-1]} · ${group} ${group===1?'difensore':'difensori'} in arrivo`);
  }
  living():Enemy[] {return this.enemies.filter(e=>e.hp>0);}
  remaining():number {return this.act.id==='toystreet'?this.living().length:this.beat==='battle'?this.living().length+(this.group===1?5:this.group===2?3:0):this.beat==='intro'||this.beat==='training'?6:0;}
  anchorCount():number{return this.act.id==='toystreet'?1+this.disabledAnchors.length:this.beat==='complete'?1:0;}
  nearestAnchor(){return this.act.anchors.filter(a=>!this.disabledAnchors.includes(a.id)).sort((a,b)=>distance(this.player,a)-distance(this.player,b))[0];}
  combatMusic():boolean{return this.beat==='battle'||(this.beat==='street'&&this.living().some(e=>this.activeEnemy(e)));}
  activeEnemy(e:Enemy):boolean{return !e.arenaId||this.activatedArenas.includes(e.arenaId);}
  committed():boolean{return this.enemies.some(e=>e.hp>0&&(e.status==='windup'||e.status==='active'))||this.systems.some(s=>s.committed());}
  systemContext():SystemContext{return{scene:this.scene,time:this.time,player:this.player,enemies:this.enemies,obstacles:this.world.obstacles,active:e=>this.activeEnemy(e),visible:p=>this.visible(p),committed:()=>this.committed(),canAttack:()=>this.time>=this.nextAttack,reserveAttack:()=>++this.attackSerial,delayAttack:s=>{this.nextAttack=Math.max(this.nextAttack,this.time+s);},damage:(id,kind)=>this.damage(id,kind),log:(type,data)=>this.log(type,data),effect:id=>this.effect(id),notify:text=>this.notify(text),coverSuccess:()=>{if(!this.rangedLearned){this.rangedLearned=true;this.progress('cover');}}};}
  damage(attackId:number,kind='melee'):void {if(this.time<this.player.invulnerableUntil){this.log('hit-avoided',{attackId,kind});if(kind==='ranged'&&!this.rangedLearned){this.rangedLearned=true;this.progress('shot-avoided');}return;}this.player.hp--;this.player.invulnerableUntil=this.time+1.25;this.effect('sfx.hurt');this.notify('Colpito · −1 salute · protetto 1,25 s');this.log('player-hurt',{hp:this.player.hp,attackId,kind});if(this.player.hp<=0)this.openMenu('dead');}
  progress(reason:string):void {this.lastProgress=this.time;this.hintStage=0;this.helpUntil=0;this.helpText='';this.log('progress',{reason});}
  activateArena(id:string,reason:string):void {if(this.activatedArenas.includes(id))return;this.activatedArenas.push(id);const arena=this.act.arenas.find(a=>a.id===id)!;this.progress('arena-enter');this.log('arena-activated',{id,reason});this.notify(`${arena.name} · ${arena.enemies.length} ${arena.enemies[0]?.kind==='ranged'?'tiratori':'difensori'}`);this.save('street');}
  updateStreet():void {
    if(this.beat==='street-complete')return;
    for(const arena of this.act.arenas){if(!this.clearedArenas.includes(arena.id)&&distance(this.player,arena)<=arena.radius)this.activateArena(arena.id,'proximity');
      if(!this.clearedArenas.includes(arena.id)&&!this.living().some(e=>e.arenaId===arena.id)){if(!this.activatedArenas.includes(arena.id))this.activatedArenas.push(arena.id);this.clearedArenas.push(arena.id);this.healAvailable=!this.healed;this.progress('arena-clear');this.log('arena-clear',{id:arena.id});this.notify(`${arena.name} libera · E al suo ancoraggio`);this.save('street');}
    }
    if(this.living().some(e=>e.kind==='ranged'&&this.visible(e)))this.rangedSeen=true;
    const stalled=this.time-this.lastProgress,stage=stalled>=45?3:stalled>=30?2:stalled>=15?1:0;
    if(stage>this.hintStage){this.hintStage=stage;this.showHelp(stage);}
    const combat=this.combatMusic();if(combat!==this.lastStreetCombat){this.audio.music(combat?'music.combat':'music.village');this.lastStreetCombat=combat;}
  }
  showHelp(stage=1):void {
    if(this.beat==='street-complete'){this.helpText='Tre ancoraggi spenti · Fine del secondo segmento. La piazza non è ancora giocabile.';this.helpUntil=this.time+10;this.log('help',{stage,reason:'m2-complete'});return;}
    const anchor=this.nearestAnchor(),distanceTo=anchor?distance(this.player,anchor).toFixed(1):'0';
    const projected=anchor?new THREE.Vector3(anchor.x,1,anchor.z).project(this.camera3):null,direction=projected?(projected.z>1?'↩ Dietro':projected.x<-.65?'← Sinistra':projected.x>.65?'Destra →':'↑ Avanti'):'';
    this.helpText=this.act.id!=='toystreet'?'Destro: porta il bersaglio al +. Clic quando compare MIRATO. Spazio: schiva.':stage>=3&&this.healAvailable&&this.player.hp<6?'✚ Cura +2 al centro · '+distance(this.player,{x:0,z:0}).toFixed(1)+' m':anchor&&this.clearedArenas.includes(anchor.arenaId??'')?`${anchor.name} libera: raggiungi E · ${distanceTo} m`:stage>=3&&anchor?`Percorso ${direction} · ${anchor.name} · ${distanceTo} m. Aggira il riparo dall'estremità verso il centro.`:stage>=2?'Aggira il riparo dall’estremità verso il corridoio centrale. Destro: ritrova il nemico.':'Due percorsi, scegli tu. Destro: allinea al +. Clic quando è MIRATO; riparo o Spazio contro i tiri.';
    this.helpUntil=this.time+10;this.log('help',{stage,reason:'no-progress',stalled:this.time-this.lastProgress,text:this.helpText});
  }
  objective():string {if(this.act.id==='toystreet'){const anchor=this.nearestAnchor();return this.beat==='street-complete'?'3/3 · La nave è scesa verso la piazza':`${anchor&&this.clearedArenas.includes(anchor.arenaId!)?'Spegni l’ancoraggio pronto: E':'Libera un lato, poi E'} · Ancoraggi ${this.anchorCount()}/3`;}return this.beat==='intro'?'Il nucleo è stato rubato':this.beat==='training'?(!this.droneHit?'Allinea il drone al + centrale e lancia':'Prova la schivata: Spazio'):this.beat==='battle'?`Libera il cortile · ${this.remaining()} ${this.remaining()===1?'difensore':'difensori'}`:this.beat==='anchor'?'Spegni il primo ancoraggio: E':'Ancoraggio 1/3 · Entra nella via';}
  targetPoint():Point {if(this.act.id==='toystreet')return this.nearestAnchor()??this.act.exit;return this.beat==='training'&&!this.droneHit?{x:-2,z:4}:this.beat==='complete'?this.act.exit:this.act.anchors[0];}
  visible(p:Point,height=1):boolean {const v=new THREE.Vector3(p.x,height,p.z).project(this.camera3);if(v.z<=-1||v.z>=1||Math.abs(v.x)>=.9||Math.abs(v.y)>=.85||!lineClear(this.player,p,this.world.obstacles))return false;const camera={x:this.camera3.position.x,z:this.camera3.position.z},y=this.camera3.position.y;return !this.world.obstacles.some(o=>{const enter=segmentBox(camera,p,o),reverse=segmentBox(p,camera,o);if(enter===null||reverse===null)return false;return Math.min(y+(height-y)*enter,y+(height-y)*(1-reverse))<(o.id.includes('cover')?1.7:5);});}
  aim():{point:THREE.Vector3;enemy:Enemy|null;drone:boolean} {
    const dir=new THREE.Vector3();this.camera3.getWorldDirection(dir);const ray=new THREE.Ray(this.camera3.position,dir);const hit=new THREE.Vector3();ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-1),hit);
    if(!Number.isFinite(hit.x)||distance(this.player,{x:hit.x,z:hit.z})>14||distance(this.player,{x:hit.x,z:hit.z})<1)hit.set(this.player.x-Math.sin(this.yaw)*9,1,this.player.z-Math.cos(this.yaw)*9);
    const d=distance(this.player,hit);if(d>12){hit.x=this.player.x+(hit.x-this.player.x)*12/d;hit.z=this.player.z+(hit.z-this.player.z)*12/d;}
    let enemy:Enemy|null=null,drone=false,best=this.settings.aimAssist?.5:.12;
    {const candidates: {p:Point;enemy:Enemy|null;drone:boolean}[]=this.living().map(e=>({p:e,enemy:e,drone:false}));if(!this.droneHit&&this.beat==='training')candidates.push({p:{x:-2,z:4},enemy:null,drone:true});
      for(const c of candidates){if(distance(this.player,c.p)>12||!this.visible(c.p))continue;const v=new THREE.Vector3(c.p.x,1,c.p.z).project(this.camera3);const score=Math.hypot(v.x,v.y*.7);if(score<best){best=score;enemy=c.enemy;drone=c.drone;if(this.settings.aimAssist)hit.set(c.p.x,1,c.p.z);}}
    }
    return {point:hit,enemy,drone};
  }
  throwGift():void {
    if(this.time<this.throwReady){this.notify(`Regalo in preparazione · ${(this.throwReady-this.time).toFixed(1)} s`);return;}
    const g=this.gifts.find(g=>!g.active&&g.blast<0);if(!g){this.notify('I pacchi sono in volo: riprova fra un istante.');return;}
    const aim=this.aim();g.active=true;g.age=0;g.from.set(this.player.x,1.3,this.player.z);g.to.copy(aim.point);g.to.y=0;g.previous.copy(g.from);g.root.position.copy(g.from);g.root.visible=true;this.throwReady=this.time+.55;
    this.santa.root.rotation.y=Math.atan2(aim.point.x-this.player.x,aim.point.z-this.player.z);this.effect('sfx.throw');this.log('throw',{target:aim.enemy?.id??(aim.drone?'drone':'ground'),x:g.to.x,z:g.to.z});
    this.notify(aim.enemy?`Bersaglio: rettiliano · ${aim.enemy.hp}/2`:aim.drone?'Bersaglio: drone':'Regalo lanciato · area 2 m');
  }
  explode(g:Gift):void {
    g.active=false;g.root.visible=false;g.blast=0;g.ring.position.set(g.root.position.x,.035,g.root.position.z);g.ring.visible=true;
    const p={x:g.root.position.x,z:g.root.position.z};let hits=0;
    if(this.beat==='training'&&!this.droneHit&&distance(p,{x:-2,z:4})<=2&&lineClear(p,{x:-2,z:4},this.world.obstacles)){this.droneHit=true;this.log('drone-hit');this.notify('Drone disattivato · 1/1');this.effect('sfx.wrap');hits++;}
    for(const e of this.living())if(distance(p,e)<=2&&lineClear(p,e,this.world.obstacles)){
      if(e.arenaId)this.activateArena(e.arenaId,'gift-hit');e.hp--;hits++;this.progress('gift-hit');this.log('enemy-hit',{id:e.id,key:e.key,hp:e.hp});if(e.hp===0)this.wrap(e);else{if(e.status!=='recovery'){e.status='stunned';e.since=this.time;}e.sign.visible=false;this.nextAttack=Math.max(this.nextAttack,this.time+.6);this.notify('Colpito · 1 tacca rimasta');}
    }
    this.log('explosion',{x:p.x,z:p.z,radius:2,hits});if(!hits)this.notify('Il regalo va al + centrale, non al mouse. Gira con il destro e avvicinati (12 m).');
  }
  wrap(e:Enemy):void {e.status='wrapped';e.since=this.time;e.sign.visible=false;e.parcel.visible=true;this.effect('sfx.wrap');this.log('wrap',{id:e.id,key:e.key});if(!this.firstWrapped){this.firstWrapped=true;this.firstWrapTime=this.time;this.nextAttack=Math.max(this.nextAttack,this.time+1.4);this.sayLine('vo.santa.wrapped');}if(e.arenaId){if(!this.defeatedEnemies.includes(e.key))this.defeatedEnemies.push(e.key);if(e.kind==='ranged')this.rangedLearned=true;this.progress('wrapped');this.save('street');}}
  dodge():void {if(this.time<this.player.dodgeReady){this.notify(`Schivata in recupero · ${(this.player.dodgeReady-this.time).toFixed(1)} s`);return;}
    const v=this.moveDirection();if(Math.hypot(v.x,v.z)<.1){v.x=-Math.sin(this.yaw);v.z=-Math.cos(this.yaw);}this.player.dx=v.x;this.player.dz=v.z;this.player.dodgeUntil=this.time+.35;this.player.dodgeReady=this.time+1.35;this.player.invulnerableUntil=Math.max(this.player.invulnerableUntil,this.time+.35);this.dodgeUsed=true;this.effect('sfx.dodge');this.log('dodge');this.notify('Schivata · protetto');}
  moveDirection():Point {const f=Number(this.input.keys.has('KeyW'))-Number(this.input.keys.has('KeyS')),s=Number(this.input.keys.has('KeyD'))-Number(this.input.keys.has('KeyA'));const length=Math.hypot(f,s)||1;return{x:(-Math.sin(this.yaw)*f+Math.cos(this.yaw)*s)/length,z:(-Math.cos(this.yaw)*f-Math.sin(this.yaw)*s)/length};}
  interactStreet():void {
    if(this.beat==='street-complete'){this.notify('Tre ancoraggi spenti · Fine del secondo segmento. La piazza non è ancora giocabile.');this.log('interact-denied',{reason:'end-m2'});return;}
    const closest=[...this.act.anchors].sort((a,b)=>distance(this.player,a)-distance(this.player,b))[0];
    if(this.disabledAnchors.includes(closest.id)&&distance(this.player,closest)<=2.2){this.notify(`${closest.name}: già spento · ${this.anchorCount()}/3 ancoraggi`);return;}
    const anchor=this.nearestAnchor()!;const dist=distance(this.player,anchor);
    if(dist>2.2||!lineClear(this.player,anchor,this.world.obstacles)){this.notify(`${anchor.name} · ${dist.toFixed(1)} m: avvicinati entro 2,2 m`);this.log('interact-denied',{id:anchor.id,reason:'out-of-range',distance:dist});return;}
    const guards=this.living().filter(e=>e.arenaId===anchor.arenaId).length;
    if(!this.clearedArenas.includes(anchor.arenaId!)){this.notify(`${anchor.name} protetto · ${guards} difensori locali`);this.log('interact-denied',{id:anchor.id,reason:'protected',guards});return;}
    this.disabledAnchors.push(anchor.id);this.progress('anchor-off');this.effect('sfx.anchor');this.log('anchor-off',{id:anchor.id,anchors:this.anchorCount()});
    if(this.disabledAnchors.length===2){this.beat='street-complete';this.shipDescentAt=this.time;this.sayLine('vo.briciola.square',8);this.notify('3/3 · Nave verso la piazza · Fine del secondo segmento');this.audio.music('music.village');}else{this.sayLine('vo.squamakk.gifts',5);this.notify(`${anchor.name} spento · Ancoraggi 2/3`);}
    this.world.setAnchors?.(this.disabledAnchors,this.shipDescentAt);this.save(this.beat==='street-complete'?'street-complete':'street');
  }
  interact():void {if(this.act.id==='toystreet'){this.interactStreet();return;}const dist=distance(this.player,this.act.anchors[0]);if(this.beat==='complete'){const gateDistance=distance(this.player,this.act.exit);if(gateDistance<=2.2&&lineClear(this.player,this.act.exit,this.world.obstacles))this.enterStreet();else{this.notify(`Entra nella via · cancello a ${gateDistance.toFixed(1)} m · E entro 2,2 m`);this.log('interact-denied',{reason:'gate-out-of-range',distance:gateDistance});}return;}if(this.beat!=='anchor'){this.notify(`Ancoraggio protetto · ${this.remaining()} difensori da impacchettare`);this.log('interact-denied',{reason:'protected'});return;}if(dist>2.2||!lineClear(this.player,this.act.anchors[0],this.world.obstacles)){this.notify(`Ancoraggio a ${dist.toFixed(1)} m · avvicinati a meno di 2,2 m`);this.log('interact-denied',{reason:'out-of-range',distance:dist});return;}
    this.beat='complete';this.disabledAnchors=['courtyard'];this.effect('sfx.anchor');this.save('complete');this.log('anchor-off',{anchors:1});this.sayLine('vo.briciola.route',8);this.notify('Ancoraggio disattivato · 1/3 · checkpoint');this.audio.music('music.village');
  }
  update(dt:number):void {
    this.time+=dt;this.poseTime=this.time;if(this.time>=this.checkpointSoundAt){this.effect('sfx.checkpoint');this.checkpointSoundAt=Infinity;}
    const orbitChanged=this.input.dx!==0||this.input.dy!==0;this.yaw-=this.input.dx*.004;this.pitch=clamp(this.pitch+this.input.dy*.002,.08,.65);this.input.dx=this.input.dy=0;if(orbitChanged)this.updateCamera();
    if(this.input.consume('KeyH'))this.showHelp(this.hintStage||1);
    if(this.beat==='intro') {if(this.input.consume('Enter')||this.input.consume('Space')||this.time-this.introStart>=18)this.enterTraining();else if(this.time>11){if(!this.eventLog.some(event=>event.type==='dialogue'&&event.id==='vo.santa.coal'))this.sayLine('vo.santa.coal',7);}else if(this.time>6){if(!this.eventLog.some(event=>event.type==='dialogue'&&event.id==='vo.briciola.theft.short'))this.sayLine('vo.briciola.theft.short',5);}}
    if(this.beat!=='intro') {
      if(this.input.consume('Space'))this.dodge();if(this.input.consume('KeyE'))this.interact();if(this.input.throwRequested){this.input.throwRequested=false;this.throwGift();}
      const v=this.moveDirection();const dodging=this.time<this.player.dodgeUntil;this.moving=dodging||Math.hypot(v.x,v.z)>.1;
      const dx=dodging?this.player.dx*2.6/.35:v.x*4.3,dz=dodging?this.player.dz*2.6/.35:v.z*4.3;
      move(this.player,dx*dt,dz*dt,.48,this.world.obstacles);if(this.moving)this.santa.root.rotation.y=Math.atan2(dx,dz);
    }
    for(const g of this.gifts){if(g.active){g.age+=dt;const t=clamp(g.age/.85,0,1);g.root.position.lerpVectors(g.from,g.to,t);if(t<.65){const u=t/.65;g.root.position.y=1.3*(1-u)+Math.sin(Math.PI*u)*1.2;}else{const u=(t-.65)/.35;g.root.position.y=Math.sin(Math.PI*u)*.5;}
      g.root.rotation.set(t*5,t*7,0);const p={x:g.root.position.x,z:g.root.position.z};if(!lineClear(g.previous,p,this.world.obstacles,.12)){g.root.position.copy(g.previous);this.explode(g);}else if(t>=1||this.living().some(e=>distance(e,p)<.65&&g.root.position.y<1.7)||(!this.droneHit&&this.beat==='training'&&distance(p,{x:-2,z:4})<.6&&g.root.position.y<1.8))this.explode(g);g.previous.copy(g.root.position);
      }else if(g.blast>=0){g.blast+=dt;g.ring.scale.setScalar(2);if(g.blast>.25){g.blast=-1;g.ring.visible=false;}}
    }
    if(this.beat==='training'&&this.droneHit&&this.dodgeUsed){this.sayLine('vo.briciola.anchors');this.spawnGroup(1);}
    if(this.act.id==='toystreet')this.updateStreet();
    this.updateEnemies(dt);for(const system of this.systems)system.update(this.systemContext(),dt);this.separateBodies();
    if(this.menu==='dead')return;
    if(this.beat==='battle'&&!this.living().length){if(this.group===1)this.spawnGroup(2);else if(this.group===2){this.healAvailable=!this.healed;this.spawnGroup(3);if(this.healAvailable)this.sayLine('vo.briciola.heal');}else{this.beat='anchor';this.save('anchor');this.sayLine('vo.briciola.clear');this.log('beat',{beat:'anchor'});}}
    if(this.healAvailable&&this.player.hp<6&&distance(this.player,{x:0,z:this.act.id==='toystreet'?0:-4})<1.1){this.player.hp=Math.min(6,this.player.hp+2);this.healed=true;this.healAvailable=false;this.effect('sfx.heal');this.notify('Campanello raccolto · +2 salute');this.log('heal',{hp:this.player.hp});this.progress('heal');if(this.act.id==='toystreet')this.save(this.beat==='street-complete'?'street-complete':'street');else if(this.beat==='battle')this.save('C');}
  }
  updateEnemies(dt:number):void {
    let committed=this.committed();
    for(const e of this.enemies){const age=this.time-e.since;
      if(e.status==='wrapped'){if(age>(e.id===1?1.4:1)){e.status='gone';this.log('teleport',{id:e.id});}continue;}if(e.status==='gone')continue;
      if(!this.activeEnemy(e))continue;
      if(e.status==='stunned'){if(age>=.35)e.status='approach';continue;}
      if(e.status==='recovery'){if(age>=1.2){e.status='approach';this.log('recovery-end',{id:e.id,elapsed:age});}continue;}
      if(e.kind==='ranged')continue;
      const d=distance(e,this.player);
      if(e.status==='windup'){
        if(age<.2)e.angle=Math.atan2(this.player.x-e.x,this.player.z-e.z);
        if(age>=.2&&e.lockAt===undefined){e.lockAt=this.time;this.log('attack-lock',{id:e.id,attackId:e.attackId,angle:e.angle});}
        if(age>=1){e.status='active';e.since=this.time;this.log('attack-active',{id:e.id,attackId:e.attackId,windup:age,angle:e.angle});}continue;
      }
      if(e.status==='active'){
        const direction=Math.atan2(this.player.x-e.x,this.player.z-e.z),diff=Math.atan2(Math.sin(direction-e.angle),Math.cos(direction-e.angle));
        if(!e.hit&&d<=2.68&&Math.abs(diff)<=25*Math.PI/180&&lineClear(e,this.player,this.world.obstacles)){
          e.hit=true;this.damage(e.attackId);if(this.menu==='dead')return;
        }
        if(age>=.2){e.status='recovery';e.since=this.time;this.nextAttack=this.time+.6;this.log('attack-recovery',{id:e.id,attackId:e.attackId});}continue;
      }
      if(!committed&&this.time>=this.nextAttack&&d<=2.6&&this.visible(e)&&lineClear(e,this.player,this.world.obstacles,.1)){
        e.status='windup';e.since=this.time;e.angle=Math.atan2(this.player.x-e.x,this.player.z-e.z);e.attackId=++this.attackSerial;e.lockAt=undefined;e.hit=false;committed=true;this.effect('sfx.alien');this.log('attack-windup',{id:e.id,attackId:e.attackId});continue;
      }
      // Staggered flank positions prevent the waiting soldiers from pinning the player.
      let goal:Point=this.player;
      if(committed&&d<4.5)goal={x:this.player.x+Math.cos(e.id*2.4)*3.5,z:this.player.z+Math.sin(e.id*2.4)*3.5};
      if(this.act.id==='courtyard'&&this.group===3&&e.id===6&&d>7&&e.hp===2)goal={x:3,z:-9};
      const waypoint=nextWaypoint(e,goal,this.world.obstacles);let dx=waypoint.x-e.x,dz=waypoint.z-e.z;const len=Math.hypot(dx,dz);
      if(len>.15&&(!committed||d>2.6)){dx/=len;dz/=len;for(const other of this.living())if(other!==e&&distance(e,other)<1.15){dx+=(e.x-other.x)*1.4;dz+=(e.z-other.z)*1.4;}const n=Math.hypot(dx,dz)||1;move(e,dx/n*(this.group===1?1.8:2.4)*dt,dz/n*(this.group===1?1.8:2.4)*dt,.42,this.world.obstacles);e.angle=Math.atan2(dx,dz);}
    }
  }
  separateBodies():void {
    for(const e of this.living()){
      const d=distance(e,this.player);if(d>=.9)continue;
      const nx=d>1e-6?(this.player.x-e.x)/d:Math.sin(e.angle),nz=d>1e-6?(this.player.z-e.z)/d:Math.cos(e.angle);
      move(this.player,nx*(.9-d),nz*(.9-d),.48,this.world.obstacles);
      // Never move a committed telegraph to resolve contact. Waiting bodies can yield.
      const remaining=.9-distance(e,this.player);if(remaining>0&&e.status==='approach')move(e,-nx*remaining,-nz*remaining,.42,this.world.obstacles);
    }
  }
  pose():void {
    this.santa.root.position.set(this.player.x,0,this.player.z);this.santa.update(this.settings.reducedMotion?0:this.poseTime,this.moving,this.time-this.throwReady>-.55&&this.time<this.throwReady-.2);this.updateCamera();
    this.drone.root.visible=this.act.id==='courtyard';this.drone.root.scale.setScalar(this.droneHit?.65:1);this.drone.update(this.settings.reducedMotion?0:this.poseTime,false,false);
    this.healthRing.position.set(this.player.x,.015,this.player.z);this.healthRing.visible=this.time<this.player.invulnerableUntil;
    this.heal.visible=this.healAvailable&&this.player.hp<6;this.heal.rotation.y=this.settings.reducedMotion?0:this.poseTime;
    const trainingPhase=((this.poseTime%2.8)+2.8)%2.8,cycle=Math.floor(this.poseTime/2.8);
    if(this.review||cycle!==this.trainingCycle||trainingPhase<.2){this.trainingAngle=Math.atan2(this.player.x+2,this.player.z-4);this.trainingCycle=cycle;}
    this.trainingSign.visible=this.beat==='training'&&!this.dodgeUsed&&trainingPhase<1.2;this.trainingSign.rotation.y=this.trainingAngle;this.trainingSign.scale.setScalar(1);
    for(const e of this.enemies){const age=this.time-e.since;e.actor.root.position.set(e.x,0,e.z);e.actor.root.rotation.y=e.angle;e.actor.root.scale.setScalar(1);e.actor.root.visible=e.status!=='gone';e.actor.update(this.settings.reducedMotion?0:this.poseTime,e.status==='approach',e.status==='windup'||e.status==='active');
      e.sign.position.set(e.x,.025,e.z);e.sign.rotation.y=e.angle;e.sign.visible=e.kind==='melee'&&(e.status==='windup'||e.status==='active');
      e.parcel.position.set(e.x,.75,e.z);e.parcel.rotation.y=0;e.parcel.visible=e.status==='wrapped';
      if(e.status==='wrapped'){const shrink=age>.9?clamp(1-(age-.9)/.5,0,1):1;e.actor.root.scale.setScalar(Math.max(.01,1-Math.min(age/.25,1)*.1)*shrink);e.parcel.scale.setScalar(2.3*shrink*clamp(age/.25,.05,1));if(!this.settings.reducedMotion)e.parcel.rotation.z=Math.sin(age*19)*.09;}
      this.positionLabel(e);
    }
    for(const system of this.systems)system.pose(this.systemContext());
    this.world.update(this.poseTime,this.beat,this.settings.reducedMotion);this.revealWrappedAlien();this.overlay.dataset.view=this.view;this.overlay.dataset.chapter=this.act.id;
    const a=this.aim();this.aimRing.position.set(a.point.x,.025,a.point.z);this.aimRing.visible=this.menu==='none'&&this.beat!=='intro'&&this.beat!=='complete'&&this.beat!=='street-complete';
    const locked=a.enemy??(a.drone?{x:-2,z:4}:null);
    this.lockRing.visible=this.menu==='none'&&locked!==null;
    if(locked){this.lockRing.position.set(locked.x,.04,locked.z);this.projectMarker(this.lockLabel,locked,a.enemy?2.6:2.25,`◎ MIRATO${a.enemy?' '+a.enemy.hp+'/2'+(a.enemy.status==='windup'?' !':''):''}`);if(a.enemy)a.enemy.label.hidden=true;}else this.lockLabel.hidden=true;
    if(this.heal.visible)this.projectMarker(this.healLabel,{x:0,z:this.act.id==='toystreet'?0:-4},1.4,'✚ Cura +2');else this.healLabel.hidden=true;
  }
  projectMarker(label:HTMLDivElement,p:Point,height:number,text:string):void {
    const v=new THREE.Vector3(p.x,height,p.z).project(this.camera3);
    label.hidden=this.menu!=='none'||v.z<=-1||v.z>=1||Math.abs(v.x)>.9||Math.abs(v.y)>.85;
    if(label.hidden)return;label.style.left=`${(v.x*.5+.5)*100}%`;label.style.top=`${(-v.y*.5+.5)*100}%`;label.textContent=text;
  }
  threatHint():string {
    if(this.beat!=='battle'&&this.beat!=='street'&&!this.systems.some(s=>s.committed()))return '';
    if(this.systems.some(s=>s.committed()))return '! Colpo in volo · Spazio di lato o un riparo';
    const target=this.aim().enemy;
    const threat=this.living().filter(enemy=>this.activeEnemy(enemy)&&enemy!==target&&distance(enemy,this.player)<(enemy.kind==='ranged'?12:6)&&lineClear(this.player,enemy,this.world.obstacles)).find(enemy=>{const p=new THREE.Vector3(enemy.x,1,enemy.z).project(this.camera3);return p.z>1||Math.abs(p.x)>.45;});
    if(!threat)return '';
    const dx=threat.x-this.player.x,dz=threat.z-this.player.z;
    const side=Math.cos(this.yaw)*dx-Math.sin(this.yaw)*dz,front=-Math.sin(this.yaw)*dx-Math.cos(this.yaw)*dz;
    return `! ${front<0?'Dietro, ':''}${side<0?'← a sinistra':'a destra →'} · Destro: gira e mira`;
  }
  updateCamera():void {
    const camera=this.camera3;camera.fov=this.view==='face'?32:this.view==='diorama'?38:53;camera.updateProjectionMatrix();
    if(this.cameraOverride){camera.position.copy(this.cameraOverride.position);camera.lookAt(this.cameraOverride.look);return;}
    if(this.view==='diorama'){camera.position.set(23,29,32);camera.lookAt(0,0,-2);return;}
    if(this.view==='face'){const angle=this.santa.root.rotation.y;camera.position.set(this.player.x+Math.sin(angle)*5.5+Math.cos(angle)*.7,2.5,this.player.z+Math.cos(angle)*5.5-Math.sin(angle)*.7);camera.lookAt(this.player.x,1.8,this.player.z);camera.updateMatrixWorld(true);return;}
    const f=new THREE.Vector3(-Math.sin(this.yaw),0,-Math.cos(this.yaw)),right=new THREE.Vector3(Math.cos(this.yaw),0,-Math.sin(this.yaw));
    const pivot=new THREE.Vector3(this.player.x,1.7,this.player.z);const desired=pivot.clone().addScaledVector(f,-8.5).addScaledVector(right,1.65);desired.y=1.7+Math.sin(this.pitch)*8.5;
    // Conservative expanded slabs: shorten the boom before any solid cabin/crate.
    let fraction=1;for(let i=1;i<=60;i++){const u=i/60,p=pivot.clone().lerp(desired,u);if(this.world.obstacles.some(o=>p.x>o.minX-.2&&p.x<o.maxX+.2&&p.z>o.minZ-.2&&p.z<o.maxZ+.2&&p.y<(o.id.includes('cover')?1.7:5))){fraction=Math.max(.08,(i-1)/60);break;}}
    camera.position.copy(pivot).lerp(desired,fraction);const look=pivot.clone().addScaledVector(f,5.2);look.y=1.1;camera.lookAt(look);camera.updateMatrixWorld(true);
  }
  positionLabel(e:Enemy):void {
    const wrapped=e.status==='wrapped',age=this.time-e.since;
    const v=new THREE.Vector3(e.x,wrapped?2.4:2.6,e.z).project(this.camera3);const show=this.menu==='none'&&(e.hp>0||wrapped)&&v.z>-1&&v.z<1&&Math.abs(v.x)<.95&&Math.abs(v.y)<.8;
    e.label.hidden=!show;if(!show)return;e.label.style.left=`${(v.x*.5+.5)*100}%`;e.label.style.top=`${(-v.y*.5+.5)*100}%`;e.label.textContent=wrapped?(age<.9?'Pacco rettiliano':'↑ Spedito alla nave'):`${e.hp===2?'▮▮':'▮·'} ${e.status==='windup'?'!':e.status==='recovery'?'↺':''}`;
  }
  revealWrappedAlien():void {
    // Screen-space overlap: no camera cut and no displaced defeated enemy.
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(const x of [-.75,.75])for(const y of [0,3.05])for(const z of [-.8,.8]){
      const p=new THREE.Vector3(this.player.x+x,y,this.player.z+z).project(this.camera3);
      minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
    }
    const hidden=this.view==='player'&&this.enemies.some(enemy=>{
      if(enemy.status!=='wrapped')return false;
      return [.75,1.6].some(y=>{const p=new THREE.Vector3(enemy.x,y,enemy.z).project(this.camera3);return p.z>-1&&p.z<1&&p.x>=minX&&p.x<=maxX&&p.y>=minY&&p.y<=maxY;});
    });
    for(const base of this.santaMaterials){const transparent=hidden||base.transparent;if(base.material.transparent!==transparent){base.material.transparent=transparent;base.material.needsUpdate=true;}base.material.opacity=hidden?.18:base.opacity;base.material.depthWrite=hidden?false:base.depthWrite;}
  }
  renderHUD():void {
    this.hud.hidden=this.menu==='title';this.overlay.querySelector<HTMLElement>('.reticle')!.hidden=this.menu!=='none'||this.beat==='intro';if(this.menu==='title')return;
    if(this.act.id==='toystreet'){this.renderStreetHUD();return;}
    const t=this.targetPoint(),dist=distance(this.player,t);const v=new THREE.Vector3(t.x,1.3,t.z).project(this.camera3);let arrow=v.z>1?'↩':v.x<-.8?'←':v.x>.8?'→':'↑';
    const aim=this.aim();const target=aim.enemy?`Rettiliano ${aim.enemy.hp}/2`:aim.drone?'Drone 1/1':'Punto mirato';
    let hint=this.beat==='intro'?'Invadono la Terra con il tuo nucleo natalizio. Invio o Spazio: salta.':this.beat==='training'?`${this.droneHit?'✓':'○'} Drone · ${this.dodgeUsed?'✓':'○'} Spazio: schiva. Destro trascinato: porta il drone al +. Poi CLIC quando è MIRATO.`:this.beat==='anchor'?(dist<=2.2?'E · Disattiva ancoraggio':'Avvicinati al dispositivo per premere E'):this.beat==='complete'?(dist<=2.2?'E · Entra nella via':'Raggiungi il cancello a nord · E: Entra nella via'):'! Settore a terra: esci di lato o schiva. Due regali impacchettano un soldato.';
    if(this.time<this.helpUntil)hint=this.helpText;
    const html=`<section class="objective panel"><strong>${this.objective()}</strong><div>${arrow} ${this.beat==='training'&&!this.droneHit?'Drone':this.beat==='complete'?'Via dei giocattoli':'Ancoraggio'} · ${dist.toFixed(1)} m · ${this.beat==='complete'?'1':'0'}/3</div></section><section class="vitals panel"><div aria-label="Salute ${this.player.hp} di 6">Salute ${'▮'.repeat(this.player.hp)}${'▯'.repeat(6-this.player.hp)}</div><div>${this.time<this.player.dodgeReady?'Schivata: '+Math.max(0,this.player.dodgeReady-this.time).toFixed(1)+' s':'Spazio · Schivata pronta'}${this.time<this.player.invulnerableUntil?' · ◇ Protetto':''}</div></section><div class="target panel">${target}${this.throwReady>this.time?' · Regalo in recupero':' · Regali ∞'}</div><section class="bottom"><div class="hint panel">${this.time<this.feedbackUntil?this.feedback:hint}</div>${this.time<this.dialogueUntil?`<div class="dialogue panel">${this.dialogue}</div>`:''}<div class="controls panel">WASD: muovi · Destro trascinato: guarda · Clic: regalo · Spazio: schiva · E: dispositivo · Esc: pausa</div>${this.beat==='intro'?'<button data-action="skip">Salta introduzione</button>':''}${this.beat==='complete'?'<button data-action="replay">Rigioca il cortile</button>':''}</section>`;
    const clearAim='Destro trascinato: mira al + · Clic: tira al +, non al mouse';
    const threat=this.threatHint();
    const destination=this.beat==='training'&&!this.droneHit?'Drone':this.beat==='complete'?'Via dei giocattoli':'Ancoraggio';
    const content=html.replace('Destro trascinato: guarda · Clic: regalo',clearAim).replace(`${arrow} ${destination} ·`,`Percorso ${arrow} ${destination} ·`)+(threat?`<aside class="threat panel">${threat}</aside>`:'');
    if(content!==this.lastHUD){this.hud.innerHTML=content;this.lastHUD=content;}
  }
  renderStreetHUD():void {
    const aim=this.aim(),target=aim.enemy?`${aim.enemy.kind==='ranged'?'Tiratore':'Rettiliano'} ${aim.enemy.hp}/2`:'Punto mirato';
    const rows=this.act.anchors.map(anchor=>{const guards=this.living().filter(e=>e.arenaId===anchor.arenaId).length,disabled=this.disabledAnchors.includes(anchor.id),clear=this.clearedArenas.includes(anchor.arenaId!);const p=new THREE.Vector3(anchor.x,1,anchor.z).project(this.camera3);const arrow=p.z>1?'↩':p.x<-.65?'←':p.x>.65?'→':'↑';return `<div>${disabled?'✓':arrow} ${anchor.name} · ${distance(this.player,anchor).toFixed(1)} m · ${disabled?'spento':clear?'libera: E':guards+(guards===1?' difensore':' difensori')}</div>`;}).join('');
    const anchor=this.nearestAnchor(),near=anchor&&distance(this.player,anchor)<=2.2;
    let hint=this.beat==='street-complete'?'Tre ancoraggi spenti · Fine del secondo segmento. La piazza non è ancora giocabile.':near&&this.clearedArenas.includes(anchor.arenaId!)?`E · Spegni ${anchor.name}`:'Percorso: scegli Officina o Giostra. Regali infiniti; due colpi impacchettano.';
    if(this.time<this.helpUntil)hint=this.helpText;if(this.time<this.feedbackUntil)hint=this.feedback;
    const tutorial=this.rangedSeen&&!this.rangedLearned?'<div class="howto panel">Tiratori: esci dalla linea (Spazio) o usa il trenino come riparo. I regali interrompono la carica.</div>':'';
    const threat=this.threatHint();
    const content=`<section class="objective panel"><strong>${this.objective()}</strong><div class="arena-routes">${rows}</div>${this.preview?'<div>Prova M2 · salvataggio originale invariato</div>':''}</section><section class="vitals panel"><div aria-label="Salute ${this.player.hp} di 6">Salute ${'▮'.repeat(this.player.hp)}${'▯'.repeat(6-this.player.hp)}</div><div>${this.time<this.player.dodgeReady?'Schivata: '+(this.player.dodgeReady-this.time).toFixed(1)+' s':'Spazio · Schivata pronta'}</div></section><div class="target panel">${target} · ${this.throwReady>this.time?'Regalo in recupero':'Regali ∞'}</div><section class="bottom">${tutorial}<div class="hint panel">${hint}</div>${this.time<this.dialogueUntil?`<div class="dialogue panel">${this.dialogue}</div>`:''}<div class="controls panel">WASD: muovi · Destro: mira al + · Clic: tira · Spazio: schiva · E: usa · H: aiuto · Esc: pausa</div></section>${threat?`<aside class="threat panel">${threat}</aside>`:''}`;
    if(content!==this.lastHUD){this.hud.innerHTML=content;this.lastHUD=content;}
  }
  openMenu(menu:'pause'|'dead'|'title'):void {this.recordTransition('open-menu',{nextMenu:menu});this.menu=menu;this.playing=false;this.audio.pause();this.input.clear();this.renderMenu();}
  togglePause():void {if(this.menu==='none')this.openMenu('pause');else if(this.menu==='pause')this.resume();}
  resume():void {this.menu='none';this.playing=true;this.lastFrame=0;this.audio.resume();this.input.clear();this.renderMenu();this.renderer.domElement.focus();}
  retry():void {this.recordTransition('retry');const s={...this.checkpoint};this.reset(s.boundary,s);this.log('retry',{chapter:s.chapter,boundary:s.boundary});this.notify('Si riparte dal checkpoint · salute ripristinata');this.resume();}
  renderMenu():void {
    this.menuElement.hidden=this.menu==='none';if(this.menu==='none'){this.menuElement.innerHTML='';this.renderNow();return;}
    const title=this.menu==='title'?'Operazione<br>Ho Ho UFO':this.menu==='dead'?'Consegna rimandata!':'Pausa';
    this.menuElement.innerHTML=`<section class="menu panel"><div class="eyebrow">BABBO NATALE · CORTILE DEL LABORATORIO</div><h1>${title}</h1><p>${this.menu==='title'?'Il nucleo è nelle mani dei rettiliani.<br>Rispediscili al mittente.':this.menu==='dead'?'Nessun regalo perduto. Riparti dal gruppo corrente.':'Un momento per sistemare il sacco.'}</p><div class="actions">${this.menu==='title'?`<button data-do="new">Nuova partita</button><button data-do="continue" ${readCheckpoint()?'':'disabled'}>Continua</button>`:`${this.menu==='pause'?'<button data-do="resume">Riprendi</button>':''}<button data-do="retry">Ricomincia checkpoint</button><button data-do="title">Titolo</button>`}</div><details><summary>Impostazioni</summary><div class="settings">${(['master','music','effects'] as const).map((key,i)=>`<label>${['Volume generale','Musica','Effetti'][i]} <input aria-label="${['Volume generale','Musica','Effetti'][i]}" type="range" min="0" max="1" step=".05" data-setting="${key}" value="${this.settings[key]}"></label>`).join('')}<label><input type="checkbox" data-setting="reducedMotion" ${this.settings.reducedMotion?'checked':''}> Riduci movimento</label><label><input type="checkbox" data-setting="aimAssist" ${this.settings.aimAssist?'checked':''}> Mira assistita</label></div></details><p class="menu-controls">WASD: muovi · Tasto destro trascinato: guarda<br>Clic sinistro: regalo · Spazio: schiva · E: dispositivo<br>Esc: pausa · Audio e progressi salvati sul dispositivo</p>${!this.storageAvailable?'<p>Salvataggio non disponibile in questo browser.</p>':''}</section>`;
    this.menuElement.querySelector('.eyebrow')!.textContent=`BABBO NATALE · ${this.act.title.toLocaleUpperCase('it')}`;
    if(this.menu==='title')this.menuElement.querySelector('.actions')!.insertAdjacentHTML('beforeend','<button data-do="street-preview">Prova la via dei giocattoli</button>');
    const note=storageNotice();if(note){const message=document.createElement('p');message.textContent=note;this.menuElement.querySelector('.menu')!.append(message);}
    this.menuElement.querySelectorAll<HTMLButtonElement>('button[data-do]').forEach(b=>b.addEventListener('click',event=>{this.recordTransition('menu-action',{button:b.dataset.do,clickDetail:event.detail});switch(b.dataset.do){case'new':this.startNew();break;case'street-preview':this.review=false;this.enterStreet(true);break;case'continue':this.continueGame();break;case'resume':this.resume();break;case'retry':this.retry();break;case'title':this.openMenu('title');break;}}));
    this.menuElement.querySelectorAll<HTMLInputElement>('input[data-setting]').forEach(input=>input.addEventListener('input',()=>{const key=input.dataset.setting;if(key==='reducedMotion'||key==='aimAssist')this.settings[key]=input.checked;else if(key==='master'||key==='music'||key==='effects')this.settings[key]=Number(input.value);this.audio.setVolumes(this.settings);writeSettings(this.settings);this.renderNow();}));
    this.menuElement.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    this.renderNow();
  }
  resize():void {const w=this.app.clientWidth||innerWidth,h=this.app.clientHeight||innerHeight;this.renderer.setSize(w,h);this.camera3.aspect=w/h;this.camera3.updateProjectionMatrix();this.renderNow();}
  renderNow():void {this.pose();this.renderHUD();this.renderer.render(this.scene,this.camera3);}
  frame=(timestamp:number):void=>{
    requestAnimationFrame(this.frame);
    if(!this.playing||this.menu!=='none'||document.hidden){this.lastFrame=0;this.input.endFrame();return;}
    const dt=this.lastFrame?Math.min((timestamp-this.lastFrame)/1000,.05):0;this.lastFrame=timestamp;
    let remaining=dt;while(remaining>0){const step=Math.min(remaining,1/60);this.update(step);remaining-=step;if(!this.playing)break;}
    this.input.endFrame();if(!this.playing)return;this.pose();if(timestamp-this.lastUI>100){this.renderHUD();this.lastUI=timestamp;}this.renderer.render(this.scene,this.camera3);
  };
  state():Record<string,unknown> {return {chapter:this.act.id,act:this.act.id,actTitle:this.act.title,beat:this.beat,group:this.group,player:{...this.player},camera:{yaw:this.yaw,pitch:this.pitch,view:this.view},disabledAnchors:[...this.disabledAnchors],clearedArenas:[...this.clearedArenas],activatedArenas:[...this.activatedArenas],defeatedEnemies:[...this.defeatedEnemies],anchorCount:this.anchorCount(),arenas:this.act.arenas.map(a=>({id:a.id,name:a.name,x:a.x,z:a.z,active:this.activatedArenas.includes(a.id),clear:this.clearedArenas.includes(a.id),remaining:this.living().filter(e=>e.arenaId===a.id).length})),anchors:this.act.anchors.map(a=>({...a,disabled:this.disabledAnchors.includes(a.id)})),bolts:this.systems.flatMap(s=>s.state()),systemConfigs:systemDefinitions.map(s=>({id:s.id,...s.config})),committed:this.enemies.filter(e=>e.hp>0&&(e.status==='windup'||e.status==='active')).length+this.systems.filter(s=>s.committed()).length,lastProgress:this.lastProgress,hintStage:this.hintStage,rangedLearned:this.rangedLearned,droneHit:this.droneHit,dodgeUsed:this.dodgeUsed,remaining:this.remaining(),pending:this.group===1?5:this.group===2?3:0,neutralized:this.act.id==='toystreet'?6-this.living().length:this.beat==='anchor'||this.beat==='complete'?6:(this.group===2?1:this.group===3?3:0)+this.enemies.filter(e=>e.hp===0&&e.id>(this.group===3?3:this.group===2?1:0)).length,healAvailable:this.healAvailable,healed:this.healed,firstWrapped:this.firstWrapped,review:this.review,preview:this.preview,playing:this.playing,time:this.time,enemies:this.enemies.map(e=>({id:e.id,key:e.key,kind:e.kind,arenaId:e.arenaId,x:e.x,z:e.z,hp:e.hp,status:e.status,since:e.since,attackId:e.attackId,angle:e.angle,hit:e.hit})),objective:this.objective(),checkpoint:structuredClone(this.checkpoint),eventLog:[...this.eventLog],storageAvailable:this.storageAvailable};}
  getStats():Record<string,unknown> {let lights=0,shadowLights=0;this.scene.traverse(o=>{if(o instanceof THREE.Light){lights++;if(o.castShadow)shadowLights++;}});return{renderFrame:this.renderer.info.render.frame,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures,lights,shadowLights,postPasses:0,shipHeight:this.world.root.getObjectByName('Nave verso la piazza')?.position.y??null,audio:this.audio.stats()};}
  selfTest():Record<string,unknown> {
    this.renderNow();const s=this.getStats();const checks:{name:string;value:number;limit:number;pass?:boolean}[]=[];
    const add=(name:string,value:number,limit:number)=>checks.push({name,value,limit,pass:Number.isFinite(value)&&value<=limit});
    add('santa feet floor (m)',Math.abs(this.santa.floorError()),.002);for(const e of this.enemies.filter(e=>e.hp>0))add(`alien ${e.id} feet floor (m)`,Math.abs(e.actor.floorError()),.002);
    let handContactsMeasured=0;
    for(const actor of [this.santa,...this.living().map(e=>e.actor)]){
      const measure:unknown=actor.root.userData.measureHandContacts;if(typeof measure!=='function')continue;
      try{const contacts=measure() as {name:string;error:number}[];for(const contact of contacts){add(`${actor.root.name}: ${contact.name} (m)`,Math.abs(contact.error),.001);handContactsMeasured++;}}
      catch{add(`${actor.root.name}: hand contact measurement failed`,1,0);}
    }
    add('player collider penetration',blocked(this.player,.48,this.world.obstacles)?1:0,0);add('enemy collider penetration',this.living().filter(e=>blocked(e,.42,this.world.obstacles)).length,0);add('committed attacks including flying bolts',this.enemies.filter(e=>e.hp>0&&(e.status==='windup'||e.status==='active')).length+this.systems.filter(s=>s.committed()).length,1);
    add('unique level registry',this.registry.length-new Set(this.registry.map(l=>l.id)).size,0);add('level registry contains courtyard',this.registry.some(l=>l.id==='courtyard')?0:1,0);
    const sample={id:'regression-box',minX:2,maxX:4,minZ:-1,maxZ:1};const probe={x:0,z:0};move(probe,12,0,.48,[sample]);add('swept collider regression',probe.x<=1.52?0:1,0);
    add('wall ray regression',lineClear({x:0,z:0},{x:6,z:0},[sample])?1:0,0);
    for(const [name,list] of [['acts',acts],['cast',cast],['systems',systemDefinitions],['scenarios',scenarios]] as const)add(`unique ${name} registry`,list.length-new Set(list.map(i=>i.id)).size,0);
    add('active world lights',Number(s.lights),3);add('maximum live defenders',this.living().length,6);
    if(this.act.id==='toystreet'){add('anchor count matches unique local IDs',Math.abs(this.anchorCount()-(1+new Set(this.disabledAnchors).size)),0);add('disabled anchor without cleared arena',this.disabledAnchors.filter(id=>!this.clearedArenas.includes(this.act.anchors.find(a=>a.id===id)?.arenaId??'missing')).length,0);add('chapter completion agrees with anchors',(this.beat==='street-complete')===(this.disabledAnchors.length===2)?0:1,0);for(const arena of this.act.arenas)for(const enemy of arena.enemies)add(`${arena.id} spawn collider`,blocked(enemy,.42,this.world.obstacles)?1:0,0);}
    for(const system of this.systems)for(const check of system.checks?.()??[])add(check.name,check.value,check.limit);
    add('draw calls',Number(s.drawCalls),150);add('triangles',Number(s.triangles),150000);add('lights',Number(s.lights),6);add('shadow lights',Number(s.shadowLights),2);
    const attacks=this.eventLog.filter(e=>e.type==='attack-active');add('telegraph < 1 s',attacks.filter(e=>Number(e.windup)<.999).length,0);
    add('recovery < 1.2 s',this.eventLog.filter(e=>e.type==='recovery-end'&&Number(e.elapsed)<1.199).length,0);
    const releases=this.eventLog.filter(e=>e.type==='ranged-release');add('observed ranged telegraph < 1.2 s',releases.filter(e=>Number(e.windup)<1.199).length,0);add('observed ranged locked time < .8 s',releases.filter(e=>Number(e.lockedFor)<.799).length,0);
    const hits=this.eventLog.filter(e=>e.type==='player-hurt');add('duplicate damage by attack ID',hits.length-new Set(hits.map(e=>e.attackId)).size,0);
    return {pass:checks.every(c=>c.pass),checks,stats:s,evidence:{meleeReleases:attacks.length,rangedReleases:releases.length,damageEvents:hits.length,handContactsMeasured},notes:['Empty attack logs are NOT timing evidence.','Only cast exposing root.userData.measureHandContacts has measured hand contacts.','Performance is draw/triangle budget, not a laptop FPS claim.']};
  }
  visualMetadata():Record<string,unknown> {const colors=new Set<string>();this.scene.traverse(o=>{if(o instanceof THREE.Mesh){for(const m of (Array.isArray(o.material)?o.material:[o.material]))if('color'in m && m.color instanceof THREE.Color)colors.add('#'+m.color.getHexString(THREE.SRGBColorSpace));}});return{palette:Object.values(PALETTE),materialColors:[...colors],canvasSelector:'canvas',mood:'snowy-evening',postPasses:0};}
  goto(scenario:string):void {
    const preset=scenarios.find(s=>s.id===scenario);if(!preset)throw new Error(`Scena sconosciuta: ${scenario}`);
    this.review=true;this.preview=false;this.reviewScenario=scenario;
    const seed=emptyCheckpoint(preset.chapter,preset.boundary);seed.firstWrapped=!['training','A'].includes(preset.boundary);seed.clearedArenas=[...(preset.cleared??[])];seed.disabledAnchors=[...(preset.disabled??[])];seed.activatedArenas=[...new Set([...(preset.activated??[]),...seed.clearedArenas])];
    this.reset(preset.boundary,seed);this.review=true;this.reviewScenario=scenario;this.menu='none';this.playing=false;this.audio.pause();if(preset.intro)this.beat='intro';
    if(preset.chapter==='toystreet'){
      const arena=this.act.arenas.find(a=>a.id===preset.arena);if(arena){this.player.x=arena.x;this.player.z=arena.z;if(this.clearedArenas.includes(arena.id)){const anchor=this.act.anchors.find(a=>a.arenaId===arena.id)!;this.player.x=anchor.x;this.player.z=anchor.z+2;}}
      if(preset.hp!==undefined)this.player.hp=preset.hp;this.world.setAnchors?.(this.disabledAnchors,0);this.shipDescentAt=0;this.renderMenu();this.renderNow();return;
    }
    if(scenario.startsWith('battle')||scenario==='first-wrap'){const positions=scenario==='battle-b'?[{x:-3,z:-1},{x:2,z:-2}]:scenario==='battle-c'?[{x:3,z:-7},{x:-3,z:-8},{x:0,z:-11}]:[{x:0,z:-1}];this.living().forEach((e,i)=>{e.x=positions[i].x;e.z=positions[i].z;e.angle=Math.atan2(this.player.x-e.x,this.player.z-e.z);});if(scenario==='battle-c')this.player.hp=2;}
    if(preset.firstWrap){const e=this.enemies[0];e.hp=0;this.firstWrapped=false;this.wrap(e);}
    if(scenario==='anchor'||scenario==='complete')this.player.z=-5.5;this.renderMenu();this.renderNow();
  }
  seek(t:number):void {if(!Number.isFinite(t))throw new Error('Tempo non valido');this.playing=false;this.audio.pause();this.poseTime=Math.max(0,t);if(this.review){this.time=Math.max(0,t);if(this.reviewScenario==='first-wrap'){const e=this.enemies[0];e.status=t>=1.4?'gone':'wrapped';e.since=0;}}this.renderNow();}
  installDebug():void {
    const debug={ready:true,duration:6,views:['player','diorama','face'],setView:(name:string)=>{if(!['player','diorama','face'].includes(name))throw new Error('Vista sconosciuta');this.view=name;this.cameraOverride=null;this.renderNow();},seek:(t:number)=>this.seek(t),play:()=>{this.menu='none';this.playing=true;this.lastFrame=0;this.renderMenu();},pause:()=>{this.playing=false;this.audio.pause();this.input.clear();},renderNow:()=>this.renderNow(),getStats:()=>this.getStats(),selfTest:()=>this.selfTest(),goto:(s:string)=>this.goto(s),camera:(p:number[]|Point,l:number[]|Point)=>{const vector=(v:number[]|Point)=>Array.isArray(v)?new THREE.Vector3(v[0],v[1],v[2]):new THREE.Vector3(v.x,2,v.z);this.cameraOverride={position:vector(p),look:vector(l)};this.renderNow();},state:()=>({...this.state(),transitions:[...this.transitions]}),visualMetadata:()=>this.visualMetadata()};
    (window as unknown as {LC:typeof debug}).LC=debug;
  }
}
