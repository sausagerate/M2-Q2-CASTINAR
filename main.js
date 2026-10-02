import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x171d1b);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(12, 9, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
document.getElementById('scene').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 27;
controls.minPolarAngle = 0.55;
controls.maxPolarAngle = 1.42;
controls.update();

// These four CanvasTextures are drawn here. No 3D models or texture files are imported.
function makeTexture(draw, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  draw(canvas.getContext('2d'));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

const tileTexture = makeTexture((ctx) => {
  ctx.fillStyle = '#c7beb0';
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#e6d8bf' : '#52605b';
      ctx.fillRect(x * 128 + 3, y * 128 + 3, 122, 122);
    }
  }
}, 3, 2.5);

const brickTexture = makeTexture((ctx) => {
  ctx.fillStyle = '#ddd0b8';
  ctx.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 8; row++) {
    for (let col = -1; col < 5; col++) {
      const offset = row % 2 ? 64 : 0;
      const shade = (row * 3 + col * 7 + 32) % 4;
      ctx.fillStyle = ['#a75d4c', '#b66c55', '#a96552', '#bf785e'][shade];
      ctx.fillRect(col * 128 + offset + 3, row * 64 + 3, 122, 58);
      ctx.fillStyle = 'rgba(255,220,185,.05)';
      ctx.fillRect(col * 128 + offset + 8, row * 64 + 8, 112, 5);
    }
  }
}, 3, 1.3);

const woodTexture = makeTexture((ctx) => {
  ctx.fillStyle = '#87583d';
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 3) {
    ctx.strokeStyle = y % 9 === 0 ? 'rgba(43,23,16,.24)' : 'rgba(243,188,116,.13)';
    ctx.lineWidth = y % 9 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(130, y + Math.sin(y) * 4, 360, y - Math.cos(y) * 5, 512, y + 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(45,24,16,.28)';
  for (let x = 0; x < 512; x += 256) ctx.fillRect(x, 0, 3, 512);
}, 2, 1);

const fabricTexture = makeTexture((ctx) => {
  ctx.fillStyle = '#8d543f';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(255,220,180,.15)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 512; i += 12) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
  }
}, 1, 1);

// Material types: Standard (tile, brick, wood), Phong (metal), Physical (glass), Basic (signs).
const tile = new THREE.MeshStandardMaterial({ map: tileTexture, roughness: 0.82 });
const brick = new THREE.MeshStandardMaterial({ map: brickTexture, roughness: 1 });
const wood = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.55 });
const fabric = new THREE.MeshStandardMaterial({ map: fabricTexture, roughness: 0.95 });
const plaster = new THREE.MeshStandardMaterial({ color: 0xb8aa91, roughness: 1 });
const dark = new THREE.MeshStandardMaterial({ color: 0x27312d, roughness: 0.72 });
const cream = new THREE.MeshStandardMaterial({ color: 0xf3ead8, roughness: 0.35 });
const brass = new THREE.MeshPhongMaterial({ color: 0xc59b5e, shininess: 115, specular: 0xffe3a9 });
const chrome = new THREE.MeshPhongMaterial({ color: 0xb8c7c8, shininess: 135, specular: 0xffffff });
const glass = new THREE.MeshPhysicalMaterial({ color: 0xd7f0ef, transparent: true, opacity: 0.24, roughness: 0.05, metalness: 0, side: THREE.DoubleSide, depthWrite: false });
const green = new THREE.MeshStandardMaterial({ color: 0x426b47, roughness: 0.85 });

function box(w, h, d, material, x, y, z, castShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function cylinder(top, bottom, height, material, x, y, z, sides = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, sides), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function labelTexture(topLine, bottomLine) {
  return makeTexture((ctx) => {
    ctx.fillStyle = '#1d2927';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#c7a576';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 472, 472);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f3dfb7';
    ctx.font = 'bold 60px Georgia';
    ctx.fillText(topLine, 256, 230);
    ctx.fillStyle = '#d7a36b';
    ctx.font = '26px Arial';
    ctx.fillText(bottomLine, 256, 300);
  });
}

// Open-front room: tiled floor, brick back wall, and plaster left wall.
const floor = box(13, 0.2, 10, tile, 0, -0.1, 0, false);
floor.receiveShadow = true;
box(13, 5.4, 0.25, brick, 0, 2.7, -5.1, false);
box(0.25, 5.4, 10, plaster, -6.55, 2.7, 0, false);
box(13.2, 0.22, 0.32, dark, 0, 0.11, -4.88, false);
box(0.32, 0.22, 10, dark, -6.37, 0.11, 0, false);
box(0.28, 5.6, 0.28, dark, -6.45, 2.7, -5.05, false);

// Cafe sign on the back wall.
box(4.4, 1.3, 0.12, brass, -2.05, 4.05, -4.85, false);
const sign = new THREE.Mesh(
  new THREE.PlaneGeometry(4.22, 1.15),
  new THREE.MeshBasicMaterial({ map: labelTexture('MIDNIGHT', 'B R E W   •   C A F E') })
);
sign.position.set(-2.05, 4.05, -4.77);
scene.add(sign);

// Window with a simple evening skyline, all made from shapes.
box(2.8, 2.55, 0.16, dark, 4.45, 3.5, -4.88, false);
box(2.45, 2.18, 0.04, new THREE.MeshBasicMaterial({ color: 0x4b7180 }), 4.45, 3.5, -4.78, false);
const skyline = new THREE.MeshStandardMaterial({ color: 0x263e45, roughness: 1 });
box(0.48, 0.72, 0.05, skyline, 3.55, 2.76, -4.72, false);
box(0.62, 1.15, 0.05, skyline, 4.08, 2.96, -4.72, false);
box(0.54, 0.85, 0.05, skyline, 4.65, 2.83, -4.72, false);
box(0.72, 1.28, 0.05, skyline, 5.23, 3.03, -4.72, false);
box(0.08, 2.32, 0.12, brass, 4.45, 3.5, -4.68, false);
box(2.52, 0.08, 0.12, brass, 4.45, 3.5, -4.68, false);
box(2.5, 2.2, 0.025, glass, 4.45, 3.5, -4.59, false);

// Front counter and its wooden slats.
box(7.4, 1.28, 1.45, dark, 0.8, 0.64, -3.05);
box(7.7, 0.19, 1.7, wood, 0.8, 1.38, -3.05);
for (let x = -2.72; x <= 4.32; x += 0.38) {
  box(0.10, 1.05, 0.07, brass, x, 0.64, -2.29, false);
}
box(7.6, 0.11, 0.14, brass, 0.8, 1.31, -2.18, false);

// Espresso machine: glossy metal, knobs, spout, and two ceramic cups.
box(1.42, 0.82, 0.8, chrome, 0.3, 1.94, -3.25);
box(1.2, 0.26, 0.08, dark, 0.3, 2.16, -2.8, false);
for (const x of [-0.13, 0.28, 0.69]) {
  cylinder(0.08, 0.08, 0.08, brass, x, 2.18, -2.74);
}
box(0.12, 0.34, 0.12, chrome, 0.28, 1.52, -2.80);
box(1.25, 0.08, 0.68, brass, 0.3, 1.53, -3.05);
for (const x of [0.05, 0.54]) {
  cylinder(0.17, 0.13, 0.31, cream, x, 1.73, -2.73);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 28), brass);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(x, 1.9, -2.73);
  scene.add(rim);
}

// Shelves and bottles behind the bar.
for (const y of [2.15, 2.8]) {
  box(2.9, 0.12, 0.55, wood, -3.8, y, -4.60);
  for (let i = 0; i < 5; i++) {
    const x = -4.9 + i * 0.55;
    cylinder(0.12, 0.13, 0.42, i % 2 ? green : cream, x, y + 0.27, -4.55, 16);
    cylinder(0.05, 0.05, 0.13, brass, x, y + 0.55, -4.55, 16);
  }
}

// Pastries under a clear glass dome on the counter.
cylinder(0.72, 0.72, 0.07, brass, 2.9, 1.54, -3.05);
const pastry = new THREE.MeshStandardMaterial({ color: 0xc77b43, roughness: 0.8 });
for (const [x, z] of [[2.58, -3.05], [2.95, -2.88], [3.24, -3.11]]) {
  const roll = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.065, 8, 20), pastry);
  roll.rotation.x = Math.PI / 2;
  roll.position.set(x, 1.67, z);
  roll.castShadow = true;
  scene.add(roll);
}
const dome = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), glass
);
dome.position.set(2.9, 1.59, -3.05);
scene.add(dome);
cylinder(0.07, 0.07, 0.11, brass, 2.9, 2.34, -3.05);

function makeChair(x, z, rotation) {
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.44, 0.14, 24), fabric);
  seat.position.y = 0.7;
  seat.castShadow = true;
  chair.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.67, 0.13), fabric);
  back.position.set(0, 1.12, 0.42);
  back.castShadow = true;
  chair.add(back);

  for (const lx of [-0.28, 0.28]) {
    for (const lz of [-0.26, 0.26]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.64, 8), brass);
      leg.position.set(lx, 0.33, lz);
      chair.add(leg);
    }
  }
  chair.position.set(x, 0, z);
  chair.rotation.y = rotation;
  scene.add(chair);
}

function makeTable(x, z) {
  cylinder(0.87, 0.87, 0.11, wood, x, 1.2, z);
  cylinder(0.075, 0.075, 1.1, brass, x, 0.61, z);
  cylinder(0.38, 0.38, 0.07, brass, x, 0.07, z);
  cylinder(0.17, 0.13, 0.25, cream, x - 0.2, 1.4, z + 0.05);
  cylinder(0.16, 0.16, 0.025, brass, x - 0.2, 1.52, z + 0.05);
}

makeTable(-2.8, 1.1);
makeChair(-4.15, 1.2, -Math.PI / 2);
makeChair(-1.5, 1.1, Math.PI / 2);
makeTable(2.7, 1.9);
makeChair(1.3, 2.0, -Math.PI / 2);
makeChair(4.1, 1.85, Math.PI / 2);

// Fabric bench along the side wall.
box(0.55, 1.1, 3.5, dark, -6.06, 1.02, -0.3);
box(1.35, 0.27, 3.5, fabric, -5.75, 0.7, -0.3);

// Potted plant near the entrance.
cylinder(0.37, 0.26, 0.68, new THREE.MeshStandardMaterial({ color: 0x95684d }), 5.5, 0.35, 3.8);
cylinder(0.035, 0.04, 1.15, green, 5.5, 1.1, 3.8, 8);
for (let i = 0; i < 7; i++) {
  const angle = i * Math.PI * 2 / 7;
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), green);
  leaf.scale.set(1.15, 0.35, 0.55);
  leaf.rotation.y = angle;
  leaf.rotation.z = 0.25;
  leaf.position.set(5.5 + Math.cos(angle) * 0.31, 1.2 + (i % 3) * 0.18, 3.8 + Math.sin(angle) * 0.31);
  leaf.castShadow = true;
  scene.add(leaf);
}

// Four kinds of light: ambient fill, directional light, two spots, and point glow.
scene.add(new THREE.AmbientLight(0xffe6bf, 0.7));

const sunlight = new THREE.DirectionalLight(0xffe3b3, 2.0);
sunlight.position.set(4, 8, 9);
sunlight.target.position.set(0, 0, 0);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
sunlight.shadow.camera.left = -10;
sunlight.shadow.camera.right = 10;
sunlight.shadow.camera.top = 10;
sunlight.shadow.camera.bottom = -10;
sunlight.shadow.bias = -0.0002;
scene.add(sunlight, sunlight.target);

function pendant(x, z) {
  cylinder(0.018, 0.018, 0.75, dark, x, 5.0, z, 8);
  cylinder(0.05, 0.44, 0.45, brass, x, 4.42, z, 24);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe4ae }));
  bulb.position.set(x, 4.18, z);
  scene.add(bulb);

  const spot = new THREE.SpotLight(0xffc98c, 95, 8, Math.PI / 5, 0.6, 1.3);
  spot.position.set(x, 4.2, z);
  spot.target.position.set(x, 0.8, z);
  scene.add(spot, spot.target);
}

pendant(-2.5, -2.9);
pendant(2.5, -2.9);
pendant(2.7, 1.9);

const signGlow = new THREE.PointLight(0x65b4a8, 15, 5);
signGlow.position.set(-2.1, 4.1, -3.8);
scene.add(signGlow);

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
