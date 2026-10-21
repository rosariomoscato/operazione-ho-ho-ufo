import type { ActDefinition } from '../contracts';

export default {
  id: 'toystreet', levelId: 'toystreet', title: 'La via dei giocattoli',
  start: { x: 0, z: 10 }, exit: { x: 0, z: -13.5 },
  anchors: [
    { id: 'workshop', name: 'Officina dei trenini', x: -8, z: -9, arenaId: 'workshop' },
    { id: 'carousel', name: 'Giostra dei regali', x: 8, z: -9, arenaId: 'carousel' },
  ],
  arenas: [
    { id: 'workshop', name: 'Officina', x: -8, z: -4, radius: 5.5,
      enemies: [{ kind: 'ranged', x: -11, z: -5 }, { kind: 'ranged', x: -7, z: -8 }, { kind: 'ranged', x: -4.5, z: -10.5 }] },
    { id: 'carousel', name: 'Giostra', x: 8, z: -4, radius: 5.5,
      enemies: [{ kind: 'melee', x: 5, z: -5 }, { kind: 'melee', x: 10, z: -7 }, { kind: 'melee', x: 6, z: -10.5 }] },
  ],
} satisfies ActDefinition;
