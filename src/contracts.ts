import type { Group, Scene, Vector3 } from 'three';

export type Beat = 'intro' | 'training' | 'battle' | 'anchor' | 'complete';
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
