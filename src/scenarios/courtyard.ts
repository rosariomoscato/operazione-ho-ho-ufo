import type { ScenarioDefinition } from './types';
export default [
  {id:'intro',chapter:'courtyard',boundary:'training',intro:true},
  {id:'training',chapter:'courtyard',boundary:'training'},
  {id:'battle',chapter:'courtyard',boundary:'A'},
  {id:'battle-a',chapter:'courtyard',boundary:'A'},
  {id:'first-wrap',chapter:'courtyard',boundary:'A',firstWrap:true},
  {id:'battle-b',chapter:'courtyard',boundary:'B'},
  {id:'battle-c',chapter:'courtyard',boundary:'C',hp:2},
  {id:'anchor',chapter:'courtyard',boundary:'anchor'},
  {id:'complete',chapter:'courtyard',boundary:'complete'},
] satisfies ScenarioDefinition[];
