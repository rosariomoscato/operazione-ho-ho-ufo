import type { ActId, AudioSettings } from './contracts';
export type Boundary = 'training' | 'A' | 'B' | 'C' | 'anchor' | 'complete' | 'street' | 'street-complete' | 'square' | 'boss' | 'core' | 'return-core' | 'ending';
export interface BossCheckpoint { bossSegments:number; bossDefeated:boolean; coreCarried:boolean; coreReturned:boolean }
export interface Checkpoint extends BossCheckpoint { version: 3; chapter: ActId; boundary: Boundary; healed: boolean; firstWrapped: boolean; disabledAnchors: string[]; clearedArenas: string[]; activatedArenas: string[]; defeatedEnemies: string[] }
export interface Settings extends AudioSettings { reducedMotion: boolean; aimAssist: boolean }
export const SAVE_KEY='ho-ho-ufo.checkpoint.v3', LEGACY_V2_KEY='ho-ho-ufo.checkpoint.v2', LEGACY_KEY='ho-ho-ufo.checkpoint.v1';
const PREFS='ho-ho-ufo.settings.v1';
let notice='';
export const defaultSettings: Settings = {master:.7,music:.3,effects:.65,reducedMotion:false,aimAssist:true};
export const emptyBossCheckpoint=():BossCheckpoint=>({bossSegments:0,bossDefeated:false,coreCarried:false,coreReturned:false});
export function emptyCheckpoint(chapter:ActId='courtyard',boundary:Boundary=chapter==='courtyard'?'training':chapter==='toystreet'?'street':'square'):Checkpoint {const square=chapter==='square';return {version:3,chapter,boundary,healed:false,firstWrapped:chapter!=='courtyard',disabledAnchors:square?['workshop','carousel']:[],clearedArenas:square?['workshop','carousel']:[],activatedArenas:square?['workshop','carousel']:[],defeatedEnemies:[],...emptyBossCheckpoint()};}
function strings(value:unknown,allowed?:string[]):value is string[] {return Array.isArray(value)&&value.every(v=>typeof v==='string'&&(!allowed||allowed.includes(v)))&&new Set(value).size===value.length;}
export function normalizeCheckpoint(value:unknown):Checkpoint|null {
  if(!value||typeof value!=='object')return null;
  const s=value as Record<string,unknown>;
  if(typeof s.boundary!=='string')return null;
  if(typeof s.healed!=='boolean'||typeof s.firstWrapped!=='boolean')return null;
  if(s.version===1&&['training','A','B','C','anchor','complete'].includes(String(s.boundary)))return {...emptyCheckpoint('courtyard',s.boundary as Boundary),healed:s.healed,firstWrapped:s.firstWrapped,disabledAnchors:s.boundary==='complete'?['courtyard']:[]};
  if((s.version!==2&&s.version!==3)||typeof s.chapter!=='string'||!['courtyard','toystreet','square'].includes(s.chapter)||(s.version===2&&s.chapter==='square'))return null;
  const square=s.chapter==='square',street=s.chapter==='toystreet',later=street||square;
  if(!(square?['square','boss','core','return-core','ending']:street?['street','street-complete']:['training','A','B','C','anchor','complete']).includes(String(s.boundary)))return null;
  if(!strings(s.disabledAnchors,later?['workshop','carousel']:['courtyard'])||!strings(s.clearedArenas,later?['workshop','carousel']:[])||!strings(s.activatedArenas,later?['workshop','carousel']:[])||!strings(s.defeatedEnemies))return null;
  if(later&&(!s.disabledAnchors.every(id=>s.clearedArenas instanceof Array&&s.clearedArenas.includes(id))||s.clearedArenas.some(id=>!(s.activatedArenas as string[]).includes(id))))return null;
  if(square&&s.disabledAnchors.length!==2)return null;
  if(street&&((s.boundary==='street-complete')!==(s.disabledAnchors.length===2)))return null;
  if(!later&&((s.boundary==='complete')!==(s.disabledAnchors.length===1)))return null;
  if(!s.defeatedEnemies.every(id=>/^(workshop|carousel):[0-2]$/.test(id)))return null;
  let boss=emptyBossCheckpoint();
  if(s.version===3){if(!Number.isInteger(s.bossSegments)||Number(s.bossSegments)<0||Number(s.bossSegments)>3||typeof s.bossDefeated!=='boolean'||typeof s.coreCarried!=='boolean'||typeof s.coreReturned!=='boolean')return null;boss={bossSegments:Number(s.bossSegments),bossDefeated:s.bossDefeated,coreCarried:s.coreCarried,coreReturned:s.coreReturned};
    if(!square&&(boss.bossSegments!==0||boss.bossDefeated||boss.coreCarried||boss.coreReturned))return null;
    if(square){if(boss.bossDefeated!==(boss.bossSegments===3)||boss.coreCarried&&!boss.bossDefeated||boss.coreReturned&&!boss.coreCarried)return null;
      if(s.boundary==='square'&&(boss.bossSegments!==0||boss.bossDefeated)||s.boundary==='boss'&&boss.bossDefeated||s.boundary==='core'&&(!boss.bossDefeated||boss.coreCarried)||s.boundary==='return-core'&&(!boss.coreCarried||boss.coreReturned)||s.boundary==='ending'&&!boss.coreReturned)return null;
    }
  }
  return {version:3,chapter:s.chapter as ActId,boundary:s.boundary as Boundary,healed:s.healed,firstWrapped:s.firstWrapped,disabledAnchors:[...s.disabledAnchors],clearedArenas:[...s.clearedArenas],activatedArenas:[...s.activatedArenas],defeatedEnemies:[...s.defeatedEnemies],...boss};
}
export function readCheckpoint():Checkpoint|null {
  notice='';try{const raw=localStorage.getItem(SAVE_KEY)??localStorage.getItem(LEGACY_V2_KEY)??localStorage.getItem(LEGACY_KEY);if(raw===null)return null;
    const value:unknown=JSON.parse(raw);const result=normalizeCheckpoint(value);if(!result)notice='Salvataggio non riconosciuto o danneggiato. Nuova partita riparte dal cortile; nessun dato è stato cancellato.';return result;
  }catch{notice='Salvataggio non disponibile o danneggiato. Puoi iniziare una partita senza persistenza.';return null;}
}
export const storageNotice=():string=>notice;
export function writeCheckpoint(save:Checkpoint):boolean {try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));return true;}catch{return false;}}
export function clearCheckpoint():boolean {let ok=true;for(const key of [SAVE_KEY,LEGACY_V2_KEY,LEGACY_KEY])try{localStorage.removeItem(key);}catch{ok=false;}return ok;}
export function readSettings():Settings {try{const s=JSON.parse(localStorage.getItem(PREFS)??'{}') as Partial<Settings>;return{master:volume(s.master,.7),music:volume(s.music,.3),effects:volume(s.effects,.65),reducedMotion:s.reducedMotion===true,aimAssist:s.aimAssist!==false};}catch{return{...defaultSettings};}}
function volume(n:unknown,fallback:number):number{return typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(1,n)):fallback;}
export function writeSettings(settings:Settings):void {try{localStorage.setItem(PREFS,JSON.stringify(settings));}catch{/* Preferences are optional. */}}
