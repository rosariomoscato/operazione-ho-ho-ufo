import type { Group, Scene, Vector3 } from 'three';

export type Beat = 'intro' | 'training' | 'battle' | 'anchor' | 'complete' | 'street' | 'street-complete' | 'square' | 'boss' | 'core' | 'return-core' | 'ending';
export interface Obstacle { id: string; minX: number; maxX: number; minZ: number; maxZ: number }
export interface VisualActor {
  root: Group;
  update(time: number, moving: boolean, attacking: boolean): void;
  floorError(): number;
}
export interface CourtyardWorld {
  root: Group;
  anchor: Group;
  obstacles: Obstacle[];
  anchors?: Record<string, Group>;
  setAnchors?(disabled: readonly string[], time: number): void;
  setStoryState?(state: 'battle' | 'core' | 'carrying' | 'ending', time: number): void;
  update(time: number, beat: Beat, reducedMotion: boolean): void;
}
export interface AudioSettings { master: number; music: number; effects: number }
export interface GameAudio {
  init(): Promise<void>;
  unlock(): Promise<void>;
  music(id: 'music.village' | 'music.combat'): void;
  effect(id: string, position?: Vector3): void;
  setVolumes(settings: AudioSettings): void;
  pause(): void;
  resume(): void;
  stop(): void;
  stats(): { loaded: boolean; activeEffects: number; error: string | null };
}
export type CreateWorld = (scene: Scene) => CourtyardWorld;

export type ActId = 'courtyard' | 'toystreet' | 'square';
export interface ActAnchor { id: string; name: string; x: number; z: number; arenaId?: string }
export interface ActEnemy { kind: 'melee' | 'ranged'; x: number; z: number }
export interface ActArena { id: string; name: string; x: number; z: number; radius: number; enemies: ActEnemy[] }
export interface ActDefinition {
  id: ActId; levelId: string; title: string;
  start: { x: number; z: number }; exit: { x: number; z: number };
  anchors: ActAnchor[]; arenas: ActArena[];
}
