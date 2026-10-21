import type { Point } from '../engine/math';
import { clamp, distance } from '../engine/math';

export const bossConfig={segments:3,range:22,halfAngle:.20,bodyRadius:.48,windup:1.4,tracking:.3,minimumLocked:.8,active:.35,gap:.5,window:5.5,giftRange:12,giftRadius:2} as const;
export type BossPhase='approach'|'waiting'|'windup'|'active'|'gap'|'vulnerable'|'defeated';
export interface BossContext {time:number;origin:Point;player:Point;canStart():boolean;lineClear():boolean;reserveAttack():number;damage(id:number):void;log(type:string,data?:Record<string,unknown>):void;cue():void;segmentComplete():void;windowOpened():void;missed():void}
export interface BossGift {windowId:number|null;launchedAt:number;inRange:boolean}

/** Distance to the finite closed sector, not to an infinite ray. */
export function sectorDistance(origin:Point,point:Point,angle:number,range:number=bossConfig.range,halfAngle:number=bossConfig.halfAngle):number {
  const d=distance(origin,point);if(d<1e-12)return 0;
  const a=Math.atan2(point.x-origin.x,point.z-origin.z),delta=Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)));
  if(delta<=halfAngle)return Math.max(0,d-range);
  const theta=delta-halfAngle,projection=d*Math.cos(theta);return Math.hypot(d*Math.sin(theta),projection-clamp(projection,0,range));
}
export function bossSectorContains(origin:Point,point:Point,angle:number):boolean {return sectorDistance(origin,point,angle)<=bossConfig.bodyRadius+1e-9;}

export class BossBattle {
  phase:BossPhase='approach';segments=0;cone=0;attempt=0;angle=0;attackId=0;since=0;until=0;lockedAt:number|null=null;attackContactConsumed=false;
  windowId=0;windowStarted=0;windowUntil=0;windowConsumed=false;lastHitAt:number|null=null;defeatedAt:number|null=null;
  private afterGap:'cone'|'cycle'='cycle';
  get cycle():number{return Math.min(3,this.segments+1);}
  get committed():boolean{return this.phase==='windup'||this.phase==='active';}
  reset(segments:number,active=false):void {this.segments=segments;this.phase=segments===3?'defeated':active?'waiting':'approach';this.cone=0;this.attempt=0;this.angle=0;this.attackId=0;this.since=this.until=0;this.lockedAt=null;this.attackContactConsumed=false;this.windowId=0;this.windowStarted=this.windowUntil=0;this.windowConsumed=false;this.lastHitAt=null;this.defeatedAt=segments===3?-2:null;this.afterGap='cycle';}
  activate(time:number):void {if(this.phase==='approach'){this.phase='waiting';this.since=time;}}
  private begin(ctx:BossContext,newCycle:boolean):void {if(!ctx.canStart())return;if(newCycle){this.cone=1;this.attempt++;}else this.cone++;this.phase='windup';this.since=ctx.time;this.until=ctx.time+bossConfig.windup;this.lockedAt=null;this.angle=Math.atan2(ctx.player.x-ctx.origin.x,ctx.player.z-ctx.origin.z);this.attackId=ctx.reserveAttack();this.attackContactConsumed=false;ctx.cue();ctx.log('boss-windup',{attackId:this.attackId,cycle:this.cycle,cone:this.cone,attempt:this.attempt,angle:this.angle});}
  update(ctx:BossContext):void {
    if(this.phase==='approach'||this.phase==='defeated')return;
    if(this.phase==='waiting'){this.begin(ctx,true);return;}
    if(this.phase==='gap'){if(ctx.time>=this.until)this.begin(ctx,this.afterGap==='cycle');return;}
    if(this.phase==='windup'){
      const age=ctx.time-this.since;if(age<bossConfig.tracking)this.angle=Math.atan2(ctx.player.x-ctx.origin.x,ctx.player.z-ctx.origin.z);
      if(age>=bossConfig.tracking&&this.lockedAt===null){this.lockedAt=ctx.time;ctx.log('boss-lock',{attackId:this.attackId,angle:this.angle,lockedAt:this.lockedAt});}
      if(age>=bossConfig.windup&&this.lockedAt!==null&&ctx.time-this.lockedAt>=bossConfig.minimumLocked){ctx.log('boss-active',{attackId:this.attackId,angle:this.angle,windup:age,lockedFor:ctx.time-this.lockedAt});this.phase='active';this.since=ctx.time;this.until=ctx.time+bossConfig.active;}return;
    }
    if(this.phase==='active'){
      if(ctx.time>=this.until){ctx.log('boss-active-end',{attackId:this.attackId,duration:ctx.time-this.since});if(this.cone<this.cycle){this.phase='gap';this.since=ctx.time;this.until=ctx.time+bossConfig.gap;this.afterGap='cone';}else{this.phase='vulnerable';this.windowId++;this.windowStarted=ctx.time;this.windowUntil=ctx.time+bossConfig.window;this.windowConsumed=false;this.since=ctx.time;this.until=this.windowUntil;ctx.log('boss-window-open',{windowId:this.windowId,cycle:this.cycle,until:this.windowUntil});ctx.windowOpened();}return;}
      if(!this.attackContactConsumed&&bossSectorContains(ctx.origin,ctx.player,this.angle)&&ctx.lineClear()){this.attackContactConsumed=true;ctx.log('boss-body-contact',{attackId:this.attackId,angle:this.angle});ctx.damage(this.attackId);}return;
    }
    if(this.phase==='vulnerable'&&ctx.time>=this.windowUntil){ctx.log('boss-window-miss',{windowId:this.windowId,cycle:this.cycle,duration:ctx.time-this.windowStarted});this.phase='waiting';this.cone=0;this.since=ctx.time;ctx.missed();this.begin(ctx,true);}
  }
  launch(time:number,inRange:boolean):BossGift {return {windowId:this.phase==='vulnerable'&&!this.windowConsumed&&time<this.windowUntil?this.windowId:null,launchedAt:time,inRange};}
  acceptGift(gift:BossGift,ctx:BossContext):{accepted:boolean;reason:string} {
    let reason='Scudo del generale attivo · schiva il raggio';
    if(this.phase==='approach')reason='Avvicinati per affrontare Squamakk';
    else if(this.phase==='defeated')reason='Generale già impacchettato · recupera il nucleo con E';
    else if(!gift.inRange)reason='Avvicinati al nucleo: portata12m';
    else if(gift.windowId===null||gift.windowId!==this.windowId||gift.launchedAt<this.windowStarted)reason='Regalo fuori finestra: attendi il nucleo esposto e lancia di nuovo';
    else if(this.phase==='vulnerable'&&!this.windowConsumed&&ctx.time<this.windowUntil){
      this.windowConsumed=true;this.segments++;this.lastHitAt=ctx.time;this.phase=this.segments===3?'defeated':'gap';this.since=ctx.time;this.until=ctx.time+bossConfig.gap;this.afterGap='cycle';if(this.segments===3)this.defeatedAt=ctx.time;
      ctx.log('boss-segment-hit',{segments:this.segments,windowId:this.windowId,launchedAt:gift.launchedAt,impactAt:ctx.time});ctx.segmentComplete();return {accepted:true,reason:`Colpo riuscito ${this.segments}/3`};
    }
    ctx.log('boss-gift-rejected',{reason,launchWindowId:gift.windowId,currentWindowId:this.windowId,phase:this.phase,consumed:this.windowConsumed,launchedAt:gift.launchedAt,impactAt:ctx.time});return {accepted:false,reason};
  }
  /** Pose-only seed, never a simulation or checkpoint transition. */
  reviewPose(phase:BossPhase,time:number):void {
    this.phase=phase;this.since=0;this.until=phase==='windup'?bossConfig.windup:phase==='active'?bossConfig.active:phase==='vulnerable'?bossConfig.window:bossConfig.gap;this.cone=1;this.attempt=1;this.angle=0;
    if(phase==='windup'){this.attackId=1;this.lockedAt=time>=bossConfig.tracking?bossConfig.tracking:null;}
    if(phase==='active'){this.attackId=1;this.lockedAt=-bossConfig.windup+bossConfig.tracking;}
    if(phase==='vulnerable'){this.windowId=1;this.windowStarted=0;this.windowUntil=bossConfig.window;this.windowConsumed=false;}
  }
  state(time:number){return {phase:this.phase,segments:this.segments,cycle:this.cycle,cone:this.cone,pattern:this.cycle,attempt:this.attempt,windowId:this.windowId,windowConsumed:this.windowConsumed,windowStarted:this.windowStarted,windowUntil:this.windowUntil,remaining:Math.max(0,this.until-time),since:this.since,until:this.until,angle:this.angle,attackId:this.attackId,lockedAt:this.lockedAt,attackContactConsumed:this.attackContactConsumed,defeated:this.segments===3,defeatedAt:this.defeatedAt,committed:this.committed,config:bossConfig};}
}
