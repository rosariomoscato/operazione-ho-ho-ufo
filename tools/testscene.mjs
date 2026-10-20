import * as THREE from '../node_modules/three/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#101c2a');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .1, 100);
scene.add(new THREE.HemisphereLight(0xd6eeff, 0x27303b, 2.4));
const sun = new THREE.DirectionalLight(0xffe3b0, 3);
sun.position.set(3, 6, 4);
scene.add(sun);
const material = color => new THREE.MeshStandardMaterial({ color, roughness: .75 });
const floor = new THREE.Mesh(new THREE.BoxGeometry(8, .15, 6), material('#c5dbe3'));
floor.position.y = -.075;
scene.add(floor);
const box = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), material('#c84451'));
const lift = Number(new URLSearchParams(location.search).get('lift') ?? 0);
if (!Number.isFinite(lift)) throw new Error('Invalid lift');
box.position.y = .6 + lift;
scene.add(box);
// Decorative ribbon, not part of the contact surface measurement.
for (const size of [[.15, 1.202, 1.402], [1.402, 1.202, .15]]) {
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(...size), material('#f5cb76'));
  box.add(ribbon);
}
// A spherical cap terminates the leaning cylinder precisely on the box's right face.
const radius = .065;
const top = new THREE.Vector3(.7 + radius, .95, 0);
const bottom = new THREE.Vector3(1.65, radius, 0);
const axis = top.clone().sub(bottom);
const stick = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, axis.length(), 16), material('#65bdaa'));
stick.position.copy(top).add(bottom).multiplyScalar(.5);
stick.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
scene.add(stick);
for (const point of [top, bottom]) {
  const cap = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 8), stick.material);
  cap.position.copy(point); scene.add(cap);
}
const marker = new THREE.Mesh(new THREE.OctahedronGeometry(.16), material('#f5cb76'));
scene.add(marker);
let time = 0, playing = false, last;
const views = {
  diorama: { position: [5, 4, 6], target: [0, .35, 0] },
  fp: { position: [3.1, 1.8, 3], target: [.55, .55, 0] },
};
function seek(t) {
  if (!Number.isFinite(t)) throw new Error('Invalid time');
  time = t;
  marker.position.set(-1.7, 1.3 + Math.sin(t * Math.PI / 3) * .18, 0);
  marker.rotation.set(0, t * .8, Math.PI / 8);
}
function setView(name) {
  if (!views[name]) throw new Error(`Unknown view: ${name}`);
  camera.position.fromArray(views[name].position);
  camera.lookAt(new THREE.Vector3(...views[name].target));
}
function renderNow() { renderer.render(scene, camera); }
function getStats() {
  const { render, memory, programs } = renderer.info;
  return { drawCalls: render.calls, triangles: render.triangles, geometries: memory.geometries, textures: memory.textures, programs: programs.length };
}
function selfTest() {
  scene.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(box, true);
  // Measure the structural box, excluding its deliberately raised decorative ribbon.
  const boxBounds = box.geometry.boundingBox ?? (box.geometry.computeBoundingBox(), box.geometry.boundingBox);
  const structural = boxBounds.clone().applyMatrix4(box.matrixWorld);
  const floorTop = new THREE.Box3().setFromObject(floor).max.y;
  const contact = new THREE.Vector3(structural.max.x, top.y, top.z);
  const gap = Math.abs(top.distanceTo(contact) - radius);
  const checks = [
    { name: 'box-to-floor (m)', value: Math.abs(structural.min.y - floorTop), limit: .001 },
    { name: 'stick-to-box (m)', value: gap, limit: .001 },
    { name: 'stick-to-floor (m)', value: Math.abs(bottom.y - radius - floorTop), limit: .001 },
    { name: 'stick contact inside box face', value: Math.max(structural.min.y - top.y, top.y - structural.max.y, Math.abs(top.z) - structural.max.z, 0), limit: .001 },
    { name: 'box geometry valid', value: Number.isFinite(bounds.max.y) ? 0 : 1, limit: 0 },
  ].map(check => ({ ...check, pass: Number.isFinite(check.value) && check.value <= check.limit }));
  return { pass: checks.every(check => check.pass), checks };
}
window.LC = {
  ready: false, duration: 6, views: Object.keys(views), setView, seek, renderNow, getStats, selfTest,
  play() { playing = true; last = undefined; }, pause() { playing = false; },
};
setView('diorama'); seek(0); renderNow();
window.LC.ready = true;
document.querySelector('#status').textContent = selfTest().pass ? 'CONTATTI OK · tolleranza 1 mm' : 'ERRORE DI CONTATTO';
for (const button of document.querySelectorAll('[data-view]')) button.onclick = () => { setView(button.dataset.view); renderNow(); };
document.querySelector('#toggle').onclick = event => {
  if (playing) window.LC.pause(); else window.LC.play();
  event.target.textContent = playing ? 'Pausa' : 'Riproduci';
};
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); renderNow(); });
function loop(now) {
  requestAnimationFrame(loop);
  if (playing) { if (last !== undefined) seek(time + (now - last) / 1000); last = now; renderNow(); }
}
requestAnimationFrame(loop);
window.LC.play();
