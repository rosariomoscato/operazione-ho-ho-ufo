import type { ActDefinition, CreateWorld } from './contracts';
import type { SystemDefinition } from './gameplay/types';
import type { ScenarioDefinition } from './scenarios/types';
function unique<T extends {id:string}>(items:T[],name:string):T[]{if(items.some(item=>!item?.id)||new Set(items.map(i=>i.id)).size!==items.length)throw new Error(`Registro ${name}: ID assente o duplicato`);return items;}
export const acts=unique(Object.values(import.meta.glob<{default:ActDefinition}>('./acts/*.ts',{eager:true})).map(m=>m.default),'atti');
export const levels=unique(Object.entries(import.meta.glob<{createWorld:CreateWorld;id?:string}>('./levels/*.ts',{eager:true})).filter(([,m])=>typeof m.createWorld==='function').map(([path,m])=>({id:m.id??path.split('/').pop()!.replace('.ts',''),createWorld:m.createWorld})),'livelli');
export const systemDefinitions=unique(Object.values(import.meta.glob<{default:SystemDefinition}>('./gameplay/systems/*.ts',{eager:true})).map(m=>m.default),'sistemi');
export const scenarios=unique(Object.values(import.meta.glob<{default:ScenarioDefinition|ScenarioDefinition[]}>('./scenarios/*.ts',{eager:true})).flatMap(m=>m.default?Array.isArray(m.default)?m.default:[m.default]:[]),'scenari');
export function getAct(id:string):ActDefinition {const act=acts.find(a=>a.id===id);if(!act)throw new Error(`Atto assente: ${id}`);if(!levels.some(l=>l.id===act.levelId))throw new Error(`Livello assente per ${id}`);return act;}
