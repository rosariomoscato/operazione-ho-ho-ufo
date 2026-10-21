import type { ActDefinition } from '../contracts';

export const squareLayout = {
  boss: { x: 0, z: -8 },
  core: { x: 0, z: -6.2 },
  tree: { x: 8, z: -6 },
  treeInteraction: { x: 8, z: -4.4 },
  sled: { x: -9, z: -7 },
  ship: { x: 0, y: 4.4, z: -12 },
  parcelOnShip: { x: 0, y: 4.8, z: -11.2 },
  encounter: { x: 0, z: 2, radius: 4.5 },
} as const;

export default {
  id: 'square', levelId: 'square', title: 'La piazza dell’albero',
  start: { x: 0, z: 10 }, exit: { x: 0, z: -13.5 },
  anchors: [], arenas: [],
} satisfies ActDefinition;
