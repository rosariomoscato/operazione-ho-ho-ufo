import type { AudioSettings } from './contracts';
export interface Checkpoint { version: 1; boundary: 'training' | 'A' | 'B' | 'C' | 'anchor' | 'complete'; healed: boolean; firstWrapped: boolean }
export interface Settings extends AudioSettings { reducedMotion: boolean; aimAssist: boolean }
const SAVE = 'ho-ho-ufo.checkpoint.v1', PREFS = 'ho-ho-ufo.settings.v1';
export const defaultSettings: Settings = {master:.7,music:.3,effects:.65,reducedMotion:false,aimAssist:true};
export function readCheckpoint(): Checkpoint | null {
  try { const s: unknown = JSON.parse(localStorage.getItem(SAVE) ?? 'null');
    if (s && typeof s==='object' && 'version' in s && s.version===1 && 'boundary' in s && ['training','A','B','C','anchor','complete'].includes(String(s.boundary)) && 'healed' in s && typeof s.healed==='boolean' && 'firstWrapped' in s && typeof s.firstWrapped==='boolean') return s as Checkpoint;
  } catch { /* Private browsing / corrupt data must not prevent play. */ } return null;
}
export function writeCheckpoint(save: Checkpoint): boolean { try {localStorage.setItem(SAVE,JSON.stringify(save));return true;} catch {return false;} }
export function clearCheckpoint(): boolean {try {localStorage.removeItem(SAVE);return true;}catch{return false;}}
export function readSettings(): Settings {try {const s=JSON.parse(localStorage.getItem(PREFS)??'{}') as Partial<Settings>;return {master:volume(s.master,.7),music:volume(s.music,.3),effects:volume(s.effects,.65),reducedMotion:s.reducedMotion===true,aimAssist:s.aimAssist!==false};}catch{return {...defaultSettings};}}
function volume(n: unknown, fallback: number): number {return typeof n==='number' && Number.isFinite(n)?Math.max(0,Math.min(1,n)):fallback;}
export function writeSettings(settings: Settings): void {try{localStorage.setItem(PREFS,JSON.stringify(settings));}catch{/* Non essential preferences. */}}
