import { Box3, Group, Matrix3, Matrix4, Vector3 } from 'three';
import type { VisualActor } from '../../contracts';
import { createAlien } from '../../visual/actors';
import { Batch } from '../../visual/style';

// One source of truth for both rendered primitives and contact measurements.
const HAND_RADIUS = .12;
const HANDLE_SIZE: [number, number, number] = [.04, .2, .18];
const MUZZLE_POSITION: [number, number, number] = [0, .15, 1.045];
const GRIPS = ([-1, 1] as const).map(side => ({
  name: side < 0 ? 'shooter-left-hand-handle' : 'shooter-right-hand-handle',
  hand: [side * .34, .04, .66] as [number, number, number],
  handle: [side * .2, .04, .66] as [number, number, number],
}));
const guns = new WeakMap<Group, Group>();

/** Actual animated gun mouth, including gun/root/parent affine transforms once. */
export function getShooterMuzzleWorld(actor: VisualActor, target = new Vector3()): Vector3 {
  const gun = guns.get(actor.root);
  if (!gun) throw new Error('getShooterMuzzleWorld requires a createShooter actor');
  gun.updateWorldMatrix(true, false);
  return target.set(...MUZZLE_POSITION).applyMatrix4(gun.matrixWorld);
}

/** Sphere → handle AABB in the common gun frame, then world-normal separation.
 * Never compare world AABBs: rotating a handle would inflate its contact surface.
 * The inverse-transpose normal also preserves tangency under a common affine
 * transform (including nonuniform root scale), rather than guessing a radius.
 */
export function measureShooterContacts(actor: VisualActor): { name: string; error: number }[] {
  const gun = guns.get(actor.root);
  if (!gun) throw new Error('measureShooterContacts requires a createShooter actor');
  gun.updateWorldMatrix(true, false);
  const world = gun.matrixWorld;
  if (Math.abs(world.determinant()) < 1e-12) throw new Error('Singular shooter contact transform');
  const inverse = new Matrix4().copy(world).invert();
  const normalMatrix = new Matrix3().getNormalMatrix(world);
  const halfSize = new Vector3(...HANDLE_SIZE).multiplyScalar(.5);
  return GRIPS.map(grip => {
    // Explicit world round-trip measures the actual animated gun/root transform.
    const center = new Vector3(...grip.hand).applyMatrix4(world).applyMatrix4(inverse);
    const handleCenter = new Vector3(...grip.handle);
    const box = new Box3(handleCenter.clone().sub(halfSize), handleCenter.clone().add(halfSize));
    const closest = box.clampPoint(center, new Vector3());
    const normal = center.clone().sub(closest);
    if (normal.lengthSq() === 0) return { name: grip.name, error: HAND_RADIUS };
    normal.normalize();
    const sphereSurface = center.clone().addScaledVector(normal, -HAND_RADIUS).applyMatrix4(world);
    const handleSurface = closest.applyMatrix4(world);
    const worldNormal = normal.applyMatrix3(normalMatrix).normalize();
    return { name: grip.name, error: Math.abs(sphereSurface.sub(handleSurface).dot(worldNormal)) };
  });
}

let template: Group | undefined;
function equipment(): Group {
  if (!template) {
    const b = new Batch();
    for (const grip of GRIPS) {
      b.link('purple', [grip.hand[0], 0, 0], grip.hand, HAND_RADIUS);
      b.shape('ball', 'green', grip.hand, [HAND_RADIUS, HAND_RADIUS, HAND_RADIUS]);
      b.shape('cube', 'purple', grip.handle, HANDLE_SIZE);
    }
    // A soft toy barrel, mint muzzle and forked sight distinguish ranged units.
    b.shape('ball', 'purple', [0, .15, .65], [.23, .23, .38]);
    b.shape('cylinder', 'purple', [0, .15, .86], [.18, .34, .18], [Math.PI / 2, 0, 0]);
    b.shape('ring', 'glow', MUZZLE_POSITION, [.2, .2, .2]);
    b.shape('cube', 'glow', [0, .43, .77], [.08, .17, .07]);
    b.shape('cube', 'glow', [0, .5, .77], [.28, .05, .07]);
    template = b.build(); template.name = 'Cannone giocattolo e presa a due mani';
  }
  return template.clone(true);
}
export function createShooter(): VisualActor {
  const base = createAlien(); base.root.name = 'Rettiliano tiratore';
  // Base rig is unchanged/shared. Replace only the instance's lowered arm group.
  const oldArms = base.root.children.find(child => child instanceof Group && child.position.y === 1.05);
  if (oldArms) oldArms.visible = false;
  const gun = equipment(); gun.position.y = 1.05; base.root.add(gun);
  const actor: VisualActor = {
    root: base.root,
    floorError: () => base.floorError(),
    update(time, moving, attacking) {
      base.update(time, moving, attacking);
      // Telegraph keeps the muzzle aligned near projectile height y=1.2.
      gun.rotation.x = attacking ? 0 : .12 + (moving ? Math.sin(time * 8) * .025 : 0);
    },
  };
  guns.set(base.root, gun);
  base.root.userData.measureHandContacts = () => measureShooterContacts(actor);
  base.root.userData.getMuzzleWorld = (target?: Vector3) => getShooterMuzzleWorld(actor, target);
  return actor;
}
export default { id: 'shooter', create: createShooter };
