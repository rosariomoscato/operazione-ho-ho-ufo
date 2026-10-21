import { Box3, Material, Matrix4, Mesh, Vector3 } from 'three';
import type { CameraOccluder, CourtyardWorld } from '../contracts';
import type { Point } from './math';
import type { GameplayCameraResult } from './camera-contract';

export const CAMERA_RADIUS = .25;
const MARGIN = CAMERA_RADIUS + .02;
const AXES = ['x', 'y', 'z'] as const;
const UP = new Vector3(0, 1, 0);
const MIN_HALF_FOV_TAN = Math.tan(Math.PI / 8); // gameplay FOV >=45 degrees
interface LocalMaterial { mesh: Mesh; original: Material | Material[]; faded: Material | Material[] }
interface Entry { source: CameraOccluder; boxes: Box3[]; envelope: Box3; matrix: Matrix4; initialized: boolean; visible: boolean; materials: LocalMaterial[]; active: boolean; strength: number; canFade: boolean }
interface LastPose { x: number; z: number; yaw: number; pitch: number; version: number; result: GameplayCameraResult }
interface Cache { entries: Entry[]; visible: Entry[]; version: number; last?: LastPose }
const caches = new WeakMap<CourtyardWorld, Cache>();
function copyResult(result: GameplayCameraResult): GameplayCameraResult {
  return { ...result, position: result.position.clone(), look: result.look.clone(), occluded: [...result.occluded] };
}
function prepare(world: CourtyardWorld): Cache {
  let cache = caches.get(world); if (cache) return cache;
  // Legacy callers without visual metadata still get endpoint safety. New worlds
  // always supply measured 3D metadata, including roofs and foliage.
  const sources = world.cameraOccluders ?? world.obstacles.map(obstacle => ({
    id: `legacy:${obstacle.id}`, root: world.root,
    bounds: [new Box3(new Vector3(obstacle.minX, 0, obstacle.minZ), new Vector3(obstacle.maxX, 5.7, obstacle.maxZ))],
  }));
  const entries = sources.map(source => ({ source, boxes: source.bounds.map(() => new Box3()), envelope: new Box3(), matrix: new Matrix4(), initialized: false, visible: false, materials: [], active: false, strength: 0, canFade: !!world.cameraOccluders && source.root.userData.cameraNoFade !== true })) as Entry[];
  cache = { entries, visible: [], version: 0 }; caches.set(world, cache); return cache;
}
function visible(entry: Entry): boolean {
  for (let node: import('three').Object3D | null = entry.source.root; node; node = node.parent) if (!node.visible) return false;
  return true;
}
function updateBounds(cache: Cache): Entry[] {
  let changed = false, visibilityChanged = false;
  for (const entry of cache.entries) {
    const shown = visible(entry);
    if (shown !== entry.visible) { entry.visible = shown; changed = visibilityChanged = true; }
    if (!shown) continue;
    entry.source.root.updateWorldMatrix(true, false);
    if (entry.initialized && entry.matrix.equals(entry.source.root.matrixWorld)) continue;
    entry.matrix.copy(entry.source.root.matrixWorld); entry.initialized = true; changed = true;
    entry.envelope.makeEmpty();
    const bounds = entry.source.bounds, worldSpace = entry.source.root.userData.cameraBoundsSpace === 'world';
    entry.boxes.forEach((box, i) => {
      box.copy(bounds[i]); if (!worldSpace) box.applyMatrix4(entry.matrix);
      box.expandByScalar(MARGIN); entry.envelope.union(box);
    });
  }
  if (visibilityChanged) cache.visible = cache.entries.filter(entry => entry.visible);
  if (changed) cache.version++;
  return cache.visible;
}
function segmentHits(from: Vector3, to: Vector3, box: Box3): boolean {
  let lo = 0, hi = 1;
  for (const axis of AXES) {
    const d = to[axis] - from[axis];
    if (Math.abs(d) < 1e-10) { if (from[axis] < box.min[axis] || from[axis] > box.max[axis]) return false; }
    else {
      const a = (box.min[axis] - from[axis]) / d, b = (box.max[axis] - from[axis]) / d;
      lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b));
      if (lo > hi) return false;
    }
  }
  return hi > .015 && lo < .999;
}
function segmentOverlap(from: Vector3, to: Vector3, box: Box3): number {
  let lo = 0, hi = 1;
  for (const axis of AXES) {
    const d = to[axis] - from[axis];
    if (Math.abs(d) < 1e-10) { if (from[axis] < box.min[axis] || from[axis] > box.max[axis]) return 0; }
    else {
      const a = (box.min[axis] - from[axis]) / d, b = (box.max[axis] - from[axis]) / d;
      lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b));
      if (lo > hi) return 0;
    }
  }
  return Math.max(0, hi - lo) * from.distanceTo(to);
}
function fade(entry: Entry, on: boolean, strength = 1): void {
  if (!entry.canFade || (entry.active === on && (!on || entry.strength === strength))) return;
  if (on && entry.materials.length === 0) entry.source.root.traverse(child => {
    if (!(child instanceof Mesh)) return;
    const clone = (original: Material): Material => {
      const material = original.clone(); material.transparent = true;
      material.opacity = Math.min(original.opacity, .16); material.depthWrite = false; return material;
    };
    const original = child.material;
    const faded = Array.isArray(original) ? original.map(clone) : clone(original);
    entry.materials.push({ mesh: child, original, faded });
  });
  for (const item of entry.materials) {
    if (on) {
      const originals = Array.isArray(item.original) ? item.original : [item.original];
      const faded = Array.isArray(item.faded) ? item.faded : [item.faded];
      faded.forEach((material, i) => { const opacity = originals[i].opacity; material.opacity = opacity + (Math.min(opacity, .16) - opacity) * strength; });
    }
    item.mesh.material = on ? item.faded : item.original;
  }
  entry.active = on; entry.strength = on ? strength : 0;
}
export function resetCameraOcclusion(world: CourtyardWorld): void {
  const cache = caches.get(world); if (cache) { for (const entry of cache.entries) fade(entry, false); cache.last = undefined; }
}
export function disposeCameraOcclusion(world: CourtyardWorld): void {
  const cache = caches.get(world); if (!cache) return;
  resetCameraOcclusion(world);
  for (const entry of cache.entries) for (const item of entry.materials) {
    for (const material of Array.isArray(item.faded) ? item.faded : [item.faded]) material.dispose();
  }
  caches.delete(world);
}

/** Stable geometry-only solver: no clock/spring, no yaw mutation, no triangle scan.
 * First retain the normal boom with local transparency if its endpoint is clear.
 * If the endpoint is solid, try small shoulders/lengths/heights at unchanged yaw.
 */
export function resolveGameplayCamera(world: CourtyardWorld, player: Point, yaw: number, pitch: number): GameplayCameraResult {
  const cache = prepare(world), entries = updateBounds(cache);
  const last = cache.last;
  if (last && last.x === player.x && last.z === player.z && last.yaw === yaw && last.pitch === pitch && last.version === cache.version) return copyResult(last.result);
  const forward = new Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const pivot = new Vector3(player.x, 1.7, player.z);
  const lower = new Vector3(player.x, .4, player.z), upper = new Vector3(player.x, 2.8, player.z);
  const look = pivot.clone().addScaledVector(forward, 5.2); look.y = 1.1;
  const nominalHeight = Math.sin(pitch) * 8.5;
  const desired = pivot.clone().addScaledVector(forward, -8.5).addScaledVector(right, 1.65); desired.y += nominalHeight;
  const avatar: Vector3[] = [];
  for (const dx of [-.75, .75]) for (const y of [0, 3.05]) for (const dz of [-.75, .75]) avatar.push(new Vector3(player.x + dx, y, player.z + dz));
  const fitsAvatar = (point: Vector3): boolean => {
    const direction = look.clone().sub(point).normalize();
    const horizontal = new Vector3().crossVectors(direction, UP).normalize();
    const vertical = new Vector3().crossVectors(horizontal, direction);
    return avatar.every(corner => {
      const relative = corner.clone().sub(point), depth = relative.dot(direction);
      const extent = depth * MIN_HALF_FOV_TAN * .97;
      return depth > .1 && Math.abs(relative.dot(vertical)) <= extent && Math.abs(relative.dot(horizontal)) <= extent * (4 / 3);
    });
  };
  const blocked = (point: Vector3): boolean => point.y < CAMERA_RADIUS + .02 || entries.some(entry => entry.envelope.containsPoint(point) && entry.boxes.some(box => box.containsPoint(point)));
  const hits = (position: Vector3, box: Box3): boolean => segmentHits(pivot, position, box) || segmentHits(lower, position, box) || segmentHits(upper, position, box);
  const intersections = (position: Vector3): Entry[] => entries.filter(entry => hits(position, entry.envelope) && entry.boxes.some(box => hits(position, box)));
  let position: Vector3 | undefined;
  let involved: Entry[] = [];
  let best = Infinity;
  const consider = (point: Vector3): void => {
    const deviation = point.distanceToSquared(desired);
    if (deviation >= best || blocked(point) || !fitsAvatar(point)) return;
    const crossed = intersections(point), hard = crossed.filter(entry => !entry.canFade).length;
    const score = deviation + hard * 1000 + crossed.length * .04;
    if (score < best) { best = score; position = point; involved = crossed; }
  };
  consider(desired);
  // A near-surface endpoint slides just outside that surface instead of jumping
  // immediately to a different discrete boom. Constrain azimuth to a small shoulder.
  if (best >= .2) for (const entry of entries) if (entry.envelope.containsPoint(desired)) for (const box of entry.boxes) if (box.containsPoint(desired)) {
    for (const axis of AXES) for (const face of [box.min[axis] - .01, box.max[axis] + .01]) {
      const point = desired.clone(); point[axis] = face;
      const offset = point.clone().sub(pivot);
      if (-offset.dot(forward) >= 4.2 && Math.abs(offset.dot(right)) <= 3.2) consider(point);
    }
  }
  // Prefer stable default and only explore when it is physically invalid or a
  // non-fadable background prop would hide Santa. Fades never legalize endpoints.
  for (const length of [8.5, 10, 11.5, 14.5, 7, 5.5, 4.2]) {
    for (const shoulder of [1.65, 0, -1.65, 2.8, -2.8]) {
      for (const lift of [0, 1.25, 2.75, 4.5, 6.5, 8.5, 10.5]) {
        const point = pivot.clone().addScaledVector(forward, -length).addScaledVector(right, shoulder);
        point.y += Math.sin(pitch) * length + lift;
        consider(point);
        if (best < .2) break;
      }
      if (best < .2) break;
    }
    if (best < .2) break;
  }
  if (!position) {
    // Exceptional physically boxed-in fixture: rise vertically above all solids,
    // still behind the same yaw. Explicit diagnostic, never camera inside geometry.
    position = desired.clone();
    position.y = Math.max(desired.y, ...entries.flatMap(entry => entry.boxes.map(box => box.max.y + .05)));
    involved = intersections(position);
  }
  const faded = involved.filter(entry => entry.canFade);
  for (const entry of cache.entries) {
    const on = faded.includes(entry);
    let strength = 0;
    if (on) for (const box of entry.boxes) {
      strength = Math.max(strength, segmentOverlap(pivot, position, box) / .65, segmentOverlap(lower, position, box) / .65, segmentOverlap(upper, position, box) / .65);
      if (strength >= 1) { strength = 1; break; }
    }
    // Spatial ramp, not temporal smoothing: same pose always has the same alpha.
    fade(entry, on, strength);
  }
  const distance = position.distanceTo(pivot);
  const result: GameplayCameraResult = {
    position, look, distance, compressed: distance < desired.distanceTo(pivot) - .01,
    occluded: [...new Set([...involved.map(entry => entry.source.id), ...(best === Infinity ? ['fallback:vertical-clearance'] : []), ...(involved.some(entry => !entry.canFade) ? ['fallback:opaque-background'] : [])])],
  };
  cache.last = { x: player.x, z: player.z, yaw, pitch, version: cache.version, result };
  return copyResult(result);
}
