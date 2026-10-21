import * as THREE from 'three';
import type { VisualActor } from '../contracts';
import { cast } from '../characters';
import { squareLayout as layout } from '../acts/square';
import { toyMaterial } from '../visual/style';
import type { Point } from '../engine/math';
import { bossConfig, type BossBattle } from './boss';

type P={x:number;z:number};
function hull(points:P[]):P[]{const sorted=points.sort((a,b)=>a.x-b.x||a.z-b.z),cross=(a:P,b:P,c:P)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);const lower:P[]=[],upper:P[]=[];for(const p of sorted){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p);}for(const p of [...sorted].reverse()){while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p);}return lower.slice(0,-1).concat(upper.slice(0,-1));}
/** Circumscribed buffer, including arc discretization margin, contains the .48m hurt-body expansion. */
function sectorOutline():P[]{const base:P[]=[{x:0,z:0}];for(let i=0;i<=32;i++){const a=-bossConfig.halfAngle+i/32*bossConfig.halfAngle*2;base.push({x:Math.sin(a)*bossConfig.range,z:Math.cos(a)*bossConfig.range});}const points:P[]=[],radius=(bossConfig.bodyRadius+.002)/Math.cos(Math.PI/16);for(const p of base)for(let i=0;i<16;i++){const a=(i+.5)/16*Math.PI*2;points.push({x:p.x+Math.sin(a)*radius,z:p.z+Math.cos(a)*radius});}return hull(points);}
function polygon(points:P[]):THREE.BufferGeometry {const data:number[]=[];for(let i=1;i<points.length-1;i++)for(const p of [points[0],points[i],points[i+1]])data.push(p.x,0,p.z);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(data,3));return geometry;}
const outline=sectorOutline(),sectorGeometry=polygon(outline),borderGeometry=new THREE.BufferGeometry().setFromPoints([...outline,outline[0]].map(p=>new THREE.Vector3(p.x,.004,p.z)));
const parcelSize={width:1.6,height:1.15,depth:1.25},clothSize={width:.42,thickness:.055,length:.55,tail:.76};
const box=new THREE.BoxGeometry(1,1,1),purple=toyMaterial('#7062b8'),gold=toyMaterial('#f8be55'),red=toyMaterial('#e94750');
function cube(parent:THREE.Group,material:THREE.Material,size:[number,number,number],position:[number,number,number]):THREE.Mesh {const mesh=new THREE.Mesh(box,material);mesh.scale.set(...size);mesh.position.set(...position);parent.add(mesh);return mesh;}

export class BossVisual {
  readonly root=new THREE.Group();readonly rig=new THREE.Group();readonly pack=new THREE.Group();readonly scarf=new THREE.Group();readonly core=new THREE.Group();readonly signal=new THREE.Group();
  readonly actor:VisualActor;readonly fallback:boolean;readonly body:THREE.Mesh;readonly scarfTop:THREE.Mesh;readonly scarfFront:THREE.Mesh;
  readonly charge=new THREE.Mesh(new THREE.SphereGeometry(.15,12,8),toyMaterial('#a4f8d9',{emissive:'#46c9b2',emissiveIntensity:.4}));
  readonly signalMaterial=new THREE.MeshBasicMaterial({color:'#a4f8d9',transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false});
  onShip=false;scarfVisible=false;
  depositFrom:THREE.Vector3|null=null;
  constructor(readonly scene:THREE.Scene){
    const factory=cast.find(c=>c.id==='squamakk')??cast.find(c=>c.id==='alien')!;this.fallback=factory.id!=='squamakk';this.actor=factory.create();
    this.root.name='Gameplay di Squamakk';this.rig.name='Squamakk impacchettabile';this.pack.name='Pacco di Squamakk';this.scarf.name='Sciarpa regalo di Babbo Natale';this.root.add(this.rig,this.core,this.signal);this.rig.add(this.actor.root,this.pack);this.pack.add(this.scarf);this.scene.add(this.root);
    this.body=cube(this.pack,purple,[parcelSize.width,parcelSize.height,parcelSize.depth],[0,parcelSize.height/2,0]);
    cube(this.pack,gold,[.12,parcelSize.height+.012,parcelSize.depth+.014],[0,parcelSize.height/2,0]);cube(this.pack,gold,[parcelSize.width+.014,parcelSize.height+.012,.12],[0,parcelSize.height/2,0]);
    this.scarfTop=cube(this.scarf,red,[clothSize.width,clothSize.thickness,clothSize.length],[.35,parcelSize.height+clothSize.thickness/2,.405]);
    this.scarfFront=cube(this.scarf,red,[clothSize.width,clothSize.tail,clothSize.thickness],[.35,parcelSize.height+clothSize.thickness/2-clothSize.tail/2,parcelSize.depth/2+clothSize.thickness/2]);
    for(const x of [.22,.35,.48])cube(this.scarf,gold,[.045,.12,.035],[x,parcelSize.height-clothSize.tail+.065,parcelSize.depth/2+clothSize.thickness+.0175]);
    this.core.name='Nucleo natalizio sicuro';this.core.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.28,1),gold));
    for(const a of [0,Math.PI/2]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.37,.035,6,24),toyMaterial('#a4f8d9'));ring.rotation.y=a;this.core.add(ring);}
    const fill=new THREE.Mesh(sectorGeometry,this.signalMaterial),border=new THREE.Line(new THREE.BufferGeometry().copy(borderGeometry),new THREE.LineBasicMaterial({color:'#202d42'}));this.signal.add(fill,border);
    const arrow=polygon([{x:-.35,z:bossConfig.range-1.2},{x:0,z:bossConfig.range-.4},{x:.35,z:bossConfig.range-1.2}]);const tip=new THREE.Mesh(arrow,new THREE.MeshBasicMaterial({color:'#fff0d5',side:THREE.DoubleSide}));tip.position.y=.008;this.signal.add(tip);
    this.signal.position.set(layout.boss.x,.025,layout.boss.z);this.actor.root.add(this.charge);this.signal.visible=this.pack.visible=this.scarf.visible=false;
    this.scarf.userData.measureScarfContacts=()=>this.measureScarfContacts();
  }
  private place(onShip:boolean):void {
    const ship=this.scene.getObjectByName('Nave di Squamakk');
    if(onShip&&ship){if(this.rig.parent!==ship)ship.add(this.rig);const support=ship.userData.parcelSupport as {center?:{x:number;y:number;z:number}}|undefined;const p=support?.center;this.rig.position.set(p?.x??0,p?.y??.4,p?.z??.8);this.rig.rotation.set(0,0,0);this.onShip=true;}
    else{if(this.rig.parent!==this.root)this.root.add(this.rig);this.rig.position.set(layout.boss.x,0,layout.boss.z);this.onShip=false;}
  }
  pose(boss:BossBattle,time:number,player:Point,yaw:number,carried:boolean,returned:boolean,endingElapsed:number|null,reducedMotion:boolean):void {
    const defeated=boss.segments===3,age=defeated?time-(boss.defeatedAt??-2):0,onShip=defeated&&(age>=1.4||endingElapsed!==null);
    this.place(onShip);this.rig.visible=true;this.rig.scale.setScalar(1);this.rig.rotation.y=onShip?0:boss.angle;this.actor.root.visible=true;
    this.actor.update(reducedMotion?0:time,false,boss.phase==='windup'||boss.phase==='active');this.pack.visible=defeated;this.pack.position.y=onShip?0:.22;this.pack.rotation.z=defeated&&!onShip&&!reducedMotion?Math.sin(age*18)*.055:0;
    this.scarfVisible=endingElapsed!==null&&endingElapsed>=1&&endingElapsed<5;this.scarf.visible=this.scarfVisible;
    this.signal.visible=boss.committed&&!defeated;this.signal.rotation.y=boss.angle;this.signalMaterial.color.set(boss.phase==='active'?'#f8be55':'#a4f8d9');this.signalMaterial.opacity=boss.phase==='active'?.36:.24;
    const muzzle=this.actor.root.userData.muzzleLocal as THREE.Vector3|undefined;this.charge.position.copy(muzzle??new THREE.Vector3(0,1,.84)).add(new THREE.Vector3(0,0,.15));this.charge.visible=boss.phase==='windup';
    this.core.visible=true;
    if(returned){const target=new THREE.Vector3(layout.tree.x,1.5,layout.tree.z+1.13),u=Math.min(1,Math.max(0,endingElapsed??1)),ease=u*u*(3-2*u);this.core.position.copy(this.depositFrom??new THREE.Vector3(player.x+Math.cos(yaw)*.9,1.7,player.z-Math.sin(yaw)*.9)).lerp(target,ease);}
    else if(!defeated){this.core.visible=boss.phase==='vulnerable';const p=(muzzle??new THREE.Vector3(0,1,.84)).clone();this.actor.root.updateWorldMatrix(true,false);this.core.position.copy(this.actor.root.localToWorld(p));}
    else if(carried){this.core.position.set(player.x+Math.cos(yaw)*.9,1.7,player.z-Math.sin(yaw)*.9);}
    else this.core.position.set(layout.core.x,.85,layout.core.z);
    this.core.rotation.set(0,reducedMotion?0:time*.65,0);
  }
  measureScarfContacts():{name:string;value:number;limit:number}[]{
    if(!this.scarfVisible||this.rig.getWorldScale(new THREE.Vector3()).length()<1e-7)return [];
    this.rig.updateWorldMatrix(true,true);const world=(mesh:THREE.Mesh,p:THREE.Vector3)=>mesh.localToWorld(p);
    const topOnBody=world(this.body,new THREE.Vector3(.35/parcelSize.width,.5,.35/parcelSize.depth));
    const topOnScarf=world(this.scarfTop,new THREE.Vector3(0,-.5,(.35-.405)/clothSize.length));
    const frontHeight=this.scarfFront.position.y;
    const frontOnBody=world(this.body,new THREE.Vector3(.35/parcelSize.width,(frontHeight-parcelSize.height/2)/parcelSize.height,.5));
    const frontOnScarf=world(this.scarfFront,new THREE.Vector3(0,0,-.5));
    return [{name:'scarf top supported by actual parcel lid (m)',value:topOnBody.distanceTo(topOnScarf),limit:.001},{name:'scarf back supported by actual parcel face (m)',value:frontOnBody.distanceTo(frontOnScarf),limit:.001}];
  }
  measureShipSupport():{name:string;value:number;limit:number}[]{
    if(!this.onShip)return [];const ship=this.rig.parent;const support=ship?.userData.parcelSupport as {center?:{x:number;y:number;z:number};width?:number;depth?:number}|undefined;
    if(!ship||!support?.center)return [{name:'parcel ship support metadata available',value:1,limit:0}];
    if(!ship.visible||ship.getWorldScale(new THREE.Vector3()).length()<1e-7)return [];
    const a=this.body.localToWorld(new THREE.Vector3(0,-.5,0)),b=ship.localToWorld(new THREE.Vector3(support.center.x,support.center.y,support.center.z));
    return [{name:'parcel bottom to ship deck (m)',value:a.distanceTo(b),limit:.001},{name:'parcel within ship support width',value:Math.max(0,parcelSize.width-(support.width??0)),limit:0},{name:'parcel within ship support depth',value:Math.max(0,parcelSize.depth-(support.depth??0)),limit:0}];
  }
  metadata(){return {castFallback:this.fallback,scarfVisible:this.scarfVisible,onShip:this.onShip,signal:{baseRange:bossConfig.range,baseHalfAngle:bossConfig.halfAngle,bodyMargin:bossConfig.bodyRadius,visualMargin:(bossConfig.bodyRadius+.002)/Math.cos(Math.PI/16)},parcel:{...parcelSize},scarf:{...clothSize}};}
  measureMuzzleContact():{name:string;value:number;limit:number}[]{const muzzle=this.actor.root.userData.muzzleLocal as THREE.Vector3|undefined;if(!this.charge.visible||!muzzle)return [];const mouth=this.actor.root.localToWorld(muzzle.clone()),surface=this.charge.localToWorld(new THREE.Vector3(0,0,-this.charge.geometry.parameters.radius));return [{name:'charge back touches actual scaled muzzle (m)',value:mouth.distanceTo(surface),limit:.001}];}
  signalBoundaryErrors():number {let errors=0;const base:P[]=[{x:0,z:0}];for(let i=0;i<=64;i++){const a=-bossConfig.halfAngle+i/64*bossConfig.halfAngle*2;base.push({x:Math.sin(a)*bossConfig.range,z:Math.cos(a)*bossConfig.range});}for(const a of [-bossConfig.halfAngle,bossConfig.halfAngle])for(let i=1;i<32;i++)base.push({x:Math.sin(a)*bossConfig.range*i/32,z:Math.cos(a)*bossConfig.range*i/32});for(const p of base)for(let i=0;i<32;i++){const a=i/32*Math.PI*2,q={x:p.x+Math.sin(a)*bossConfig.bodyRadius,z:p.z+Math.cos(a)*bossConfig.bodyRadius};if(outline.some((v,index)=>{const w=outline[(index+1)%outline.length];return (w.x-v.x)*(q.z-v.z)-(w.z-v.z)*(q.x-v.x)<-1e-8;}))errors++;}return errors;}
  dispose():void {
    const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),shared=new Set<THREE.Material>([purple,gold,red]);
    for(const object of [this.pack,this.core,this.signal,this.charge])object.traverse(child=>{if(child instanceof THREE.Mesh||child instanceof THREE.Line){if(child.geometry!==box&&child.geometry!==sectorGeometry&&child.geometry!==borderGeometry)geometries.add(child.geometry);for(const material of Array.isArray(child.material)?child.material:[child.material])if(!shared.has(material))materials.add(material);}});
    this.rig.removeFromParent();this.root.removeFromParent();for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
  }
}
