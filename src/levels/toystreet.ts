import { Fog, Group, type Box3, type Scene } from 'three';
import type { CameraOccluder, CourtyardWorld, Obstacle } from '../contracts';
import act from '../acts/toystreet';
import { addLighting, Batch, palette } from '../visual/style';
import { cameraProp, cameraRegion, compactCameraProp } from '../engine/camera-props';

export const id = 'toystreet';
export const OBSTACLES: readonly Obstacle[] = [
  { id: 'street-west-shop', minX: -14, maxX: -10, minZ: -1, maxZ: 4 },
  { id: 'street-east-shop', minX: 10, maxX: 14, minZ: -1, maxZ: 4 },
  { id: 'street-train-cover', minX: -10, maxX: -6, minZ: -2, maxZ: -.5 },
  { id: 'street-carousel-cover', minX: 6, maxX: 10, minZ: -2, maxZ: -.5 },
];

function shops(b: Batch, side: number): void {
    const x = side * 12;
    b.shape('cube', side < 0 ? 'cabin' : 'purple', [x, 1.55, 1.5], [4, 3.1, 5]);
    b.shape('roof', 'roof', [x, 3.7, 1.5], [3.1, 1.25, 3.8], [0, Math.PI / 4, 0]);
    b.shape('roof', 'snow', [x, 3.84, 1.5], [3.04, 1.18, 3.74], [0, Math.PI / 4, 0]);
    // Facades face the free central street, not the north fighting space.
    const facade = x - side * 2;
    b.shape('cube', 'ink', [facade - side * .03, 1.05, 2.65], [.06, 2.1, 1.05]);
    b.shape('cube', 'cream', [facade - side * .05, 1.68, .4], [.1, 1.38, 1.85]);
    b.shape('cube', 'gold', [facade - side * .11, 1.68, .4], [.05, 1.12, 1.59]);
    b.shape('cube', 'roof', [facade - side * .15, 1.68, .4], [.04, .09, 1.62]);
    b.shape('cube', 'roof', [facade - side * .15, 1.68, .4], [.04, 1.14, .09]);
    // Shallow festive stripes and a scalloped-style awning stay above head height.
    for (let i = 0; i < 6; i++) b.shape('cube', i % 2 ? 'cream' : 'red', [facade - side * .28, 2.62, -.25 + i * .58], [.65, .13, .58], [0, 0, side * .12]);
    b.shape('cube', 'timber', [facade - side * .08, 3.03, 1.5], [.12, .52, 2.15]);
    if (side < 0) {
      b.shape('cube', 'gold', [facade - side * .16, 3.04, 1.5], [.06, .19, .7]);
      for (const dz of [-.22, .22]) b.shape('cylinder', 'cream', [facade - side * .2, 2.94, 1.5 + dz], [.075, .06, .075], [0, 0, Math.PI / 2]);
    } else {
      b.shape('cube', 'purple', [facade - side * .16, 3.05, 1.5], [.07, .31, .42]);
      b.shape('cube', 'gold', [facade - side * .21, 3.05, 1.5], [.035, .33, .07]);
    }
}

function covers(b: Batch, side: number): void {
  if (side < 0) {
  // Continuous chassis backs each visible cover, matching the full AABB to y=1.6.
  b.shape('cube', 'red', [-8, .8, -1.25], [4, 1.6, 1.5]);
  b.shape('cube', 'timber', [-8, .57, -1.25], [4.01, .13, 1.52]);
  b.shape('cube', 'roof', [-6.65, 1.25, -1.25], [1.1, .7, 1.54]);
  b.shape('cube', 'gold', [-6.65, 1.28, -.46], [.6, .38, .03]);
  b.shape('cube', 'cream', [-8.55, 1.15, -.48], [1.85, .12, .06]);
  b.shape('cube', 'snow', [-6.65, 1.64, -1.25], [1.1, .08, 1.5]);
  b.shape('cylinder', 'gold', [-9.35, 1.7, -1.25], [.15, .28, .15]);
  for (const x of [-9.35, -8.15, -6.65]) for (const z of [-1.98, -.52]) {
    b.shape('cylinder', 'ink', [x, .36, z], [.31, .08, .31], [Math.PI / 2, 0, 0]);
    b.shape('cylinder', 'gold', [x, .36, z + (z < -1 ? -.045 : .045)], [.12, .03, .12], [Math.PI / 2, 0, 0]);
  }
  } else {
  // Package carousel is a closed static toy counter, not a rideable platform.
  b.shape('cube', 'purple', [8, .8, -1.25], [4, 1.6, 1.5]);
  b.shape('cube', 'cream', [8, .18, -1.25], [4.02, .16, 1.52]);
  for (let i = 0; i < 4; i++) {
    const x = 6.5 + i;
    b.shape('cube', i % 2 ? 'green' : 'red', [x, 1.1, -.47], [.72, .73, .06]);
    b.shape('cube', 'gold', [x, 1.1, -.425], [.1, .76, .025]);
  }
  b.shape('cube', 'gold', [8, 1.62, -1.25], [4, .04, 1.5]);
  }
}

function borders(b: Batch): void {
  for (const side of [-1, 1]) {
    const x = side * 15.5;
    for (let z = -15; z <= 13; z += 2.5) {
      b.shape('cylinder', 'timber', [x, .65, z], [.12, 1.3, .12]);
      b.shape('cylinder', 'snow', [x, 1.32, z], [.16, .08, .16]);
    }
    for (const y of [.45, 1]) b.shape('cube', 'cream', [x, y, -1], [.12, .12, 30]);
    // Three-tier vinyl trees outside gameplay bounds; no costly snowball fences.
    for (let i = 0; i < 5; i++) {
      const z = -18 + i * 7;
      const tx = side * (18 + i % 2);
      b.shape('cylinder', 'timber', [tx, .35, z], [.17, .7, .17]);
      for (let tier = 0; tier < 3; tier++) {
        const r = 1.2 - tier * .27, y = 1.1 + tier * .75;
        b.shape('cone', 'green', [tx, y, z], [r, 1.7, r]);
        b.shape('cone', 'snow', [tx, y + .3, z], [r * .83, 1.13, r * .83]);
      }
      b.shape('ball', 'snow', [side * 20, -.5, z + 2], [4, 1.3, 4]);
    }
  }
  for (const z of [-15.5, 13.5]) {
    for (const side of [-1, 1]) {
      // A closed, signed gate replaces invisible limits at both street ends.
      for (const y of [.45, 1]) b.shape('cube', 'cream', [side * 8.75, y, z], [13.5, .12, .12]);
      for (let x = 2; x <= 15; x += 2.5) b.shape('cylinder', 'timber', [side * x, .65, z], [.12, 1.3, .12]);
    }
  }
  for (let x = -1.6; x <= 1.61; x += .4) b.shape('cube', 'roof', [x, 1.05, 13.5], [.1, 2.1, .12]);
  b.shape('cube', 'roof', [0, 2.15, 13.5], [4.1, .14, .14]);
}

/** The large carousel silhouette lives beyond the east fence, never in a path. */
function backdrop(b: Batch): void {
  b.shape('cylinder', 'purple', [21, .28, -8], [2.7, .56, 2.7]);
  b.shape('cylinder', 'gold', [21, 2, -8], [.13, 3.2, .13]);
  b.shape('cone', 'red', [21, 3.8, -8], [3, 1.4, 3]);
  b.shape('cone', 'snow', [21, 4, -8], [2.8, 1.2, 2.8]);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5, x = 21 + Math.cos(a) * 1.9, z = -8 + Math.sin(a) * 1.9;
    b.shape('cylinder', 'cream', [x, 1.8, z], [.055, 2.8, .055]);
    b.shape('cube', i % 2 ? 'green' : 'purple', [x, .95, z], [.75, .7, .65]);
    b.shape('cube', 'gold', [x, .95, z + .335], [.1, .72, .03]);
  }
  // Distant toy-city roofline beyond the exit frames the pending M3 square.
  for (const x of [-10, -5, 5, 10]) {
    b.shape('cube', 'cabin', [x, 1.4, -25], [3, 2.8, 3]);
    b.shape('roof', 'snow', [x, 3.3, -25], [2.3, 1.2, 2.3], [0, Math.PI / 4, 0]);
    b.shape('cube', 'gold', [x, 1.7, -23.48], [.8, .85, .04]);
  }
}

function beacon(kind: string): { root: Group; on: Group; off: Group } {
  const root = new Group();
  root.add(new Batch()
    .shape('cylinder', 'roof', [0, .09, 0], [.5, .18, .5])
    .shape('cylinder', 'purple', [0, .57, 0], [.22, .95, .22]).build());
  const icon = new Batch().shape('ring', 'glow', [0, 2.2, 0], [.68, .68, .68]);
  if (kind === 'workshop') {
    icon.shape('cube', 'gold', [-.08, 2.2, .03], [.63, .23, .1])
      .shape('cube', 'gold', [.22, 2.37, .03], [.22, .35, .1]);
    for (const x of [-.22, .2]) icon.shape('cylinder', 'gold', [x, 2.02, .03], [.09, .12, .09], [Math.PI / 2, 0, 0]);
  } else {
    icon.shape('cube', 'gold', [0, 2.2, .02], [.57, .46, .09])
      .shape('cube', 'purple', [0, 2.2, .08], [.08, .48, .035]);
    for (const x of [-.13, .13]) icon.shape('ring', 'gold', [x, 2.5, .03], [.115, .085, .08]);
  }
  const on = icon.build(); root.add(on);
  const off = new Batch().link('gold', [-.3, 2.2, 0], [-.06, 1.97, 0], .065)
    .link('gold', [-.06, 1.97, 0], [.37, 2.56, 0], .065).build();
  off.visible = false; root.add(off); return { root, on, off };
}

export function createWorld(scene: Scene): CourtyardWorld {
  const root = new Group(); root.name = 'La via dei giocattoli'; scene.add(root);
  root.add(addLighting(scene)); scene.fog = new Fog(palette.sky, 32, 72);
  const b = new Batch();
  const cameraOccluders: CameraOccluder[] = [];
  const sceneryRegions: Box3[] = [];
  b.shape('cube', 'snow', [0, -.15, -1], [32, .3, 30]);
  b.shape('cube', 'timber', [0, -.47, -1], [32, .34, 30]);
  for (const side of [-1, 1]) {
    for (const kind of ['shop', 'cover'] as const) {
      const batch = new Batch(); if (kind === 'shop') shops(batch, side); else covers(batch, side);
      const prop = compactCameraProp(batch.build()); root.add(prop);
      const name = kind === 'shop' ? `street-${side < 0 ? 'west' : 'east'}-shop` : `street-${side < 0 ? 'train' : 'carousel'}-cover`;
      prop.name = name;
      cameraOccluders.push(cameraProp(name, prop, kind === 'shop' ? [0, 1.5, 2.5, 3.1, 3.4, 3.7, 4.1, 4.5] : [0, .8, 1.6, 1.9]));
    }
    for (let i = 0; i < 5; i++) sceneryRegions.push(cameraRegion(side * (18 + i % 2), -18 + i * 7, 1.6, 1.6, 4.6));
  }
  borders(b); backdrop(b);
  sceneryRegions.push(cameraRegion(21, -8, 3.4, 3.4, 4.8));
  for (const x of [-10, -5, 5, 10]) sceneryRegions.push(cameraRegion(x, -25, 2, 2, 4.2));
  const gateBatch = new Batch();
  // Simple arrow gate at the actual act exit. Bars stay closed: M2 ends here.
  for (const side of [-1, 1]) gateBatch.shape('cylinder', 'roof', [side * 2, 1.75, act.exit.z - .6], [.17, 3.5, .17]);
  gateBatch.shape('cube', 'roof', [0, 3.05, act.exit.z - .6], [4.15, .65, .2]);
  gateBatch.shape('cube', 'gold', [0, 3.05, act.exit.z - .475], [.12, .42, .04]);
  for (const side of [-1, 1]) gateBatch.shape('cube', 'gold', [side * .11, 3.13, act.exit.z - .475], [.1, .28, .04], [0, 0, side * .7]);
  for (let x = -1.6; x <= 1.61; x += .4) gateBatch.shape('cube', 'roof', [x, 1.1, act.exit.z - .6], [.1, 2.2, .12]);
  const gateRoot = compactCameraProp(gateBatch.build()); gateRoot.name = 'street-gate'; root.add(gateRoot);
  cameraOccluders.push(cameraProp('street-gate', gateRoot, [0, 1.5, 2.5, 3.6]));
  // Three stars describe all anchors, not boss defeat or a closed portal.
  b.shape('ring', 'purple', [0, 10, -26], [3.3, 3.3, 3.3]);
  b.shape('ring', 'glow', [0, 10, -25.94], [3, 3, 3]);
  const environment = b.build(); environment.userData.cameraNoFade = true; root.add(environment);
  cameraOccluders.push(cameraProp('street-background', environment, [0, 1.5, 2.5, 3.5, 4.8], sceneryRegions));
  const rigs = new Map(act.anchors.map(position => {
    const rig = beacon(position.id); rig.root.position.set(position.x, 0, position.z);
    rig.root.name = position.name; root.add(rig.root);
    const occluder = cameraProp(`street-anchor-${position.id}`, rig.root, [0, .5, 1.2, 1.8, 2.2, 2.7, 3], undefined, .05);
    cameraOccluders.push(occluder);
    return [position.id, rig] as const;
  }));
  const anchors = Object.fromEntries([...rigs].map(([key, rig]) => [key, rig.root]));
  const shipBatch = new Batch()
    .shape('ball', 'purple', [0, 0, 0], [3.1, .42, 2.2])
    .shape('ball', 'roof', [0, .43, 0], [1.3, .7, 1.08])
    .shape('ball', 'roof', [0, -.3, 0], [1.6, .2, 1.3]);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    shipBatch.shape('cylinder', 'glow', [Math.cos(a) * 2.55, .05, Math.sin(a) * 1.8], [.14, .08, .14]);
  }
  const ship = shipBatch.build(); ship.position.set(0, 8, -20); ship.name = 'Nave verso la piazza'; root.add(ship);
  cameraOccluders.push(cameraProp('street-ship', ship, [-.6, -.2, .2, .6, 1.3]));
  let disabled = new Set<string>();
  let descentStart: number | null = null;
  return {
    root, anchor: anchors.workshop!, anchors, cameraOccluders, obstacles: OBSTACLES.map(item => ({ ...item })),
    setAnchors(ids, time) {
      const next = new Set(ids.filter(key => rigs.has(key)));
      const both = next.size === rigs.size;
      if (both && disabled.size !== rigs.size) descentStart = time;
      if (!both) descentStart = null;
      disabled = next;
      for (const [key, rig] of rigs) {
        rig.on.visible = !disabled.has(key); rig.off.visible = disabled.has(key);
      }
    },
    update(time, _beat, reducedMotion) {
      for (const [key, rig] of rigs) {
        rig.on.visible = !disabled.has(key); rig.off.visible = disabled.has(key);
        rig.on.position.y = reducedMotion ? 0 : Math.sin(time * 1.8) * .045;
      }
      const t = descentStart === null ? 0 : Math.max(0, Math.min(1, (time - descentStart) / 3));
      // Seek-safe: no integration, accumulated delta, random values or material edits.
      ship.position.y = 8 - 5 * t * t * (3 - 2 * t);
    },
  };
}
