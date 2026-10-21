import type { ActDefinition } from '../contracts';

export default {
  id: 'courtyard', levelId: 'courtyard', title: 'Il cortile del laboratorio',
  start: { x: 0, z: 9 }, exit: { x: 0, z: -14 },
  anchors: [{ id: 'courtyard', name: 'Laboratorio', x: 0, z: -9 }],
  arenas: [],
} satisfies ActDefinition;
