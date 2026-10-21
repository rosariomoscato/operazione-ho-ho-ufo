import type { VisualActor } from '../contracts';
export interface CastDefinition {id:string;create:()=>VisualActor}
const modules=import.meta.glob<{default:CastDefinition}>('./cast/*.ts',{eager:true});
export const cast=Object.values(modules).map(m=>m.default);
if(cast.some(c=>!c||typeof c.create!=='function')||new Set(cast.map(c=>c.id)).size!==cast.length)throw new Error('Registro cast non valido o ID duplicato');
export function createCharacter(id:string):VisualActor {const entry=cast.find(c=>c.id===id)??(id==='shooter'?cast.find(c=>c.id==='alien'):undefined);if(!entry)throw new Error(`Cast assente: ${id}`);return entry.create();}
