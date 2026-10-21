import { Euler, Matrix4, Mesh, Quaternion, SphereGeometry, Vector3, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Batch, materials, type Paint } from './style';

// Small/far ornaments and scenery do not need the close-up actor's 24x12 sphere.
// All non-spheres still use the shared Batch; results remain merged per material.
const sphere = new SphereGeometry(1, 12, 8);
export class SquareBatch extends Batch {
  private roundParts = new Map<Paint, BufferGeometry[]>();
  override shape(...args: Parameters<Batch['shape']>): this {
    const [shape, paint, position, scale, rotation = [0, 0, 0]] = args;
    if (shape !== 'ball') { super.shape(...args); return this; }
    const geometry = sphere.clone(); geometry.deleteAttribute('uv');
    geometry.applyMatrix4(new Matrix4().compose(new Vector3(...position), new Quaternion().setFromEuler(new Euler(...rotation)), new Vector3(...scale)));
    const parts = this.roundParts.get(paint) ?? []; parts.push(geometry); this.roundParts.set(paint, parts);
    return this;
  }
  override build() {
    const root = super.build();
    for (const [paint, parts] of this.roundParts) {
      const existing = root.children.find(child => child instanceof Mesh && child.material === materials[paint]) as Mesh | undefined;
      if (existing) { parts.push(existing.geometry); root.remove(existing); }
      const geometry = mergeGeometries(parts, false);
      if (!geometry) throw new Error(`Cannot merge square ${paint}`);
      parts.forEach(part => part.dispose()); geometry.computeBoundingSphere();
      root.add(new Mesh(geometry, materials[paint]));
    }
    this.roundParts.clear(); return root;
  }
}
