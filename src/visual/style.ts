import { BoxGeometry, BufferGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry, DirectionalLight, Euler, Group, HemisphereLight, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Quaternion, SphereGeometry, TorusGeometry, Vector3, type MeshStandardMaterialParameters, type Scene } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const palette = {
  red: '#e94750', green: '#7cbf56', purple: '#7062b8', snow: '#e1eff5',
  cream: '#fff0d5', skin: '#f4ba93', ink: '#202d42', gold: '#f8be55',
  roof: '#596a9b', timber: '#987562', mint: '#a4f8d9', sack: '#9b6547',
  cabin: '#a5585b', sky: '#182c49',
} as const;
export function toyMaterial(color: string, extra: MeshStandardMaterialParameters = {}): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, roughness: .48, metalness: 0, flatShading: false, ...extra });
}
export type Paint = keyof typeof palette | 'glow';
export const materials = Object.fromEntries(Object.entries(palette).map(([key, color]) => [key, toyMaterial(color)])) as Record<Paint, MeshStandardMaterial>;
materials.glow = toyMaterial(palette.mint, { emissive: '#46c9b2', emissiveIntensity: .4 });
const primitives = {
  ball: new SphereGeometry(1, 24, 12), cube: new BoxGeometry(1, 1, 1),
  cylinder: new CylinderGeometry(1, 1, 1, 24), cone: new ConeGeometry(1, 1, 24),
  roof: new ConeGeometry(1, 1, 4), ring: new TorusGeometry(1, .085, 6, 32),
};
type Shape = keyof typeof primitives;
type Point = [number, number, number];
/** One mesh per material, no groups/multi-material draw-call multiplication. */
export class Batch {
  private parts = new Map<Paint, BufferGeometry[]>();
  shape(shape: Shape, paint: Paint, position: Point, scale: Point, rotation: Point = [0, 0, 0]): this {
    const q = new Quaternion().setFromEuler(new Euler(...rotation));
    const transform = new Matrix4().compose(new Vector3(...position), q, new Vector3(...scale));
    const geometry = primitives[shape].clone().applyMatrix4(transform);
    // Different primitives must have the same attributes for mergeGeometries.
    geometry.deleteAttribute('uv');
    const bucket = this.parts.get(paint) ?? []; bucket.push(geometry); this.parts.set(paint, bucket);
    return this;
  }
  link(paint: Paint, from: Point, to: Point, radius: number): this {
    const a = new Vector3(...from), b = new Vector3(...to), axis = b.clone().sub(a);
    const geometry = primitives.cylinder.clone(); geometry.deleteAttribute('uv');
    geometry.applyMatrix4(new Matrix4().compose(a.add(b).multiplyScalar(.5), new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), axis.clone().normalize()), new Vector3(radius, axis.length(), radius)));
    const bucket = this.parts.get(paint) ?? []; bucket.push(geometry); this.parts.set(paint, bucket); return this;
  }
  build(): Group {
    const group = new Group();
    for (const [paint, parts] of this.parts) {
      const geometry = mergeGeometries(parts, false);
      if (!geometry) throw new Error(`Cannot merge ${paint}`);
      parts.forEach(part => part.dispose());
      geometry.computeBoundingSphere();
      group.add(new Mesh(geometry, materials[paint]));
    }
    this.parts.clear(); return group;
  }
}
export function addLighting(scene: Scene): Group {
  const lights = new Group(); lights.name = 'snowy-evening-lighting';
  const hemi = new HemisphereLight('#c9e6ff', '#51435a', 2.5);
  const key = new DirectionalLight('#ffdfba', 3.8); key.position.set(-4, 7, 5);
  const rim = new DirectionalLight('#8aabff', 2); rim.position.set(5, 4, -4);
  lights.add(hemi, key, rim); scene.add(lights); scene.background = new Color(palette.sky);
  return lights;
}
let shadowMaterial: MeshBasicMaterial | undefined;
const shadowGeometry = new PlaneGeometry(1, 1);
/** Same radial canvas contact decal as the approved mockup; no dynamic shadows. */
export function contactShadow(width: number, depth: number): Mesh | null {
  if (typeof document === 'undefined') return null;
  if (!shadowMaterial) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d'); if (!ctx) return null;
    const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(16,28,49,.5)'); gradient.addColorStop(1, 'rgba(16,28,49,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
    shadowMaterial = new MeshBasicMaterial({ color: palette.ink, map: new CanvasTexture(canvas), transparent: true, depthWrite: false });
  }
  const mesh = new Mesh(shadowGeometry, shadowMaterial); mesh.rotation.x = -Math.PI / 2;
  mesh.scale.set(width, depth, 1); mesh.position.y = .004; return mesh;
}
