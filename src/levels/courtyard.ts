import { Fog, Group, Vector3, type Box3, type Scene } from 'three';
import type { CameraOccluder, CourtyardWorld, Obstacle } from '../contracts';
import { addLighting, Batch, palette } from '../visual/style';
import { cameraProp, cameraRegion, compactCameraProp } from '../engine/camera-props';

export const ANCHORS = {
  playerStart: new Vector3(0, 0, 9), trainingDrone: new Vector3(-2, 0, 4),
  firstAnchor: new Vector3(0, 0, -9), briciola: new Vector3(-4, 0, 8),
  cabinWest: new Vector3(-10, 0, -3), cabinEast: new Vector3(10, 0, -6),
  crateWest: new Vector3(-7, 0, 6), crateEast: new Vector3(6, 0, 2),
  spawnWest: new Vector3(-9, 0, -10), spawnNorth: new Vector3(0, 0, -13),
  spawnEast: new Vector3(10, 0, -11), saucer: new Vector3(0, 8, -11),
  exitGate: new Vector3(0, 0, -14),
} as const;
export const OBSTACLES: readonly Obstacle[] = [
  { id: 'cabinWest', minX: -13, maxX: -7, minZ: -6, maxZ: 0 },
  { id: 'cabinEast', minX: 7, maxX: 13, minZ: -9, maxZ: -3 },
  { id: 'crateWest', minX: -8, maxX: -6, minZ: 5, maxZ: 7 },
  { id: 'crateEast', minX: 5, maxX: 7, minZ: 1, maxZ: 3 },
];

function cabin(b: Batch, x: number, z: number, workshop: boolean): void {
  b.shape('cube', 'cabin', [x, 1.65, z], [6, 3.3, 6]);
  // Roof/snow share a pitched silhouette, deliberately separated at their eaves.
  b.shape('roof', 'roof', [x, 4.15, z], [4.55, 1.8, 4.55], [0, Math.PI / 4, 0]);
  b.shape('roof', 'snow', [x, 4.3, z], [4.5, 1.75, 4.5], [0, Math.PI / 4, 0]);
  b.shape('cube', 'ink', [x, 1.12, z + 3.025], [1.22, 2.24, .05]);
  b.shape('ball', 'gold', [x + .4, 1, z + 3.08], [.065, .065, .065]);
  for (const dx of [-1.95, 1.95]) {
    b.shape('cube', 'cream', [x + dx, 1.9, z + 3.04], [1.34, 1.4, .08]);
    b.shape('cube', 'gold', [x + dx, 1.9, z + 3.09], [1.1, 1.16, .045]);
    b.shape('cube', 'roof', [x + dx, 1.9, z + 3.13], [.09, 1.18, .045]);
    b.shape('cube', 'roof', [x + dx, 1.9, z + 3.13], [1.12, .09, .045]);
    b.shape('ball', 'snow', [x + dx, 1.2, z + 3.1], [.8, .13, .22]);
  }
  b.shape('cube', 'timber', [x, 3.02, z + 3.12], [2, .48, .14]);
  if (workshop) {
    // Large geometric toy-hammer emblem, readable without tiny canvas lettering.
    b.shape('cube', 'gold', [x, 3.03, z + 3.21], [.12, .34, .06], [0, 0, -.45]);
    b.shape('cube', 'cream', [x - .04, 3.13, z + 3.22], [.47, .16, .07], [0, 0, -.45]);
  } else {
    b.shape('cube', 'purple', [x, 3.03, z + 3.22], [.4, .33, .07]);
    b.shape('cube', 'gold', [x, 3.03, z + 3.27], [.07, .34, .035]);
  }
  for (const dx of [-2.9, 2.9]) b.shape('cylinder', 'cream', [x + dx, 1.65, z + 2.94], [.11, 3.3, .11]);
  b.shape('cube', 'roof', [x + 1.7, 4.7, z - 1], [.6, 1.6, .65]);
  b.shape('ball', 'snow', [x + 1.7, 5.51, z - 1], [.43, .13, .44]);
}
function tree(b: Batch, x: number, z: number, scale: number): void {
  b.shape('cylinder', 'timber', [x, .35 * scale, z], [.16 * scale, .7 * scale, .16 * scale]);
  for (let i = 0; i < 3; i++) {
    const radius = (1.1 - i * .25) * scale;
    const y = (.95 + i * .7) * scale;
    b.shape('cone', 'green', [x, y, z], [radius, 1.55 * scale, radius]);
    b.shape('cone', 'snow', [x, y + .26 * scale, z], [radius * .86, 1.1 * scale, radius * .86]);
  }
}
function fence(b: Batch): void {
  // Solid visual closure at every playable boundary; no tempting open exits.
  for (const x of [-15.5, 15.5]) {
    for (let z = -15; z <= 13; z += 2) {
      b.shape('cylinder', 'timber', [x, .65, z], [.13, 1.3, .13]);
      b.shape('ball', 'snow', [x, 1.32, z], [.2, .13, .2]);
    }
    for (const y of [.45, .95]) b.shape('cube', 'timber', [x, y, -1], [.13, .13, 30]);
  }
  for (const z of [-15.5, 13.5]) {
    for (let x = -15; x <= 15; x += 2) b.shape('cylinder', 'timber', [x, .65, z], [.13, 1.3, .13]);
    for (const y of [.45, .95]) b.shape('cube', 'timber', [0, y, z], [31, .13, .13]);
  }
}
function gate(b: Batch): void {
  // Closed continuation gate: still closed at 1/3, arrow marks the future route.
  for (const x of [-2, 2]) {
    b.shape('cylinder', 'roof', [x, 1.8, -14.6], [.2, 3.6, .2]);
    b.shape('ball', 'snow', [x, 3.65, -14.6], [.3, .15, .3]);
  }
  for (let x = -1.6; x <= 1.61; x += .4) b.shape('cube', 'roof', [x, 1.15, -14.6], [.12, 2.3, .13]);
  b.shape('cube', 'roof', [0, 3.2, -14.6], [4.2, .7, .25]);
  b.shape('cube', 'gold', [0, 3.2, -14.44], [.15, .45, .06]);
  b.shape('cube', 'gold', [-.13, 3.28, -14.44], [.13, .32, .06], [0, 0, -.7]);
  b.shape('cube', 'gold', [.13, 3.28, -14.44], [.13, .32, .06], [0, 0, .7]);
}
function radio(b: Batch): void {
  const x = -4, z = 8;
  // Small, friendly inventor station, not a green/purple enemy silhouette.
  b.shape('cube', 'timber', [x, .35, z], [.85, .7, .65]);
  b.shape('cube', 'roof', [x, .95, z], [.75, .5, .45]);
  b.shape('cube', 'cream', [x - .16, .97, z + .24], [.25, .22, .035]);
  b.shape('ball', 'gold', [x + .2, .94, z + .25], [.07, .07, .04]);
  b.link('gold', [x + .2, 1.18, z], [x + .43, 1.9, z], .025);
  b.shape('ball', 'cream', [x + .43, 1.9, z], [.07, .07, .07]);
  // Elf cap and goggles laid beside the radio explain the maker without a target.
  b.shape('cone', 'red', [x - .7, .24, z], [.25, .48, .25], [0, 0, -.4]);
  for (const dx of [-.1, .1]) b.shape('ring', 'gold', [x + dx, .36, z + .41], [.08, .08, .08]);
}
export function createWorld(scene: Scene): CourtyardWorld {
  const root = new Group(); root.name = 'Cortile del laboratorio'; scene.add(root);
  const lights = addLighting(scene); root.add(lights);
  scene.fog = new Fog(palette.sky, 28, 65);
  const b = new Batch();
  const cameraOccluders: CameraOccluder[] = [];
  const sceneryRegions: Box3[] = [];
  b.shape('cube', 'snow', [0, -.16, -1], [32, .32, 30]);
  b.shape('cube', 'timber', [0, -.56, -1], [32, .48, 30]);
  for (const [name, x, z, workshop] of [['cabinWest', -10, -3, true], ['cabinEast', 10, -6, false]] as const) {
    const batch = new Batch(); cabin(batch, x, z, workshop);
    const prop = compactCameraProp(batch.build()); prop.name = name; root.add(prop);
    cameraOccluders.push(cameraProp(name, prop, [0, 1.7, 3.3, 3.6, 4, 4.4, 4.9, 5.7]));
  }
  for (const [x, z] of [[-7, 6], [6, 2]]) {
    const b = new Batch();
    b.shape('cube', 'timber', [x, .85, z], [2, 1.7, 2]);
    b.shape('cube', 'snow', [x, 1.77, z], [2, .14, 2]);
    for (const dx of [-.8, .8]) b.shape('cube', 'cream', [x + dx, .85, z + 1.025], [.13, 1.7, .05]);
    for (const y of [.18, 1.5]) b.shape('cube', 'cream', [x, y, z + 1.03], [1.75, .12, .05]);
    b.shape('cube', 'sack', [x, .85, z + 1.04], [2.1, .13, .07], [0, 0, .65]);
    const prop = compactCameraProp(b.build()); const name = x < 0 ? 'crateWest' : 'crateEast';
    prop.name = name; root.add(prop); cameraOccluders.push(cameraProp(name, prop, [0, .8, 1.7, 1.9]));
  }
  fence(b);
  const radioBatch = new Batch(); radio(radioBatch);
  const radioRoot = compactCameraProp(radioBatch.build()); radioRoot.name = 'courtyard-radio'; root.add(radioRoot);
  cameraOccluders.push(cameraProp('courtyard-radio', radioRoot, [0, .7, 1.2, 1.6, 2.1]));
  const gateBatch = new Batch(); gate(gateBatch);
  const gateRoot = compactCameraProp(gateBatch.build()); gateRoot.name = 'courtyard-gate'; root.add(gateRoot);
  cameraOccluders.push(cameraProp('courtyard-gate', gateRoot, [0, 1.5, 2.5, 3.8]));
  for (let i = 0; i < 9; i++) {
    const z = -18 + i * 4;
    tree(b, -18 - (i % 2), z, 1 + (i % 3) * .2);
    tree(b, 18 + (i % 2), z - 1, .95 + (i % 3) * .17);
    sceneryRegions.push(cameraRegion(-18 - (i % 2), z, 2, 2, 6), cameraRegion(18 + (i % 2), z - 1, 2, 2, 6));
  }
  for (const x of [-12, -6, 7, 13]) { tree(b, x, -20, 1.2); sceneryRegions.push(cameraRegion(x, -20, 2, 2, 6)); }
  // Banks are outside all playable ground, so no invisible bumps/colliders.
  for (let i = 0; i < 8; i++) {
    const z = -17 + i * 4.5;
    for (const side of [-1, 1]) b.shape('ball', 'snow', [side * 19, -.5, z], [3.5, 1.3 + (i % 2) * .4, 3]);
  }
  const environment = b.build(); environment.userData.cameraNoFade = true; root.add(environment);
  cameraOccluders.push(cameraProp('courtyard-background', environment, [0, 1.5, 2.5, 3.5, 5, 6], sceneryRegions));
  const saucer = new Batch()
    .shape('ball', 'purple', [0, 0, 0], [3.15, .42, 2.3])
    .shape('ball', 'roof', [0, .43, 0], [1.35, .76, 1.15])
    .shape('ball', 'ink', [0, -.27, 0], [1.7, .24, 1.3]);
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI / 5;
    saucer.shape('ball', 'glow', [Math.cos(a) * 2.65, .02, Math.sin(a) * 1.93], [.17, .1, .13]);
  }
  const ship = saucer.build(); ship.position.copy(ANCHORS.saucer); ship.name = 'Nave ancora sospesa a 8m'; root.add(ship);
  cameraOccluders.push(cameraProp('courtyard-ship', ship, [-.6, -.2, .2, .6, 1.3]));
  const portal = new Batch()
    .shape('ring', 'purple', [0, 0, 0], [3.7, 3.7, 3.7])
    .shape('ring', 'glow', [0, 0, .06], [3.38, 3.38, 3.38]).build();
  portal.position.set(0, 10, -18); root.add(portal);
  cameraOccluders.push(cameraProp('courtyard-portal', portal, [-4.1, -3, -2, -1, 0, 1, 2, 3, 4.1]));
  const anchor = new Group(); anchor.name = 'Primo ancoraggio'; anchor.position.copy(ANCHORS.firstAnchor); root.add(anchor);
  const pedestal = new Batch()
    .shape('cylinder', 'roof', [0, .14, 0], [.68, .28, .68])
    .shape('cylinder', 'purple', [0, .67, 0], [.34, 1.05, .34])
    .shape('ball', 'gold', [0, 1.22, 0], [.4, .14, .4]).build(); anchor.add(pedestal);
  // Open-frame beacon: strong silhouette, but no solid column concealing soldiers.
  const beacon = new Batch()
    .shape('ring', 'glow', [0, 2.45, 0], [.6, .6, .6])
    .shape('cube', 'glow', [0, 2.45, .02], [.1, .78, .1])
    .shape('cube', 'glow', [0, 2.14, .02], [.56, .1, .1])
    .shape('cube', 'glow', [-.23, 2.23, .02], [.1, .28, .1])
    .shape('cube', 'glow', [.23, 2.23, .02], [.1, .28, .1]).build(); anchor.add(beacon);
  const offSymbol = new Batch()
    .link('gold', [-.32, 2.4, 0], [-.06, 2.16, 0], .065)
    .link('gold', [-.06, 2.16, 0], [.38, 2.7, 0], .065).build();
  offSymbol.visible = false; anchor.add(offSymbol);
  const anchorOccluder = cameraProp('courtyard-anchor', anchor, [0, .5, 1.2, 1.8, 2.2, 2.7, 3.2], undefined, .065);
  cameraOccluders.push(anchorOccluder);
  return {
    root, anchor, cameraOccluders, obstacles: OBSTACLES.map(obstacle => ({ ...obstacle })),
    update(time, beat, reducedMotion) {
      const done = beat === 'complete';
      beacon.visible = !done; offSymbol.visible = done;
      beacon.position.y = reducedMotion ? 0 : Math.sin(time * 1.8) * .06;
      // No ship descent, portal shutdown or victory lighting at only 1/3.
      ship.position.y = 8; portal.position.y = 10;
    },
  };
}
