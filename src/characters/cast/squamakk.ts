import { Group, Vector3 } from 'three';
import type { VisualActor } from '../../contracts';
import { createAlien } from '../../visual/actors';
import { Batch } from '../../visual/style';

const GENERAL_SCALE = 1.35;
let crownTemplate: Group | undefined;
let regaliaTemplate: Group | undefined;
function crown(): Group {
  if (!crownTemplate) {
    const b = new Batch().shape('ring', 'gold', [0, .29, .015], [.35, .285, .35], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * 2 * i / 5;
      b.shape('cone', 'gold', [Math.cos(a) * .35, .45, .015 + Math.sin(a) * .285], [.075, .28, .075]);
    }
    crownTemplate = b.build(); crownTemplate.name = 'Corona del generale';
  }
  return crownTemplate.clone(true);
}
function regalia(): Group {
  if (!regaliaTemplate) {
    const b = new Batch()
      .shape('ball', 'red', [0, .91, -.33], [.52, .69, .15])
      .shape('ball', 'cream', [-.34, 1.15, -.07], [.14, .12, .14])
      .shape('ball', 'cream', [.34, 1.15, -.07], [.14, .12, .14])
      .shape('ball', 'gold', [-.25, 1.17, .2], [.055, .055, .04])
      .shape('ball', 'gold', [.25, 1.17, .2], [.055, .055, .04])
      // Chest-mounted toy loudspeaker: attached to the suit, not a claimed hand grip.
      .shape('ball', 'purple', [0, 1, .52], [.28, .28, .27])
      .shape('cylinder', 'purple', [0, 1, .73], [.21, .15, .21], [Math.PI / 2, 0, 0])
      .shape('ring', 'glow', [0, 1, .805], [.21, .21, .21]);
    regaliaTemplate = b.build(); regaliaTemplate.name = 'Mantello e megafono spaziale';
  }
  return regaliaTemplate.clone(true);
}
export function createSquamakk(): VisualActor {
  const base = createAlien(); base.root.name = 'Generale Squamakk';
  base.root.scale.setScalar(GENERAL_SCALE);
  // Crown follows the existing head rig; arms and support-foot morphs stay intact.
  const head = base.root.children.find(child => child instanceof Group && child.position.y === 1.45);
  if (!head) throw new Error('Squamakk requires the alien head rig');
  head.add(crown()); base.root.add(regalia());
  // Core may use this actual unobstructed mouth for its charging visual.
  base.root.userData.muzzleLocal = new Vector3(0, 1, .84);
  return {
    root: base.root,
    update: (time, moving, attacking) => base.update(time, moving, attacking),
    floorError: () => base.floorError() * Math.abs(base.root.scale.y),
  };
}
export default { id: 'squamakk', create: createSquamakk };
