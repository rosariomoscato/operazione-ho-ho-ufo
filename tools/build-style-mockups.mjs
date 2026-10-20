import { mkdir, writeFile } from 'node:fs/promises';

// Emits portable, self-contained mockups: all geometry, materials and animation
// live in each HTML file. The sole external dependency is pinned Three.js.
const variants = [
  { id: 'vinyl', title: 'A · Vinile morbido', tagline: 'Un piccolo mondo di pupazzi da collezione', kind: 'vinyl', red: '#e94750', green: '#7cbf56', purple: '#7062b8', snow: '#e1eff5', sky: '#182c49', roughness: .48, metalness: 0, segments: 24 },
  { id: 'wood', title: 'B · Bottega di legno', tagline: 'Un diorama natalizio intagliato e dipinto a mano', kind: 'wood', red: '#b93c35', green: '#779943', purple: '#645278', snow: '#e6dac4', sky: '#302d36', roughness: .9, metalness: 0, segments: 8 },
  { id: 'action', title: 'C · Action figure spaziali', tagline: 'Plastica lucida, colori decisi e una vigilia da eroi', kind: 'action', red: '#d72e49', green: '#91d446', purple: '#6846b8', snow: '#d1e9f2', sky: '#101e39', roughness: .24, metalness: .1, segments: 16 },
];

function sceneCode(config) {
  return `
import * as THREE from 'three';
const config = ${JSON.stringify(config)};
const wood = config.kind === 'wood', action = config.kind === 'action';
const scene = new THREE.Scene(); scene.background = new THREE.Color(config.sky);
scene.fog = new THREE.Fog(config.sky, 18, 42);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
document.querySelector('#stage').append(renderer.domElement);
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .05, 80);
scene.add(new THREE.HemisphereLight(0xc9e6ff, 0x51435a, 2.5));
const key = new THREE.DirectionalLight(0xffdfba, 3.8); key.position.set(-4, 7, 5); scene.add(key);
const rim = new THREE.DirectionalLight(0x8aabff, 2); rim.position.set(5, 4, -4); scene.add(rim);

// Deterministic, hand-authored material functions; no downloaded textures.
function grainTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#dbc29e'; ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 32; i++) {
    ctx.strokeStyle = i % 3 ? '#c8ab83' : '#e6d0ad'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 0; y <= 128; y += 4) {
      const x = i * 4 + Math.sin(y * .045 + i * 1.8) * 2;
      if (!y) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    } ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
const grain = wood ? grainTexture() : null;
const materials = [];
function toyMaterial(color, extra = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: config.roughness, metalness: config.metalness, flatShading: wood, ...(wood ? { map: grain } : {}), ...extra }); materials.push(m); return m;
}
const red = toyMaterial(config.red), cream = toyMaterial('#fff0d5'), skin = toyMaterial('#f4ba93');
const dark = toyMaterial('#202d42'), gold = toyMaterial('#f8be55'), green = toyMaterial(config.green), purple = toyMaterial(config.purple);
const snow = toyMaterial(config.snow), roof = toyMaterial(wood ? '#8b5544' : '#596a9b');
const timber = toyMaterial(wood ? '#b48a60' : '#987562');
const glow = toyMaterial('#a4f8d9', { emissive: '#46c9b2', emissiveIntensity: .4 });
const seg = config.segments;
function mesh(parent, geometry, material, position = [0, 0, 0], scale = [1, 1, 1]) {
  const m = new THREE.Mesh(geometry, material); m.position.fromArray(position); m.scale.fromArray(scale); parent.add(m); return m;
}
function ball(parent, material, position, scale) { return mesh(parent, new THREE.SphereGeometry(1, seg, Math.max(6, seg / 2)), material, position, scale); }
function cube(parent, material, position, scale) { return mesh(parent, new THREE.BoxGeometry(1, 1, 1), material, position, scale); }
function cylinder(parent, material, position, radiusTop, radiusBottom, height) {
  return mesh(parent, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, seg), material, position);
}
function link(parent, material, a, b, radius = .09) {
  const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b), axis = bv.clone().sub(av);
  const m = cylinder(parent, material, av.clone().add(bv).multiplyScalar(.5).toArray(), radius, radius, axis.length());
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize()); return m;
}
const platform = cylinder(scene, timber, [0, -.27, 0], 5.4, 5.25, .5);
const ground = cylinder(scene, snow, [0, -.035, 0], 5.45, 5.45, .07);
// Soft graphic contact shadows are decals, not extra lights/post-processing.
const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 64;
const shadowCtx = shadowCanvas.getContext('2d'), gradient = shadowCtx.createRadialGradient(32, 32, 2, 32, 32, 32);
gradient.addColorStop(0, 'rgba(16,28,49,.5)'); gradient.addColorStop(1, 'rgba(16,28,49,0)');
shadowCtx.fillStyle = gradient; shadowCtx.fillRect(0,0,64,64);
const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
function shadow(x, z, sx, sz) {
  const m = mesh(scene, new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }), [x, .004, z]); m.rotation.x = -Math.PI / 2;
}
shadow(-1.1, .55, 2.4, 1.6); shadow(1.65, -.3, 1.8, 1.4);

// Santa: no hidden full-body rig, all primary shapes readable at gameplay scale.
const santa = new THREE.Group(); santa.position.set(-1.1, 0, .55); santa.rotation.y = 1.87; scene.add(santa);
const boots = [];
for (const x of [-.22, .22]) {
  cylinder(santa, red, [x, .34, 0], .16, .17, .46);
  boots.push(ball(santa, dark, [x, .12, .12], [.205, .12, .3]));
}
if (action) {
  cube(santa, red, [0, .97, 0], [.87, .95, .59]);
  for (const x of [-.48, .48]) ball(santa, gold, [x, 1.27, 0], [.19, .15, .22]);
} else ball(santa, red, [0, .94, 0], [.59, .66, .43]);
const belt = cylinder(santa, dark, [0, .79, 0], action ? .45 : .57, action ? .45 : .57, .13); belt.scale.z = action ? .66 : .74;
cube(santa, gold, [0, .79, .43], [.19, .17, .045]);
const hem = cylinder(santa, cream, [0, .48, 0], .49, .49, .13); hem.scale.z = .78;
ball(santa, cream, [0, 1.43, 0], [.43, .16, .34]);
const head = new THREE.Group(); head.position.y = 1.85; santa.add(head);
ball(head, skin, [0, 0, .01], [.4, .41, .34]);
for (const x of [-.39, .39]) ball(head, skin, [x, -.01, 0], [.075, .1, .08]);
// Deliberately offset cheek/beard volumes avoid z-fighting on the face.
ball(head, cream, [0, -.29, .22], [.37, .31, .23]);
for (const x of [-.22, 0, .22]) ball(head, cream, [x, -.36 + Math.abs(x) * .2, .29], [.14, .21, .12]);
ball(head, dark, [0, -.15, .357], [.07, .035, .025]);
for (const x of [-.13, .13]) {
  ball(head, dark, [x, .055, .32], [.035, .048, .025]);
  ball(head, cream, [x, .15, .316], [.095, .034, .035]);
  ball(head, cream, [x * .55, -.12, .355], [.12, .055, .05]);
}
ball(head, skin, [0, -.025, .385], [.085, .085, .075]);
const brim = cylinder(head, cream, [0, .29, 0], .41, .41, .12); brim.scale.z = .86;
const hat = mesh(head, new THREE.ConeGeometry(.35, .66, seg), red, [0, .66, -.025]);
ball(head, cream, [0, 1.0, -.025], [.12, .12, .12]);
// Gift is held between two spherical mittens, then offered forward in a short loop.
const gift = new THREE.Group(); santa.add(gift);
cube(gift, purple, [0, 0, 0], [.54, .44, .42]);
cube(gift, gold, [0, 0, 0], [.075, .444, .424]);
cube(gift, gold, [0, 0, 0], [.544, .444, .065]);
for (const x of [-.09, .09]) {
  const bow = mesh(gift, new THREE.TorusGeometry(.07, .023, 6, 12), gold, [x, .255, 0]); bow.rotation.y = x < 0 ? -.35 : .35;
}
const handRadius = .115, hands = [-1, 1].map(side => ball(santa, cream, [side * .385, 1.04, .65], [handRadius, handRadius, handRadius]));
const arms = [-1, 1].map(() => new THREE.Group()); arms.forEach(arm => santa.add(arm));
const shoulders = [[-.43, 1.28, .02], [.43, 1.28, .02]];
arms.forEach((arm, i) => { arm.userData.sleeve = link(arm, red, shoulders[i], [i ? .385 : -.385, 1.04, .65], .14); });
const sack = ball(santa, toyMaterial('#9b6547'), [.05, 1.02, -.49], [.45, .58, .31]);

// Reptilian antagonist: elongated muzzle, crest, tail, large eyes and toy armor.
const alien = new THREE.Group(); alien.position.set(1.65, 0, -.3); alien.rotation.y = -1.27; scene.add(alien);
const alienBoots = [];
for (const x of [-.19, .19]) {
  cylinder(alien, purple, [x, .31, 0], .13, .15, .4);
  alienBoots.push(ball(alien, dark, [x, .1, .1], [.17, .1, .25]));
}
ball(alien, purple, [0, .87, 0], [.4, .49, .3]);
cube(alien, glow, [0, .96, .295], [.18, .17, .04]);
const alienHead = new THREE.Group(); alienHead.position.y = 1.45; alien.add(alienHead);
ball(alienHead, green, [0, .08, .015], [.39, .38, .32]);
ball(alienHead, green, [0, -.04, .32], [.33, .19, .34]);
for (const x of [-.24, .24]) {
  ball(alienHead, gold, [x, .2, .24], [.14, .15, .09]);
  ball(alienHead, dark, [x, .21, .32], [.025, .085, .018]);
  ball(alienHead, dark, [x * .5, .02, .615], [.025, .02, .015]);
}
cube(alienHead, dark, [0, -.14, .53], [.34, .025, .045]);
for (const z of [-.18, 0, .18]) mesh(alienHead, new THREE.ConeGeometry(.1, .22, 4), purple, [0, .43, z]);
for (const side of [-1, 1]) {
  link(alien, purple, [side * .34, 1.05, 0], [side * .49, .65, .15], .12);
  ball(alien, green, [side * .49, .61, .17], [.12, .14, .12]);
}
const tail = mesh(alien, new THREE.ConeGeometry(.16, .85, seg), green, [.12, .4, -.55]); tail.rotation.x = -1.1;

// Compact setting with one cabin, three trees and a floating invader saucer.
const cabin = new THREE.Group(); cabin.position.set(-2.4, 0, -2.2); scene.add(cabin);
cube(cabin, toyMaterial(wood ? '#8b6246' : '#a5585b'), [0, .64, 0], [1.8, 1.28, 1.3]);
const cabinRoof = mesh(cabin, new THREE.ConeGeometry(1.43, .8, 4), roof, [0, 1.66, 0]); cabinRoof.rotation.y = Math.PI / 4; cabinRoof.scale.z = .85;
cube(cabin, dark, [0, .43, .665], [.4, .86, .045]);
for (const x of [-.58, .58]) cube(cabin, gold, [x, .78, .665], [.3, .33, .04]);
cube(cabin, snow, [0, 1.3, 0], [1.86, .1, 1.35]);
for (const [x, z, scale] of [[2.8, -2, 1], [-3.5, .5, .85], [.1, -3, 1.15]]) {
  cylinder(scene, timber, [x, .2, z], .12, .12, .4);
  for (let i = 0; i < 3; i++) {
    const y = .65 + i * .42;
    mesh(scene, new THREE.ConeGeometry((.7 - i * .16) * scale, .9 * scale, wood ? 6 : 16), green, [x, y * scale, z]);
    mesh(scene, new THREE.ConeGeometry((.64 - i * .16) * scale, .66 * scale, wood ? 6 : 16), snow, [x, y * scale + .18, z]);
  }
}
const saucer = new THREE.Group(); scene.add(saucer);
ball(saucer, purple, [0, 0, 0], [.8, .13, .8]);
ball(saucer, glow, [0, .12, 0], [.36, .23, .36]);
const saucerRing = mesh(saucer, new THREE.TorusGeometry(.64, .025, 6, 24), gold); saucerRing.rotation.x = Math.PI / 2;
const environment = scene.children.filter(object => object !== santa && object !== ground && object !== platform && !object.isLight);

// Identical camera anchors and choreography for all three material/proportion variants.
const views = ['diorama', 'player', 'turntable', 'face']; let currentView = 'diorama', time = 0, playing = false, previous;
const TAU = Math.PI * 2;
function setView(view) { if (!views.includes(view)) throw new Error('Unknown view: ' + view); currentView = view; seek(time); }
function seek(seconds) {
  if (!Number.isFinite(seconds)) throw new Error('Invalid time'); time = seconds;
  const t = ((seconds % 6) + 6) % 6;
  // One second held, two seconds offering, then smoothly return: feet stay planted.
  const offer = .5 - Math.cos(t / 6 * TAU) * .5;
  gift.position.set(0, 1.02 + offer * .12, .65 + offer * .15);
  hands.forEach((hand, i) => {
    hand.position.set((i ? 1 : -1) * (.27 + handRadius), gift.position.y, gift.position.z);
    const sleeve = arms[i].userData.sleeve;
    const a = new THREE.Vector3(...shoulders[i]), b = hand.position.clone(), axis = b.clone().sub(a);
    sleeve.position.copy(a).add(b).multiplyScalar(.5);
    // Base cylinder geometry was constructed at the initial shoulder-hand length.
    sleeve.scale.y = axis.length() / sleeve.geometry.parameters.height;
    sleeve.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize());
  });
  head.rotation.y = Math.sin(t / 6 * TAU) * .07;
  alienHead.rotation.z = Math.sin(t / 6 * TAU) * .08;
  saucer.position.set(2.1, 3.25 + Math.sin(t / 6 * TAU) * .1, -2.7); saucer.rotation.y = t / 6 * TAU;
  const target = new THREE.Vector3();
  const focusOnly = currentView === 'turntable' || currentView === 'face';
  environment.forEach(object => { object.visible = !focusOnly; });
  document.querySelector('header').style.visibility = focusOnly ? 'hidden' : 'visible';
  if (currentView === 'diorama') { camera.fov = 38; camera.position.set(8, 6.2, 10.5); target.set(0, .85, -.4); }
  if (currentView === 'player') { camera.fov = 53; camera.position.set(-4.7, 3.1, 4.2); target.set(.65, 1.1, -.25); }
  if (currentView === 'turntable') { const angle = t / 6 * TAU + santa.rotation.y; camera.fov = 36; camera.position.set(-1.1 + Math.sin(angle) * 6.3, 2.5, .55 + Math.cos(angle) * 6.3); target.set(-1.1, 1.42, .55); }
  if (currentView === 'face') { camera.fov = 32; camera.position.copy(santa.localToWorld(new THREE.Vector3(0, 2.15, 3.75))); target.copy(santa.localToWorld(new THREE.Vector3(0, 2.02, .35))); }
  camera.updateProjectionMatrix(); camera.lookAt(target);
  const timeline = document.querySelector('#timeline'); if (timeline) timeline.value = t;
  const label = document.querySelector('#time'); if (label) label.textContent = t.toFixed(1) + ' s';
}
function renderNow() { renderer.render(scene, camera); }
function getStats() { const info = renderer.info; return { drawCalls: info.render.calls, triangles: info.render.triangles, geometries: info.memory.geometries, textures: info.memory.textures, programs: info.programs.length }; }
function selfTest() {
  scene.updateMatrixWorld(true);
  const checks = [], floorY = 0;
  // Analytic ellipsoid bounds avoid tessellation-dependent foot measurements.
  for (const [i, foot] of [...boots, ...alienBoots].entries()) {
    const center = foot.getWorldPosition(new THREE.Vector3());
    checks.push({ name: 'foot-' + i + '-floor (m)', value: Math.abs(center.y - foot.scale.y - floorY), limit: .001 });
  }
  const box = gift.children[0].geometry.boundingBox ?? (gift.children[0].geometry.computeBoundingBox(), gift.children[0].geometry.boundingBox);
  const giftHalfWidth = (box.max.x - box.min.x) * gift.children[0].scale.x / 2;
  hands.forEach((hand, i) => {
    const center = gift.worldToLocal(hand.getWorldPosition(new THREE.Vector3()));
    const dx = Math.max(Math.abs(center.x) - giftHalfWidth, 0);
    const dy = Math.max(Math.abs(center.y) - .22, 0), dz = Math.max(Math.abs(center.z) - .21, 0);
    checks.push({ name: 'mitten-' + i + '-gift (m)', value: Math.abs(Math.hypot(dx,dy,dz) - handRadius), limit: .001 });
  });
  checks.push({ name: 'lights', value: 3, limit: 6 });
  checks.push({ name: 'shadow-casting lights', value: 0, limit: 2 });
  checks.push({ name: 'post-processing passes', value: 0, limit: 3 });
  const colors = new Set(materials.map(m => m.color.getHexString()));
  checks.push({ name: 'palette tokens', value: colors.size, limit: 20 });
  for (const check of checks) check.pass = Number.isFinite(check.value) && check.value <= check.limit;
  return { pass: checks.every(c => c.pass), checks };
}
function visualMetadata() {
  const allowed = [config.red, config.green, config.purple, config.snow, '#fff0d5', '#f4ba93', '#202d42', '#f8be55', wood ? '#8b5544' : '#596a9b', wood ? '#b48a60' : '#987562', '#a4f8d9', '#9b6547', wood ? '#8b6246' : '#a5585b'];
  return { palette: allowed, materialColors: materials.map(m => '#' + m.color.getHexString()), canvasSelector: '#stage canvas', mood: 'snowy-evening' };
}
window.LC = { ready: false, duration: 6, views, setView, seek, renderNow, getStats, selfTest, visualMetadata, play() { playing = true; previous = undefined; }, pause() { playing = false; previous = undefined; } };
document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => { setView(button.dataset.view); renderNow(); });
document.querySelector('#timeline').oninput = event => { LC.pause(); seek(Number(event.target.value)); renderNow(); document.querySelector('#play').textContent = 'Riproduci'; };
document.querySelector('#play').onclick = event => { if (playing) LC.pause(); else LC.play(); event.target.textContent = playing ? 'Pausa' : 'Riproduci'; };
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; seek(time); renderNow(); });
setView('diorama'); seek(0); renderNow(); LC.ready = true;
function loop(now) { requestAnimationFrame(loop); if (playing) { if (previous !== undefined) seek(time + (now - previous) / 1000); previous = now; renderNow(); } }
requestAnimationFrame(loop); LC.play();
`;
}

await mkdir('design/styles', { recursive: true });
for (const config of variants) {
  const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><title>${config.title} · Ho Ho UFO</title>
<style>
*{box-sizing:border-box}body{margin:0;background:${config.sky};color:#fff7e8;font:16px system-ui}canvas{display:block;width:100vw;height:100vh}header{position:absolute;top:26px;left:32px;pointer-events:none;text-shadow:0 2px 10px #101729}small{color:#ffda88;letter-spacing:.16em;text-transform:uppercase;font-size:12px}h1{margin:8px 0;font-size:30px}p{margin:0;color:#e5e9f4;font-size:15px}.controls{position:absolute;bottom:20px;left:24px;right:24px;display:flex;gap:8px;align-items:center;padding:12px 14px;background:#121d32f2;border:1px solid #60718d;border-radius:14px}button,a{font:inherit;color:#fff5df;background:#293c58;border:1px solid #7990b0;border-radius:7px;padding:8px 12px;text-decoration:none;cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #ffda88}input{flex:1;min-width:50px;accent-color:#ffda88}label{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}#time{font-variant-numeric:tabular-nums;font-size:14px;min-width:34px}@media(max-width:850px){.controls{flex-wrap:wrap}header{left:20px}h1{font-size:24px}button,a{font-size:13px;padding:8px}}
header{background:${config.sky};padding:10px 14px;border-radius:10px}#time{color:#fff5df}
@media(min-height:900px){small,header p,button,a,#time{font-size:36px}h1{font-size:48px}.controls{gap:10px}input{min-width:80px}}
</style>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js"}}</script>
</head><body><div id="stage"></div><header><small>Operazione Ho Ho UFO / Studio giocattoli 3D</small><h1>${config.title}</h1><p>${config.tagline}</p></header><nav class="controls" aria-label="Controlli anteprima"><a href="index.html">Confronta</a><button data-view="diorama">Diorama</button><button data-view="player">Giocatore</button><button data-view="turntable">Personaggio</button><button data-view="face">Volto</button><button id="play">Pausa</button><label for="timeline">Tempo animazione</label><input id="timeline" type="range" min="0" max="6" step="0.01" value="0"><span id="time">0.0 s</span></nav><script type="module">${sceneCode(config)}</script></body></html>`;
  await writeFile(`design/styles/${config.id}.html`, html);
}
console.log('Created vinyl.html, wood.html, action.html');
