import type { ScenarioDefinition } from './types';
import { squareLayout as p } from '../acts/square';
export default [
  {id:'square-entry',chapter:'square',boundary:'square'},
  {id:'square-approach',chapter:'square',boundary:'square',position:{x:p.encounter.x,z:p.encounter.z+p.encounter.radius+.5}},
  {id:'boss-cycle-1',chapter:'square',boundary:'boss',bossSegments:0,bossPhase:'windup'},
  {id:'boss-cycle-2',chapter:'square',boundary:'boss',bossSegments:1,bossPhase:'windup'},
  {id:'boss-cycle-3',chapter:'square',boundary:'boss',bossSegments:2,bossPhase:'windup'},
  {id:'boss-locked',chapter:'square',boundary:'boss',bossPhase:'windup',bossLocked:true},
  {id:'boss-active',chapter:'square',boundary:'boss',bossPhase:'active'},
  {id:'boss-vulnerable',chapter:'square',boundary:'boss',bossPhase:'vulnerable'},
  {id:'boss-miss',chapter:'square',boundary:'boss',bossPhase:'waiting',bossMiss:true},
  {id:'boss-wrapped',chapter:'square',boundary:'core',bossSegments:3,bossWrapped:true,position:{x:p.core.x,z:p.core.z+2}},
  {id:'square-core',chapter:'square',boundary:'core',bossSegments:3,position:{x:p.core.x,z:p.core.z+1.8}},
  {id:'square-carrying',chapter:'square',boundary:'return-core',bossSegments:3,position:{x:p.treeInteraction.x-1.8,z:p.treeInteraction.z}},
  {id:'square-ending',chapter:'square',boundary:'ending',bossSegments:3,position:p.treeInteraction},
] satisfies ScenarioDefinition[];
