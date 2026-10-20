import { Box3, Float32BufferAttribute, Group, Mesh } from 'three';
import type { VisualActor } from '../contracts';
import { Batch, contactShadow, materials } from './style';

const templates = new Map<string, Group>();
function shared(id: string, build: () => Group): Group {
  if (!templates.has(id)) templates.set(id, build());
  return templates.get(id)!.clone(true);
}
function santaBody(): Group {
  const b = new Batch();
  for (const x of [-.22, .22]) {
    b.shape('cylinder', 'red', [x, .34, 0], [.16, .46, .16]);
    b.shape('ball', 'ink', [x, .12, .12], [.205, .12, .3]);
  }
  b.shape('ball', 'red', [0, .94, 0], [.59, .66, .43]);
  b.shape('cylinder', 'ink', [0, .79, 0], [.57, .13, .422]);
  b.shape('cube', 'gold', [0, .79, .43], [.19, .17, .045]);
  b.shape('cylinder', 'cream', [0, .48, 0], [.49, .13, .382]);
  b.shape('ball', 'cream', [0, 1.43, 0], [.43, .16, .34]);
  b.shape('ball', 'sack', [.05, 1.02, -.49], [.45, .58, .31]);
  return b.build();
}
function santaHead(): Group {
  const b = new Batch();
  b.shape('ball', 'skin', [0, 0, .01], [.4, .41, .34]);
  for (const x of [-.39, .39]) b.shape('ball', 'skin', [x, -.01, 0], [.075, .1, .08]);
  b.shape('ball', 'cream', [0, -.29, .22], [.37, .31, .23]);
  for (const x of [-.22, 0, .22]) b.shape('ball', 'cream', [x, -.36 + Math.abs(x) * .2, .29], [.14, .21, .12]);
  b.shape('ball', 'ink', [0, -.15, .357], [.07, .035, .025]);
  for (const x of [-.13, .13]) {
    b.shape('ball', 'ink', [x, .055, .32], [.035, .048, .025]);
    b.shape('ball', 'cream', [x, .15, .316], [.095, .034, .035]);
    b.shape('ball', 'cream', [x * .55, -.12, .355], [.12, .055, .05]);
  }
  b.shape('ball', 'skin', [0, -.025, .385], [.085, .085, .075]);
  b.shape('cylinder', 'cream', [0, .29, 0], [.41, .12, .353]);
  b.shape('cone', 'red', [0, .66, -.025], [.35, .66, .35]);
  b.shape('ball', 'cream', [0, 1, -.025], [.12, .12, .12]);
  return b.build();
}
function actor(root: Group, body: Group, head: Group, arms: Group, drone = false): VisualActor {
  const floorBounds = new Box3();
  // One shared boot/belt geometry, four tiny relative morphs: no extra draw calls.
  // Alternating support keeps at least one sole at y=0 throughout the walk cycle.
  const boots = drone ? undefined : body.children.find(child => child instanceof Mesh && child.material === materials.ink) as Mesh | undefined;
  if (boots) {
    const geometry = boots.geometry;
    if (!geometry.morphAttributes.position) {
      const positions = geometry.attributes.position;
      geometry.morphTargetsRelative = true;
      geometry.morphAttributes.position = Array.from({ length: 4 }, (_, index) => {
        const delta = new Float32Array(positions.count * 3);
        for (let i = 0; i < positions.count; i++) {
          const left = positions.getX(i) < 0;
          if (positions.getY(i) <= .245 && left === (index < 2)) delta[i * 3 + (index % 2 === 0 ? 2 : 1)] = index % 2 === 0 ? .16 : .075;
        }
        return new Float32BufferAttribute(delta, 3);
      });
    }
    boots.updateMorphTargets();
  }
  const shadow = contactShadow(drone ? 1.4 : 1.9, drone ? 1.2 : 1.5); if (shadow) root.add(shadow);
  return { root,
    update(time, moving, attacking) {
      // Boots stay planted at root y=0: no global bob or raised support feet.
      head.rotation.y = Math.sin(time * 1.8) * (moving ? .045 : .025);
      arms.rotation.x = attacking ? -.72 : moving ? Math.sin(time * 8) * .09 : Math.sin(time * 2) * .025;
      if (boots?.morphTargetInfluences) {
        const step = moving ? Math.sin(time * 8) : 0;
        boots.morphTargetInfluences[0] = step;
        boots.morphTargetInfluences[1] = Math.max(0, step);
        boots.morphTargetInfluences[2] = -step;
        boots.morphTargetInfluences[3] = Math.max(0, -step);
      }
      if (drone) head.rotation.z = attacking ? .12 : 0;
      body.rotation.z = 0;
    },
    floorError() {
      // Measure geometry in actor space, independent of gameplay root translation/rotation.
      body.updateMatrixWorld(true);
      floorBounds.makeEmpty();
      body.traverse(child => {
        if ('geometry' in child) {
          const mesh = child as import('three').Mesh;
          mesh.geometry.computeBoundingBox();
          if (mesh.geometry.boundingBox) floorBounds.union(mesh.geometry.boundingBox);
        }
      });
      return Math.abs(floorBounds.min.y);
    },
  };
}
export function createSanta(): VisualActor {
  const root = new Group(); root.name = 'Santa';
  const body = shared('santa-body', santaBody);
  const head = shared('santa-head', santaHead); head.position.y = 1.85;
  const arms = shared('santa-arms', () => {
    const b = new Batch();
    for (const side of [-1, 1]) {
      b.link('red', [side * .43, 0, .02], [side * .385, -.24, .65], .14);
      b.shape('ball', 'cream', [side * .385, -.24, .65], [.115, .115, .115]);
    }
    return b.build();
  }); arms.position.y = 1.28;
  root.add(body, head, arms); return actor(root, body, head, arms);
}
export function createAlien(): VisualActor {
  const root = new Group(); root.name = 'Rettiliano';
  const body = shared('alien-body', () => {
    const b = new Batch();
    for (const x of [-.19, .19]) {
      b.shape('cylinder', 'purple', [x, .31, 0], [.13, .4, .13]);
      b.shape('ball', 'ink', [x, .1, .1], [.17, .1, .25]);
    }
    b.shape('ball', 'purple', [0, .87, 0], [.4, .49, .3]);
    b.shape('cube', 'glow', [0, .96, .295], [.18, .17, .04]);
    b.shape('cone', 'green', [.12, .4, -.55], [.16, .85, .16], [-1.1, 0, 0]);
    return b.build();
  });
  const head = shared('alien-head', () => {
    const b = new Batch();
    b.shape('ball', 'green', [0, .08, .015], [.39, .38, .32]);
    b.shape('ball', 'green', [0, -.04, .32], [.33, .19, .34]);
    for (const x of [-.24, .24]) {
      b.shape('ball', 'gold', [x, .2, .24], [.14, .15, .09]);
      b.shape('ball', 'ink', [x, .21, .32], [.025, .085, .018]);
      b.shape('ball', 'ink', [x * .5, .02, .615], [.025, .02, .015]);
    }
    b.shape('cube', 'ink', [0, -.14, .53], [.34, .025, .045]);
    for (const z of [-.18, 0, .18]) b.shape('cone', 'purple', [0, .43, z], [.1, .22, .1]);
    return b.build();
  }); head.position.y = 1.45;
  const arms = shared('alien-arms', () => {
    const b = new Batch();
    for (const side of [-1, 1]) {
      b.link('purple', [side * .34, 0, 0], [side * .49, -.4, .15], .12);
      b.shape('ball', 'green', [side * .49, -.44, .17], [.12, .14, .12]);
    }
    return b.build();
  }); arms.position.y = 1.05;
  root.add(body, head, arms); return actor(root, body, head, arms);
}
export function createDrone(): VisualActor {
  const root = new Group(); root.name = 'Drone di esercizio';
  const body = shared('drone-base', () => new Batch()
    .shape('cylinder', 'ink', [0, .06, 0], [.43, .12, .43])
    .shape('cylinder', 'timber', [0, .56, 0], [.09, 1, .09]).build());
  const head = shared('drone-head', () => new Batch()
    .shape('ball', 'purple', [0, 0, 0], [.52, .4, .33])
    .shape('ring', 'cream', [0, 0, .345], [.25, .25, .25])
    .shape('ball', 'gold', [0, 0, .345], [.12, .12, .05])
    .shape('cube', 'cream', [0, .51, 0], [.5, .16, .08]).build()); head.position.y = 1.3;
  const arms = new Group(); root.add(body, head, arms); return actor(root, body, head, arms, true);
}
export function createGift(): Group {
  return shared('gift', () => new Batch()
    .shape('cube', 'purple', [0, 0, 0], [.54, .44, .42])
    .shape('cube', 'gold', [0, 0, 0], [.075, .448, .428])
    .shape('cube', 'gold', [0, 0, 0], [.548, .448, .065])
    .shape('ring', 'gold', [-.09, .255, 0], [.07, .07, .07], [0, -.35, 0])
    .shape('ring', 'gold', [.09, .255, 0], [.07, .07, .07], [0, .35, 0]).build());
}
