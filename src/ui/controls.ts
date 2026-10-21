import type { ControlAction, KeyBindings } from '../storage';
export const actionNames:Record<ControlAction,string>={forward:'Avanti',backward:'Indietro',left:'Sinistra',right:'Destra',dodge:'Schiva',interact:'Interagisci',help:'Aiuto'};
export function keyLabel(code:string):string {return ({Space:'Spazio',ShiftLeft:'Shift sinistro',ShiftRight:'Shift destro',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→'} as Record<string,string>)[code]??code.replace(/^(Key|Digit)/,'');}
// Token boundaries keep words and dialogue IDs unchanged. Used for all existing authored prompts.
export function controlText(text:string,bindings:KeyBindings):string {return text.replace(/\bWASD\b|\bSpazio\b|\bE\b|\bH\b/g,token=>token==='WASD'?[bindings.forward,bindings.left,bindings.backward,bindings.right].map(keyLabel).join('/') :keyLabel(bindings[token==='Spazio'?'dodge':token==='E'?'interact':'help']));}
