import type { ActId } from '../contracts';
import type { Boundary } from '../storage';
import type { BossPhase } from '../gameplay/boss';
export interface ScenarioDefinition {id:string;chapter:ActId;boundary:Boundary;hp?:number;arena?:string;cleared?:string[];disabled?:string[];activated?:string[];firstWrap?:boolean;intro?:boolean;bossSegments?:number;bossPhase?:BossPhase;bossLocked?:boolean;bossMiss?:boolean;bossWrapped?:boolean;position?:{x:number;z:number}}
