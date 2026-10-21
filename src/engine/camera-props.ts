import { Box3, BufferGeometry, Float32BufferAttribute, Group, Matrix4, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { CameraOccluder } from '../contracts';
import { palette, toyMaterial } from '../visual/style';

// A palette-cream base (not default white). Vertex colors reconstruct precisely
// the original linear material colors. Same built-in Standard BRDF, no shader hook.
const propMaterial = toyMaterial(palette.cream, { vertexColors: true });
/** Only for freshly-built, exclusively-owned Batch groups, before registration.
 * One draw per prop instead of one per palette color; positions/normals unchanged.
 */
export function compactCameraProp(root: Group): Group {
  const parts: BufferGeometry[] = [];
  const base = propMaterial.color;
  for (const child of [...root.children]) {
    if (!(child instanceof Mesh) || !(child.material instanceof MeshStandardMaterial) || child.material.emissive.getHex() !== 0) throw new Error('Camera prop expects an opaque, non-emissive fresh Batch');
    child.updateMatrix();
    const geometry = child.geometry.clone().applyMatrix4(child.matrix);
    const color = child.material.color;
    const values = new Float32Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < values.length; i += 3) {
      values[i] = color.r / base.r; values[i + 1] = color.g / base.g; values[i + 2] = color.b / base.b;
    }
    geometry.setAttribute('color', new Float32BufferAttribute(values, 3));
    parts.push(geometry); root.remove(child);
    // Batch.build allocated these exclusive merged geometries, not shared primitives.
    child.geometry.dispose();
  }
  const merged = mergeGeometries(parts, false);
  if (!merged) throw new Error('Cannot compact camera prop');
  parts.forEach(part => part.dispose()); merged.computeBoundingSphere();
  root.add(new Mesh(merged, propMaterial)); return root;
}

/** Clip a polygon to one coordinate plane, construction time only. */
function clip(points: Vector3[], axis: 'x' | 'y' | 'z', value: number, lower: boolean): Vector3[] {
  const result: Vector3[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    const insideA = lower ? a[axis] >= value : a[axis] <= value;
    const insideB = lower ? b[axis] >= value : b[axis] <= value;
    if (insideA) result.push(a);
    if (insideA !== insideB) result.push(a.clone().lerp(b, (value - a[axis]) / (b[axis] - a[axis])));
  }
  return result;
}

/** Exact triangle/height-slab clipping ONCE at world construction, never per frame.
 * Keep local originals privately; expose synchronized WORLD-space bounds, directly
 * inspectable by LC/tools without guessing the frame from the node's transform.
 * Optional small regions isolate non-fadable background props from the floor/map.
 */
export function cameraProp(id: string, root: Group, cuts: readonly number[], regions?: readonly Box3[], padding = 0): CameraOccluder {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  const areas = regions ?? [new Box3(new Vector3(-Infinity, -Infinity, -Infinity), new Vector3(Infinity, Infinity, Infinity))];
  const bins = areas.map(() => cuts.slice(1).map(() => new Box3()));
  root.traverse(child => {
    if (!(child instanceof Mesh)) return;
    const geometry = child.geometry, position = geometry.attributes.position;
    const transform = new Matrix4().multiplyMatrices(inverse, child.matrixWorld);
    const count = geometry.index?.count ?? position.count;
    for (let i = 0; i < count; i += 3) {
      const triangle = [0, 1, 2].map(j => new Vector3().fromBufferAttribute(position, geometry.index ? geometry.index.getX(i + j) : i + j).applyMatrix4(transform));
      const triangleBounds = new Box3().setFromPoints(triangle);
      for (let area = 0; area < areas.length; area++) {
        const region = areas[area]; if (!triangleBounds.intersectsBox(region)) continue;
        let polygon = triangle;
        if (regions) for (const axis of ['x', 'y', 'z'] as const) {
          polygon = clip(polygon, axis, region.min[axis], true);
          polygon = clip(polygon, axis, region.max[axis], false);
        }
        if (!polygon.length) continue;
        for (let band = 0; band < cuts.length - 1; band++) {
          if (triangleBounds.max.y < cuts[band] || triangleBounds.min.y > cuts[band + 1]) continue;
          const points = clip(clip(polygon, 'y', cuts[band], true), 'y', cuts[band + 1], false);
          points.forEach(point => bins[area][band].expandByPoint(point));
        }
      }
    }
  });
  const local = bins.flat().filter(box => !box.isEmpty()).map(box => box.expandByScalar(padding));
  const world = local.map(() => new Box3());
  const matrix = new Matrix4(); let initialized = false;
  root.userData.cameraBoundsSpace = 'world';
  return {
    id, root,
    get bounds() {
      root.updateWorldMatrix(true, false);
      if (!initialized || !matrix.equals(root.matrixWorld)) {
        matrix.copy(root.matrixWorld); initialized = true;
        world.forEach((box, i) => box.copy(local[i]).applyMatrix4(matrix));
      }
      return world;
    },
  };
}
export function cameraRegion(x: number, z: number, halfX: number, halfZ: number, top: number): Box3 {
  return new Box3(new Vector3(x - halfX, .2, z - halfZ), new Vector3(x + halfX, top, z + halfZ));
}
