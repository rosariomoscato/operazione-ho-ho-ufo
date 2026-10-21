import type { ActId } from '../contracts';
import type { Boundary } from '../storage';
export interface ScenarioDefinition {id:string;chapter:ActId;boundary:Boundary;hp?:number;arena?:string;cleared?:string[];disabled?:string[];activated?:string[];firstWrap?:boolean;intro?:boolean}
