import type { Vector3 } from 'three';

export interface GameplayCameraResult {
  position: Vector3;
  look: Vector3;
  distance: number;
  compressed: boolean;
  occluded: string[];
}
