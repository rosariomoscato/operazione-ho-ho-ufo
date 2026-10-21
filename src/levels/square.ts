import { Fog, Group, type Scene } from 'three';
import type { CourtyardWorld, Obstacle } from '../contracts';
import { squareLayout as layout } from '../acts/square';
import { addLighting, Batch, palette } from '../visual/style';
import { SquareBatch } from '../visual/square-batch';

export const id = 'square';
export const OBSTACLES: readonly Obstacle[] = [
  { id: 'square-tree', minX: 7.2, maxX: 8.8, minZ: -6.8, maxZ: -5.2 },
  { id: 'square-sled', minX: -11, maxX: -7, minZ: -8.5, maxZ: -5.5 },
];
type StoryState = 'battle' | 'core' | 'carrying' | 'ending';
const ease = (x: number): number => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };

function surroundings(): Group {
  const b = new SquareBatch()
    .shape('cube', 'snow', [0, -.15, -1], [32, .3, 30])
    .shape('cube', 'timber', [0, -.47, -1], [32, .34, 30]);
  // Shop roofs are outside the playable square: no camera tunnels or extra solids.
  for (const side of [-1, 1]) {
    for (const z of [-12, -3, 7]) {
      const x = side * 20;
      b.shape('cube', 'cabin', [x, 1.65, z], [5, 3.3, 5]);
      b.shape('roof', 'roof', [x, 4.05, z], [3.9, 1.6, 3.9], [0, Math.PI / 4, 0]);
      b.shape('roof', 'snow', [x, 4.21, z], [3.85, 1.52, 3.85], [0, Math.PI / 4, 0]);
      for (const dz of [-1.15, 1.15]) {
        b.shape('cube', 'gold', [x - side * 2.53, 1.85, z + dz], [.06, 1.1, 1.05]);
        b.shape('cube', 'roof', [x - side * 2.57, 1.85, z + dz], [.04, 1.12, .07]);
      }
      b.shape('cube', 'roof', [x - side * 2.53, 1.05, z], [.06, 2.1, .7]);
    }
    const x = side * 15.5;
    for (let z = -15; z <= 13; z += 3) {
      b.shape('cylinder', 'timber', [x, .6, z], [.12, 1.2, .12]);
      b.shape('cylinder', 'snow', [x, 1.23, z], [.17, .08, .17]);
    }
    for (const y of [.4, .9]) b.shape('cube', 'roof', [x, y, -1], [.12, .12, 30]);
    for (let i = 0; i < 3; i++) {
      const z = -17 + i * 14, tx = side * 25;
      b.shape('ball', 'snow', [side * 21, -.5, z], [4.8, 1.4, 4]);
      b.shape('cylinder', 'timber', [tx, .4, z], [.18, .8, .18]);
      for (let j = 0; j < 3; j++) {
        const radius = 1.5 - j * .32, y = 1.2 + j * .85;
        b.shape('cone', 'green', [tx, y, z], [radius, 1.9, radius]);
        b.shape('cone', 'snow', [tx, y + .32, z], [radius * .84, 1.25, radius * .84]);
      }
    }
  }
  for (const z of [-15.5, 13.5]) {
    for (const side of [-1, 1]) {
      for (const y of [.4, .9]) b.shape('cube', 'roof', [side * 8.75, y, z], [13.5, .12, .12]);
      for (let x = 2; x < 16; x += 3) b.shape('cylinder', 'timber', [x * side, .6, z], [.12, 1.2, .12]);
    }
    for (let x = -1.5; x <= 1.5; x += .5) b.shape('cube', 'roof', [x, .8, z], [.1, 1.6, .12]);
    b.shape('cube', 'roof', [0, 1.65, z], [4, .13, .14]);
  }
  return b.build();
}
function christmasTree(): { root: Group; accents: Group } {
  const root = new Group(); root.name = 'Albero della Stella Polare';
  const b = new SquareBatch()
    .shape('cube', 'timber', [0, 1.65, 0], [1.6, 3.3, 1.6]);
  // The lowest bough starts above Santa's hat; only the trunk blocks movement.
  for (let tier = 0; tier < 3; tier++) {
    const r = 2.6 - tier * .6, y = 4.5 + tier * 1.3;
    b.shape('cone', 'green', [0, y, 0], [r, 2.8, r]);
    for (let i = 0; i < 7; i++) {
      const a = i * Math.PI * 2 / 7 + tier * .35;
      b.shape('ball', i % 2 ? 'red' : 'gold', [Math.cos(a) * r * .72, y - .65, Math.sin(a) * r * .72], [.14, .17, .14]);
    }
    // Chunky gold garland near the conical surface, small accents not real lights.
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      b.shape('ball', 'gold', [Math.cos(a) * r * .55, y - .15, Math.sin(a) * r * .55], [.075, .075, .075]);
    }
  }
  // Empty cream socket and topper: never a second 3D core, even after ending.
  b.shape('ring', 'cream', [0, 1.5, .825], [.34, .34, .34]);
  b.shape('ring', 'gold', [0, 8.65, 0], [.36, .36, .36]);
  root.add(b.build());
  const a = new SquareBatch();
  for (let i = 0; i < 9; i++) {
    const angle = i * Math.PI * 2 / 9;
    const tier = i % 3, r = (2.6 - tier * .6) * .66;
    a.shape('ball', 'glow', [Math.cos(angle) * r, 4.05 + tier * 1.3, Math.sin(angle) * r], [.075, .075, .075]);
  }
  // Socket receives only a thin rim, not a luminous replacement core.
  a.shape('ring', 'glow', [0, 1.5, .86], [.29, .29, .29]);
  const accents = a.build(); accents.visible = false; root.add(accents);
  return { root, accents };
}
function deliveriesSled(): Group {
  const b = new SquareBatch()
    // Body, runners and reindeer occupy the agreed 4x3m collider footprint.
    .shape('cube', 'red', [0, .55, .55], [4, .8, 1.9])
    .shape('cube', 'gold', [0, .99, .55], [4, .08, 1.9])
    .shape('cube', 'cream', [0, 1.2, 1.3], [3.4, .4, .3]);
  for (const x of [-1.7, 1.7]) {
    b.shape('cube', 'gold', [x, .12, 0], [.18, .24, 3]);
    b.shape('ring', 'gold', [x, .45, -1.1], [.36, .36, .36], [0, Math.PI / 2, 0]);
  }
  for (const x of [-.85, .85]) {
    const z = -.9;
    b.shape('ball', 'timber', [x, .88, z], [.27, .31, .43]);
    b.shape('ball', 'timber', [x, 1.3, z - .28], [.21, .25, .2]);
    b.shape('ball', 'cream', [x, 1.22, z - .44], [.17, .12, .12]);
    b.shape('ball', 'red', [x, 1.25, z - .55], [.07, .07, .06]);
    for (const dx of [-.14, .14]) b.shape('ball', 'ink', [x + dx, 1.36, z - .43], [.035, .04, .025]);
    for (const dx of [-.17, .17]) {
      for (const dz of [-.22, .22]) b.shape('cylinder', 'timber', [x + dx, .35, z + dz], [.055, .7, .055]);
      b.link('gold', [x + dx * .6, 1.48, z - .3], [x + dx, 1.85, z - .22], .035);
      b.link('gold', [x + dx * .8, 1.62, z - .26], [x + dx * 1.6, 1.73, z - .37], .03);
      b.shape('ball', 'cream', [x + dx, 1.42, z - .27], [.12, .07, .06]);
    }
    b.link('gold', [x, .9, z + .25], [x, .95, .15], .025);
  }
  const sled = b.build(); sled.name = 'Slitta delle consegne'; return sled;
}
function ship(): Group {
  const b = new Batch()
    .shape('ball', 'purple', [0, -.28, 0], [3.1, .34, 1.9])
    // Rear dome leaves the foreground parcel entirely unobstructed.
    .shape('ball', 'roof', [0, .2, -1], [1.25, .75, 1.1])
    .shape('cube', 'purple', [0, .1, .8], [1.6, .3, 1.2])
    .shape('cube', 'cream', [0, .31, .8], [1.8, .18, 1.4]);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    b.shape('cylinder', 'glow', [Math.cos(a) * 2.6, -.07, Math.sin(a) * 1.5], [.12, .1, .12]);
  }
  const root = b.build(); root.name = 'Nave di Squamakk';
  root.userData.parcelSupport = { center: { x: 0, y: .4, z: .8 }, width: 1.8, depth: 1.4 };
  return root;
}
export function createWorld(scene: Scene): CourtyardWorld {
  const root = new Group(); root.name = 'La piazza della Stella Polare'; scene.add(root);
  root.add(addLighting(scene)); scene.fog = new Fog(palette.sky, 35, 78);
  root.add(surroundings());
  const tree = christmasTree(); tree.root.position.set(layout.tree.x, 0, layout.tree.z); root.add(tree.root);
  const sled = deliveriesSled(); sled.position.set(layout.sled.x, 0, layout.sled.z); root.add(sled);
  const saucer = ship(); saucer.position.set(layout.ship.x, layout.ship.y, layout.ship.z); root.add(saucer);
  const portal = new Batch()
    .shape('ring', 'purple', [0, 0, 0], [3.5, 3.5, 3.5])
    .shape('ring', 'glow', [0, 0, .06], [3.2, 3.2, 3.2]).build();
  portal.name = 'Portale alieno'; portal.position.set(0, 6, -19); root.add(portal);
  const anchor = new Group(); anchor.name = 'Nessun altro ancoraggio'; root.add(anchor);
  let story: StoryState = 'battle';
  let endingStart = 0;
  return {
    root, anchor, obstacles: OBSTACLES.map(item => ({ ...item })),
    setStoryState(next, time) {
      if (next !== story) { endingStart = next === 'ending' ? time : 0; story = next; }
    },
    update(time, _beat, reducedMotion) {
      const ending = story === 'ending', elapsed = time - endingStart;
      const withdraw = ending ? ease((elapsed - 2.5) / 2.5) : 0;
      const departure = ending ? ease((elapsed - 5) / 3) : 0;
      tree.accents.visible = ending && elapsed >= 0;
      tree.accents.scale.setScalar(1);
      saucer.visible = withdraw < 1;
      saucer.scale.setScalar(1 - withdraw);
      saucer.position.set(layout.ship.x, layout.ship.y + withdraw * (reducedMotion ? .12 : 1.6), layout.ship.z - withdraw * (reducedMotion ? .3 : 6));
      portal.visible = withdraw < 1; portal.scale.setScalar(1 - withdraw);
      portal.position.set(0, 6, -19);
      sled.visible = departure < 1; sled.scale.setScalar(1 - departure);
      sled.position.set(layout.sled.x - departure * (reducedMotion ? 0 : 4), departure * (reducedMotion ? .15 : 3), layout.sled.z - departure * (reducedMotion ? .4 : 10));
    },
  };
}
