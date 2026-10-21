import type { ActId, AudioSettings } from './contracts';
export type Boundary = 'training' | 'A' | 'B' | 'C' | 'anchor' | 'complete' | 'street' | 'street-complete';
export interface Checkpoint { version: 2; chapter: ActId; boundary: Boundary; healed: boolean; firstWrapped: boolean; disabledAnchors: string[]; clearedArenas: string[]; activatedArenas: string[]; defeatedEnemies: string[] }
export interface Settings extends AudioSettings { reducedMotion: boolean; aimAssist: boolean }
export const SAVE_KEY='ho-ho-ufo.checkpoint.v2', LEGACY_KEY='ho-ho-ufo.checkpoint.v1';
const PREFS='ho-ho-ufo.settings.v1';
let notice='';
export const defaultSettings: Settings = {master:.7,music:.3,effects:.65,reducedMotion:false,aimAssist:true};
export function emptyCheckpoint(chapter:ActId='courtyard',boundary:Boundary=chapter==='courtyard'?'training':'street'):Checkpoint {return {version:2,chapter,boundary,healed:false,firstWrapped:chapter==='toystreet',disabledAnchors:[],clearedArenas:[],activatedArenas:[],defeatedEnemies:[]};}
function strings(value:unknown,allowed?:string[]):value is string[] {return Array.isArray(value)&&value.every(v=>typeof v==='string'&&(!allowed||allowed.includes(v)))&&new Set(value).size===value.length;}
export function normalizeCheckpoint(value:unknown):Checkpoint|null {
  if(!value||typeof value!=='object')return null;
  const s=value as Record<string,unknown>;
  if(typeof s.healed!=='boolean'||typeof s.firstWrapped!=='boolean')return null;
  if(s.version===1&&['training','A','B','C','anchor','complete'].includes(String(s.boundary)))return {...emptyCheckpoint('courtyard',s.boundary as Boundary),healed:s.healed,firstWrapped:s.firstWrapped,disabledAnchors:s.boundary==='complete'?['courtyard']:[]};
  if(s.version!==2||!['courtyard','toystreet'].includes(String(s.chapter)))return null;
  const street=s.chapter==='toystreet';
  if(!(street?['street','street-complete']:['training','A','B','C','anchor','complete']).includes(String(s.boundary)))return null;
  if(!strings(s.disabledAnchors,street?['workshop','carousel']:['courtyard'])||!strings(s.clearedArenas,street?['workshop','carousel']:[])||!strings(s.activatedArenas,street?['workshop','carousel']:[])||!strings(s.defeatedEnemies))return null;
  if(street&&(!s.disabledAnchors.every(id=>s.clearedArenas instanceof Array&&s.clearedArenas.includes(id))||s.clearedArenas.some(id=>!(s.activatedArenas as string[]).includes(id))))return null;
  if(street&&((s.boundary==='street-complete')!==(s.disabledAnchors.length===2)))return null;
  if(!street&&((s.boundary==='complete')!==(s.disabledAnchors.length===1)))return null;
  if(!s.defeatedEnemies.every(id=>/^(workshop|carousel):[0-2]$/.test(id)))return null;
  return {version:2,chapter:s.chapter as ActId,boundary:s.boundary as Boundary,healed:s.healed,firstWrapped:s.firstWrapped,disabledAnchors:[...s.disabledAnchors],clearedArenas:[...s.clearedArenas],activatedArenas:[...s.activatedArenas],defeatedEnemies:[...s.defeatedEnemies]};
}
export function readCheckpoint():Checkpoint|null {
  notice='';try{const current=localStorage.getItem(SAVE_KEY),legacy=current===null?localStorage.getItem(LEGACY_KEY):null;if(current===null&&legacy===null)return null;
    const value:unknown=JSON.parse(current??legacy!);const result=normalizeCheckpoint(value);if(!result)notice='Salvataggio non riconosciuto o danneggiato. Nuova partita riparte dal cortile; nessun dato è stato cancellato.';return result;
  }catch{notice='Salvataggio non disponibile o danneggiato. Puoi iniziare una partita senza persistenza.';return null;}
}
export const storageNotice=():string=>notice;
export function writeCheckpoint(save:Checkpoint):boolean {try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));return true;}catch{return false;}}
export function clearCheckpoint():boolean {let ok=true;for(const key of [SAVE_KEY,LEGACY_KEY])try{localStorage.removeItem(key);}catch{ok=false;}return ok;}
export function readSettings():Settings {try{const s=JSON.parse(localStorage.getItem(PREFS)??'{}') as Partial<Settings>;return{master:volume(s.master,.7),music:volume(s.music,.3),effects:volume(s.effects,.65),reducedMotion:s.reducedMotion===true,aimAssist:s.aimAssist!==false};}catch{return{...defaultSettings};}}
function volume(n:unknown,fallback:number):number{return typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(1,n)):fallback;}
export function writeSettings(settings:Settings):void {try{localStorage.setItem(PREFS,JSON.stringify(settings));}catch{/* Preferences are optional. */}}
