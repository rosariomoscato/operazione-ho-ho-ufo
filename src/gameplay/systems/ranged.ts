import * as THREE from 'three';
import { toyMaterial } from '../../visual/style';
import { distance, lineClear, move, nextWaypoint, segmentBox, segmentCircle, type Point } from '../../engine/math';
import type { Enemy, GameplaySystem, SystemContext, SystemDefinition } from '../types';

export const rangedConfig={windup:1.2,lock:.2,recovery:1.2,speed:6,radius:.18,range:12,travel:18,lifetime:3,pool:3};
interface Bolt extends Point {id:number;attackId:number;owner:number;dx:number;dz:number;age:number;active:boolean;mesh:THREE.Group;y?:number}
export function rangedMuzzle(e:Enemy):THREE.Vector3 {const root=e.actor?.root,local=root?.userData.muzzleLocal;if(root){root.position.set(e.x,0,e.z);root.rotation.y=e.angle;root.updateWorldMatrix(true,true);if(typeof root.userData.getMuzzleWorld==='function')return root.userData.getMuzzleWorld(new THREE.Vector3());if(local instanceof THREE.Vector3)return root.localToWorld(local.clone());}return new THREE.Vector3(e.x+Math.sin(e.angle)*.52,1.2,e.z+Math.cos(e.angle)*.52);}
interface Cue {root:THREE.Group;lane:THREE.Group;muzzle:THREE.Mesh}
const mint=toyMaterial('#a4f8d9'),ink=new THREE.LineBasicMaterial({color:'#202d42'});
const boltGeometry=new THREE.SphereGeometry(.18,12,8);
const boltEdges=new THREE.EdgesGeometry(new THREE.OctahedronGeometry(.195));
const laneGeometry=new THREE.PlaneGeometry(1.32,1);laneGeometry.rotateX(-Math.PI/2);laneGeometry.translate(0,0,.5);
const laneFill=new THREE.MeshBasicMaterial({color:'#a4f8d9',transparent:true,opacity:.26,side:THREE.DoubleSide,depthWrite:false});
const laneEdge=new THREE.EdgesGeometry(laneGeometry);
const muzzleGeometry=new THREE.SphereGeometry(.14,8,6);

export class RangedSystem implements GameplaySystem {
  readonly id='ranged';readonly bolts:Bolt[]=[];readonly cues=new Map<number,Cue>();serial=0;
  constructor(readonly scene:THREE.Scene){for(let i=0;i<rangedConfig.pool;i++){const mesh=new THREE.Group();mesh.add(new THREE.Mesh(boltGeometry,mint),new THREE.LineSegments(boltEdges,ink));mesh.visible=false;scene.add(mesh);this.bolts.push({id:0,attackId:0,owner:0,x:0,z:0,dx:0,dz:0,age:0,active:false,mesh});}}
  committed():boolean{return this.bolts.some(b=>b.active);}
  reset():void {for(const b of this.bolts){b.active=false;b.mesh.visible=false;}for(const cue of this.cues.values())this.scene.remove(cue.root);this.cues.clear();}
  remove(b:Bolt,ctx:SystemContext,reason:string,collider?:string):void {b.active=false;b.mesh.visible=false;ctx.delayAttack(.6);ctx.log('bolt-end',{id:b.id,attackId:b.attackId,reason,collider,x:b.x,z:b.z,age:b.age});if(reason==='cover'){ctx.notify('Riparo: colpo fermato');ctx.coverSuccess();}}
  update(ctx:SystemContext,dt:number):void {
    for(const b of this.bolts)if(b.active){const from={x:b.x,z:b.z},to={x:b.x+b.dx*rangedConfig.speed*dt,z:b.z+b.dz*rangedConfig.speed*dt};let impact=Infinity,collider='';
      for(const o of ctx.obstacles){const t=segmentBox(from,to,o,rangedConfig.radius);if(t!==null&&t<impact){impact=t;collider=o.id;}}
      const playerHit=segmentCircle(from,to,ctx.player,.48+rangedConfig.radius);
      if(playerHit!==null&&playerHit<impact-1e-7){impact=playerHit;collider='player';}
      b.age+=dt;b.x=from.x+(to.x-from.x)*(Number.isFinite(impact)?impact:1);b.z=from.z+(to.z-from.z)*(Number.isFinite(impact)?impact:1);
      if(collider){if(collider==='player')ctx.damage(b.attackId,'ranged');this.remove(b,ctx,collider==='player'?'player':'cover',collider);}
      else if(b.age>=rangedConfig.lifetime||Math.abs(b.x)>15||b.z< -15||b.z>13)this.remove(b,ctx,'expired');
    }
    for(const e of ctx.enemies){if(e.kind!=='ranged'||e.hp<=0||!ctx.active(e))continue;const age=ctx.time-e.since,d=distance(e,ctx.player);
      if(e.status==='windup'){
        if(age<rangedConfig.lock)e.angle=Math.atan2(ctx.player.x-e.x,ctx.player.z-e.z);
        if(age>=rangedConfig.lock&&e.lockAt===undefined){e.lockAt=ctx.time;ctx.log('ranged-lock',{id:e.id,attackId:e.attackId,angle:e.angle,lockedAt:ctx.time});}
        if(age>=rangedConfig.windup){const bolt=this.bolts.find(b=>!b.active);if(!bolt)continue;
          const dx=Math.sin(e.angle),dz=Math.cos(e.angle),mouth=rangedMuzzle(e);Object.assign(bolt,{id:++this.serial,attackId:e.attackId,owner:e.id,x:mouth.x,y:mouth.y,z:mouth.z,dx,dz,age:0,active:true});
          // A blocked muzzle is an impact, never a relocation through a cover.
          let impact=Infinity,collider='';for(const obstacle of ctx.obstacles){const t=segmentBox(e,bolt,obstacle,rangedConfig.radius);if(t!==null&&t<impact){impact=t;collider=obstacle.id;}}const playerHit=segmentCircle(e,bolt,ctx.player,.48+rangedConfig.radius);if(playerHit!==null&&playerHit<impact-1e-7){impact=playerHit;collider='player';}if(collider){bolt.x=e.x+(mouth.x-e.x)*impact;bolt.z=e.z+(mouth.z-e.z)*impact;if(collider==='player')ctx.damage(bolt.attackId,'ranged');this.remove(bolt,ctx,collider==='player'?'player':'cover',collider);}
          e.status='recovery';e.since=ctx.time;ctx.log('ranged-release',{id:e.id,attackId:e.attackId,boltId:bolt.id,angle:e.angle,windup:age,lockedFor:ctx.time-(e.lockAt??ctx.time),x:bolt.x,z:bolt.z,speed:rangedConfig.speed});
        }continue;
      }
      if(e.status!=='approach')continue;
      if(!ctx.committed()&&ctx.canAttack()&&d<=rangedConfig.range&&ctx.visible(e)&&lineClear(e,ctx.player,ctx.obstacles,.18)){
        e.status='windup';e.since=ctx.time;e.angle=Math.atan2(ctx.player.x-e.x,ctx.player.z-e.z);e.attackId=ctx.reserveAttack();e.lockAt=undefined;e.hit=false;ctx.effect('sfx.alien');ctx.log('ranged-windup',{id:e.id,attackId:e.attackId,windup:rangedConfig.windup,lock:rangedConfig.lock});continue;
      }
      // Find the player around solid cover, then prefer a reachable 5–9 m position.
      const clear=lineClear(e,ctx.player,ctx.obstacles,.2);let goal:Point=ctx.player;
      if(clear&&d>=5&&d<=9)continue;
      if(clear&&d<5){const n=d||1;goal={x:e.x+(e.x-ctx.player.x)/n*2,z:e.z+(e.z-ctx.player.z)/n*2};}
      const waypoint=nextWaypoint(e,goal,ctx.obstacles);const dx=waypoint.x-e.x,dz=waypoint.z-e.z,len=Math.hypot(dx,dz);if(len>.12){move(e,dx/len*1.8*dt,dz/len*1.8*dt,.42,ctx.obstacles);e.angle=Math.atan2(ctx.player.x-e.x,ctx.player.z-e.z);}
    }
  }
  pose(ctx:SystemContext):void {
    for(const b of this.bolts){b.mesh.visible=b.active;b.mesh.position.set(b.x,b.y??1.2,b.z);}
    for(const e of ctx.enemies.filter(e=>e.kind==='ranged')){
      let cue=this.cues.get(e.id);if(!cue){const root=new THREE.Group(),lane=new THREE.Group();lane.add(new THREE.Mesh(laneGeometry,laneFill),new THREE.LineSegments(laneEdge,ink));const muzzle=new THREE.Mesh(muzzleGeometry,mint);root.add(lane,muzzle);this.scene.add(root);cue={root,lane,muzzle};this.cues.set(e.id,cue);}
      cue.root.visible=e.status==='windup';cue.root.position.set(e.x,.035,e.z);cue.root.rotation.y=e.angle;cue.lane.scale.z=rangedConfig.travel;cue.root.updateWorldMatrix(true,false);cue.muzzle.position.copy(cue.root.worldToLocal(rangedMuzzle(e).add(new THREE.Vector3(Math.sin(e.angle)*.14,0,Math.cos(e.angle)*.14))));
    }
  }
  state():unknown[]{return this.bolts.filter(b=>b.active).map(b=>({id:b.id,attackId:b.attackId,owner:b.owner,x:b.x,y:b.y??1.2,z:b.z,dx:b.dx,dz:b.dz,speed:rangedConfig.speed,age:b.age,status:'flying'}));}
  checks():{name:string;value:number;limit:number}[]{return[{name:'bounded hostile bolt pool',value:this.bolts.filter(b=>b.active).length,limit:1},{name:'live bolt finite and unexpired',value:this.bolts.filter(b=>b.active&&(!Number.isFinite(b.x)||!Number.isFinite(b.z)||b.age>rangedConfig.lifetime+.001)).length,limit:0}];}
}
export default {id:'ranged',config:rangedConfig,create:(scene:THREE.Scene)=>new RangedSystem(scene)} satisfies SystemDefinition;
