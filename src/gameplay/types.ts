import type * as THREE from 'three';
import type { Obstacle, VisualActor } from '../contracts';
import type { Point } from '../engine/math';
export type EnemyStatus='approach'|'windup'|'active'|'recovery'|'stunned'|'wrapped'|'gone';
export interface Enemy extends Point {id:number;key:string;arenaId?:string;kind:'melee'|'ranged';hp:number;actor:VisualActor;status:EnemyStatus;since:number;angle:number;attackId:number;lockAt?:number;hit:boolean;sign:THREE.Mesh;parcel:THREE.Group;label:HTMLDivElement}
export interface SystemContext {
  scene:THREE.Scene;time:number;player:Point&{hp:number;invulnerableUntil:number};enemies:Enemy[];obstacles:Obstacle[];
  active(e:Enemy):boolean;visible(p:Point):boolean;committed():boolean;canAttack():boolean;
  reserveAttack():number;delayAttack(seconds:number):void;damage(attackId:number,kind:string):void;
  log(type:string,data?:Record<string,unknown>):void;effect(id:string):void;notify(text:string):void;coverSuccess():void;
}
export interface GameplaySystem {id:string;update(context:SystemContext,dt:number):void;pose(context:SystemContext):void;reset():void;committed():boolean;state():unknown[];checks?():{name:string;value:number;limit:number}[]}
export interface SystemDefinition {id:string;config:Record<string,number>;create(scene:THREE.Scene):GameplaySystem}
