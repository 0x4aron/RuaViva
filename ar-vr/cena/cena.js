import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// O estado de um quadro depende apenas de t. Não há integrações, timers ou física.
const W = 1920, H = 1080, DURACAO = 48;
const C = { blue: '#1A4D8F', yellow: '#F2C200', red: '#C8102E', green: '#1E7D4F', ground: '#F4F6F5', asphalt: '#3A3F44' };
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const ease = v => { const x = clamp(v); return x * x * (3 - 2 * x); };
const progress = (t, a, b) => ease((t - a) / (b - a));
const envelope = (t, a, b, fade = .4) => progress(t, a, a + fade) * (1 - progress(t, b - fade, b));
const mix = THREE.MathUtils.lerp;
let seed = 20261111;
function random() { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }
const vec = (x, y, z) => new THREE.Vector3(x, y, z);
const scene = new THREE.Scene();
// Céu pintado em espaço sRGB, independente da exposição dos materiais.
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 8; skyCanvas.height = 1024;
const skyContext = skyCanvas.getContext('2d');
const skyGradient = skyContext.createLinearGradient(0, 0, 0, 1024);
for (const [stop, color] of [[0, '#193551'], [.35, '#506b87'], [.68, '#bc8e94'], [.88, '#e6a17c'], [1, '#edb58b']]) skyGradient.addColorStop(stop, color);
skyContext.fillStyle = skyGradient; skyContext.fillRect(0, 0, 8, 1024);
const skyTexture = new THREE.CanvasTexture(skyCanvas);
skyTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = skyTexture;
scene.fog = new THREE.Fog('#d7a18d', 75, 160);
const camera = new THREE.PerspectiveCamera(44, W / H, .1, 240);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;
renderer.domElement.setAttribute('aria-label', 'Maquete 3D da Rua Barão de Iguape, na Liberdade');
document.querySelector('#cena').append(renderer.domElement);
// Preenchimento difuso mantém fachadas e pavimento legíveis à sombra.
scene.add(new THREE.HemisphereLight('#ffe4c4', '#91afd1', 2.4));
scene.add(new THREE.AmbientLight('#b9cce3', .45));
const sun = new THREE.DirectionalLight('#ffc18a', 3.4);
sun.position.set(-32, 18, -24);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 120 });
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.normalBias = .035;
sun.shadow.bias = -.00025;
sun.shadow.radius = 4;
scene.add(sun);
const materialCache = new Map();
const mat = (color, extra = {}) => {
  const key = JSON.stringify([color, extra]);
  if (!materialCache.has(key)) materialCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: .86, ...extra }));
  return materialCache.get(key);
};
const asphalt = mat(C.asphalt), concrete = mat('#c8ccc7'), dark = mat('#202c33');
const blue = mat(C.blue), yellow = mat(C.yellow), metal = mat('#46545a');
function mesh(geo, material, position, parent = scene) {
  const o = new THREE.Mesh(geo, material);
  if (position) o.position.copy(position);
  o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
function box(w, h, d, x, y, z, material, parent = scene) { return mesh(new THREE.BoxGeometry(w, h, d), material, vec(x, y, z), parent); }
function cylinder(r1, r2, h, x, y, z, material, parent = scene, sides = 12) { return mesh(new THREE.CylinderGeometry(r1, r2, h, sides), material, vec(x, y, z), parent); }
function rod(a, b, radius, material, parent = scene) {
  const delta = b.clone().sub(a);
  const o = mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 8), material, a.clone().add(b).multiplyScalar(.5), parent);
  o.quaternion.setFromUnitVectors(vec(0, 1, 0), delta.normalize()); return o;
}
function canvasTexture(w, h, paint) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d'); paint(ctx, w, h);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return { texture, ctx, canvas };
}
function sign(text, w, h, background = C.blue, size = 76) {
  const tex = canvasTexture(1024, 256, (ctx, cw, ch) => {
    ctx.fillStyle = background; ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(12, 12, cw - 24, ch - 24);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${size}px "Barlow Semi Condensed"`; ctx.fillText(text, cw / 2, ch / 2, cw - 60);
  });
  // Duas faces independentes: o verso tem UV próprio, nunca texto espelhado.
  const plaque = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ map: tex.texture, toneMapped: false });
  const front = mesh(new THREE.PlaneGeometry(w, h), material, vec(0, 0, .006), plaque);
  const back = mesh(new THREE.PlaneGeometry(w, h), material, vec(0, 0, -.006), plaque);
  back.rotation.y = Math.PI;
  front.castShadow = back.castShadow = false;
  return plaque;
}
// Espera explícita das duas famílias, também usadas nas CanvasTextures.
await Promise.all([
  document.fonts.load('700 76px "Barlow Semi Condensed"'),
  document.fonts.load('600 66px "Barlow Semi Condensed"'),
  document.fonts.load('400 40px "Atkinson Hyperlegible"'),
  document.fonts.load('700 40px "Atkinson Hyperlegible"')
]);
await document.fonts.ready;

// Maquete longitudinal; a rua corre no eixo Z. A cavidade é um recorte real.
box(60, 1.2, 86, 0, -.8, 0, mat('#a79688'));
const road = new THREE.Shape();
road.moveTo(-5, -37); road.lineTo(5, -37); road.lineTo(5, 37); road.lineTo(-5, 37); road.closePath();
const holePath = new THREE.Path();
holePath.absellipse(-1.4, 12, 1.25, .92, 0, Math.PI * 2, true); road.holes.push(holePath);
// Recorte na borda: as placas afundam de fato, sem serem cobertas pelo asfalto.
const gutterPath = new THREE.Path();
gutterPath.moveTo(4.22, -1.95); gutterPath.lineTo(4.22, 1.95);
gutterPath.lineTo(4.99, 1.95); gutterPath.lineTo(4.99, -1.95); gutterPath.closePath();
road.holes.push(gutterPath);
const roadMesh = mesh(new THREE.ShapeGeometry(road, 24), asphalt, vec(0, .035, 0));
roadMesh.rotation.x = -Math.PI / 2;
const cavity = cylinder(1.12, .98, .20, -1.4, -.10, -12, mat('#111b22'), scene, 14);
cavity.scale.z = .75;
const patch = cylinder(1.27, 1.27, .07, -1.4, 0, -12, mat('#303b46'), scene, 20); patch.scale.z = .75;
const cracks = new THREE.Group(); scene.add(cracks);
for (let i = 0; i < 9; i++) {
  const a = i / 9 * Math.PI * 2;
  rod(vec(-1.4 + Math.cos(a) * 1.18, .047, -12 + Math.sin(a) * .86), vec(-1.4 + Math.cos(a) * (1.5 + random() * .35), .047, -12 + Math.sin(a) * 1.18), .025, dark, cracks);
}
for (const side of [-1, 1]) {
  box(3.1, .35, 74, side * 6.6, .13, 0, concrete);
  for (let z = -35; z <= 35; z += 2.2) {
    // Trecho da guia reservado à sarjeta animada.
    if (side === 1 && Math.abs(z) < 2) continue;
    box(.20, .38, 2.12, side * 5.12, .14, z, mat('#b9b4a7'));
  }
}
for (let z = -34; z <= 34; z += 4) box(.10, .015, 1.4, 0, .05, z, yellow);
for (const z of [-20, 20]) for (let x = -4.25; x < 4.8; x += 1.4) box(.76, .022, 3.0, x, .06, z, yellow);

const windowSources = [], highlights = [];
const facadeColors = ['#b69d7c', '#788b90', '#c2b39a', '#878c76', '#ac7059', '#6e7e8b', '#9b8479', '#c8ab88'];
function building(x, z, w, depth, height, label) {
  const facade = mat(facadeColors[Math.floor(random() * facadeColors.length)]);
  box(w, height, depth, x, height / 2 + .3, z, facade);
  box(w + .25, .20, depth + .25, x, height + .4, z, mat('#7e8b8d'));
  box(w - .6, .22, depth - .6, x, height + .55, z, mat(random() > .55 ? '#434b52' : '#8e8271'));
  const facing = x < 0 ? 1 : -1;
  const fx = x + facing * (w / 2 + .025);
  const windowMat = mat('#30414c', { emissive: '#ffbc70', emissiveIntensity: .035 }).clone();
  const warmWindow = mat('#8e7153', { emissive: '#ffb568', emissiveIntensity: .65 });
  for (let y = 1.8; y < height - .5; y += 1.9) for (let dz = -depth / 2 + 1; dz < depth / 2 - .4; dz += 1.5) {
    box(.045, 1.03, .74, fx, y, z + dz, random() > .72 ? warmWindow : windowMat);
    box(.13, .10, .89, fx, y - .56, z + dz, concrete);
    windowSources.push(vec(fx, y, z + dz));
  }
  box(.10, 1.6, 1.15, fx, 1.1, z, dark);
  const awning = box(1.05, .13, depth - .5, fx + facing * .3, 2.6, z, label ? blue : mat('#687e78'));
  awning.rotation.z = facing * -.12;
  if (label) {
    const plaque = sign(label, Math.min(depth - .2, 5.3), .9, C.blue, 87);
    plaque.position.set(fx + facing * .10, 3.5, z); plaque.rotation.y = facing * Math.PI / 2; scene.add(plaque);
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w + .12, height + .1, depth + .12)), new THREE.LineBasicMaterial({ color: C.yellow, transparent: true, opacity: 0 }));
    outline.position.set(x, height / 2 + .3, z); scene.add(outline); highlights.push({ outline, windowMat });
  }
}
for (const side of [-1, 1]) for (let i = 0; i < 8; i++) {
  const z = -29 + i * 8.2;
  const label = side < 0 && i === 5 ? 'ESCOLA' : side < 0 && i === 2 ? 'CRECHE' : null;
  building(side * 11.2, z, 6, 6.9, label ? 6.1 : 4.3 + random() * 6, label);
}
// Quarteirões de fundo, sem detalhes que disputem atenção com as ocorrências.
for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
  const height = 4 + random() * 9;
  box(5.8, height, 6.4, side * 21.3, height / 2, -32 + i * 8, mat(facadeColors[i % facadeColors.length]));
  box(6, .2, 6.6, side * 21.3, height + .1, -32 + i * 8, concrete);
}
// Suzuranto: haste bifurcada, lanternas vermelhas e ferragens escuras.
const lanternMaterial = mat('#e22530', { emissive: '#ff1630', emissiveIntensity: 2.1, roughness: .55 });
const haloTexture = canvasTexture(128, 128, ctx => {
  const glow = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
  glow.addColorStop(0, 'rgba(255,105,60,.5)');
  glow.addColorStop(.3, 'rgba(255,53,28,.18)');
  glow.addColorStop(1, 'rgba(255,40,20,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 128, 128);
}).texture;
const haloMaterial = new THREE.SpriteMaterial({ map: haloTexture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
let lanternLights = 0;
for (const side of [-1, 1]) for (const z of [-26, -10, 7, 26]) {
  const x = side * 5.95;
  cylinder(.075, .13, 5.6, x, 3.0, z, metal);
  cylinder(.28, .35, .22, x, .45, z, metal);
  for (const direction of [-1, 1]) {
    rod(vec(x, 5.3, z), vec(x, 6.0, z + direction * .6), .065, metal);
    rod(vec(x, 6.0, z + direction * .6), vec(x, 5.9, z + direction * 1.22), .065, metal);
    rod(vec(x, 5.9, z + direction * 1.22), vec(x, 5.47, z + direction * 1.22), .045, metal);
    const lantern = mesh(new THREE.SphereGeometry(.37, 12, 8), lanternMaterial, vec(x, 5.13, z + direction * 1.22));
    lantern.scale.y = 1.20;
    const halo = new THREE.Sprite(haloMaterial);
    halo.position.copy(lantern.position); halo.scale.set(1.7, 1.7, 1); scene.add(halo);
    if (direction === 1 && z !== 26 && lanternLights < 6) {
      const light = new THREE.PointLight('#ff7848', 8, 7, 2);
      light.position.copy(lantern.position); scene.add(light); lanternLights++;
    }
    cylinder(.25, .30, .09, x, 5.57, z + direction * 1.22, metal);
    cylinder(.19, .14, .12, x, 4.66, z + direction * 1.22, metal);
  }
}
const streetSign = sign('R. Barão de Iguape', 5.2, 1.12, C.blue, 89);
streetSign.position.set(-5.9, 4.05, 21.5); scene.add(streetSign);
cylinder(.065, .065, 4.2, -5.9, 2.1, 21.5, metal);

// Vegetação com copas facetadas, bancos e pequenas presenças humanas.
for (const side of [-1, 1]) for (const z of [-33, -17, 17, 33]) {
  const x = side * 7.0;
  cylinder(.11, .17, 2, x, 1.3, z, mat('#78634a'));
  mesh(new THREE.IcosahedronGeometry(1.15, 1), mat('#70836b'), vec(x, 3.0, z));
  box(.60, .12, 1.5, x, .87, z + 2, mat('#8b7660'));
  for (const dz of [-.5, .5]) box(.08, .48, .10, x, .56, z + 2 + dz, metal);
}
for (let i = 0; i < 14; i++) {
  const x = (i % 2 ? -1 : 1) * (6.5 + random() * .7), z = -29 + random() * 58;
  const person = new THREE.Group(); person.position.set(x, .31, z); scene.add(person);
  cylinder(.14, .21, .72, 0, .78, 0, mat(i % 3 ? '#566d80' : '#ac9274'), person, 6);
  mesh(new THREE.IcosahedronGeometry(.17, 1), mat('#ba9175'), vec(0, 1.29, 0), person);
  for (const dx of [-.09, .09]) box(.11, .4, .13, dx, .24, 0, dark, person);
}

// 1: bueiro junto à escola; 2: guia/sarjeta; 3: buraco junto à creche.
box(1.0, .07, 1.8, -4.38, .045, 12, dark);
for (let z = 11.27; z < 12.9; z += .24) box(.9, .06, .08, -4.38, .105, z, metal);
const garbage = new THREE.Group(); garbage.position.set(-4.35, .12, 12); scene.add(garbage);
for (let i = 0; i < 5; i++) {
  const x = (random() - .5) * .8, z = (random() - .5) * 1.2;
  const bag = mesh(new THREE.IcosahedronGeometry(.30 + random() * .12, 1), mat(i % 2 ? '#444a43' : '#686552'), vec(x, .30, z), garbage);
  bag.scale.y = 1.2;
  cylinder(.035, .09, .12, x, .73, z, dark, garbage, 5);
}
box(.88, .025, 3.8, 4.65, -.16, 0, mat('#252c30'));
const puddle = mesh(new THREE.PlaneGeometry(.72, 2.9), mat('#364d58', { roughness: .22, metalness: .45 }), vec(4.6, -.045, 0));
puddle.rotation.x = -Math.PI / 2;
const slabs = [];
for (let row = 0; row < 4; row++) {
  const tile = box(.70, .13, .91, 4.60, .005, -1.4 + row * .95, mat('#aaa99c'));
  const curb = box(.20, .38, .91, 5.12, .14, -1.4 + row * .95, concrete);
  slabs.push({ tile, curb, tiltX: row % 2 ? -.18 : .14, tiltZ: -.24 });
}

// IDs de tela 1–3 correspondem a GS_OCORRENCIA 3, 8 e 10 no DML.
// A posição na maquete é ilustrativa; o terceiro endereço real é preservado.
const occurrences = [
  { id: 1, databaseId: 3, label: 'Bueiro entupido', address: 'R. Barão de Iguape, 288', category: 'Limpeza de bueiro', at: vec(-4.35, 0, 12), score: 71, supports: 3, repairAt: [38, 38.5] },
  { id: 2, databaseId: 8, label: 'Sarjeta afundada', address: 'R. Barão de Iguape, 319', category: 'Guias e sarjetas', at: vec(4.65, 0, 0), score: 59, supports: 2, repairAt: [39.6, 40] },
  { id: 3, databaseId: 10, label: 'Buraco perto da creche', address: 'R. Dr. Siqueira Campos, 23', category: 'Tapa-buraco', at: vec(-1.4, 0, -12), score: 57, supports: 1, repairAt: [41.1, 41.5] }
];
function pinTexture(number, checked) {
  return canvasTexture(256, 256, ctx => {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(128, 128, 111, 0, Math.PI * 2); ctx.stroke();
    if (checked) { ctx.lineWidth = 19; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(72, 131); ctx.lineTo(112, 170); ctx.lineTo(187, 88); ctx.stroke(); }
    else { ctx.fillStyle = '#fff'; ctx.font = '700 170px "Barlow Semi Condensed"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(number), 128, 134); }
  }).texture;
}
const checkMap = pinTexture(0, true);
for (const item of occurrences) {
  item.group = new THREE.Group(); scene.add(item.group);
  item.material = new THREE.MeshBasicMaterial({ color: C.red, toneMapped: false, fog: false });
  const head = mesh(new THREE.SphereGeometry(.78, 24, 16), item.material, vec(0, 1, 0), item.group); head.scale.z = .37;
  const tip = mesh(new THREE.ConeGeometry(.46, 1.0, 3), item.material, vec(0, .27, 0), item.group); tip.rotation.z = Math.PI;
  item.numberMap = pinTexture(item.id, false);
  item.faceMaterial = new THREE.MeshBasicMaterial({ map: item.numberMap, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  mesh(new THREE.PlaneGeometry(1.5, 1.5), item.faceMaterial, vec(0, 1, .32), item.group);
  item.group.traverse(object => { object.castShadow = false; object.receiveShadow = false; });
  item.card = document.createElement('div');
  item.card.className = 'etiqueta';
  item.card.dataset.id = item.id;
  item.card.innerHTML = `<strong>${item.id}. ${item.label}</strong><span class="endereco">${item.address}</span><span class="estado"></span><span class="barra"><i></i></span>`;
  document.querySelector('#etiquetas').append(item.card);
  item.status = item.card.querySelector('.estado');
  item.bar = item.card.querySelector('.barra');
  item.bar.firstElementChild.style.width = `${item.score / 71 * 100}%`;
}
function updatePanel(item, mode, count) {
  item.card.dataset.mode = mode;
  item.status.textContent = mode === 'priority' ? `${item.score} pontos · ${item.supports} ${item.supports === 1 ? 'apoio' : 'apoios'}` : mode === 'resolved' ? 'Resolvido' : `${count} ${count === 1 ? 'apoio' : 'apoios'}`;
  item.bar.hidden = mode !== 'priority';
}
// Projeção em pixels fixos de captura: fonte nunca encolhe com a distância.
function positionPanels(t, queueBlend) {
  const occupied = [];
  const closeup = t >= 37.8 && t < 43.3;
  const focusedId = t < 39.5 ? 1 : t < 41.2 ? 2 : 3;
  for (const item of occurrences) {
    const projected = item.group.position.clone().project(camera);
    const visible = t >= 13 && t < 44 && projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.1 && (!closeup || item.id === focusedId);
    item.card.hidden = !visible;
    if (!visible) continue;
    const queueX = 310 + (item.id - 1) * 650;
    const anchorX = mix((projected.x + 1) * W / 2, queueX, queueBlend);
    const anchorY = mix((1 - projected.y) * H / 2 + 18, 245, queueBlend);
    let x = closeup ? 310 : clamp(anchorX, 230, W - 230);
    let y = closeup ? 180 : clamp(anchorY, 155, 690);
    // Busca determinística de espaço livre; não depende do quadro anterior.
    const candidates = [0, -190, 190, -380, 380].flatMap(dy => [0, -440, 440].map(dx => ({ x: clamp(x + dx, 230, W - 230), y: clamp(y + dy, 155, 690) })));
    const slot = candidates.find(candidate => occupied.every(other => Math.abs(candidate.x - other.x) >= 432 || Math.abs(candidate.y - other.y) >= 184));
    if (slot) ({ x, y } = slot);
    occupied.push({ x, y });
    item.card.style.left = `${x}px`; item.card.style.top = `${y}px`;
  }
}

const particles = [];
const particleGeometry = new THREE.IcosahedronGeometry(.075, 1);
for (let i = 0; i < 90; i++) {
  const item = occurrences[i % 3];
  const start = windowSources[Math.floor(random() * windowSources.length)].clone();
  if (i % 4 === 0) start.set(i % 2 ? -6.5 : 6.5, .9, -27 + random() * 54);
  const material = new THREE.MeshBasicMaterial({ color: i % 3 ? '#ffe2a1' : '#ffffff', transparent: true });
  const particle = mesh(particleGeometry, material, start);
  particle.castShadow = false;
  particles.push({ particle, start, item, launch: 13.1 + random() * 5.5, duration: 1.25 + random() * 1.0, arc: 1.2 + random() * 2 });
}

// Base e van branca com faixa azul. Frente da van = eixo -Z.
const baseSign = sign('BASE RUA VIVA', 4.0, .85, C.blue, 86); baseSign.position.set(7.7, 3.5, 31); baseSign.rotation.y = -.5; scene.add(baseSign);
const van = new THREE.Group(); scene.add(van);
box(1.75, 1.45, 3.3, 0, 1.15, 0, mat('#f5f5ef'), van);
box(1.76, .32, 3.31, 0, 1.08, 0, blue, van);
box(1.55, .62, .04, 0, 1.56, -1.67, mat('#354d60'), van);
box(1.79, .55, .84, 0, 1.57, -1.09, mat('#354d60'), van);
box(1.88, .15, .16, 0, .53, -1.72, metal, van);
for (const x of [-.89, .89]) for (const z of [-1.03, 1.03]) {
  const wheel = cylinder(.34, .34, .20, x, .40, z, dark, van); wheel.rotation.z = Math.PI / 2;
  const hub = cylinder(.15, .15, .215, x, .40, z, concrete, van); hub.rotation.z = Math.PI / 2;
}
for (const x of [-.60, .60]) box(.35, .19, .04, x, .82, -1.73, mat('#ffe4ae', { emissive: '#ffe4ae', emissiveIntensity: .7 }), van);
const vanLogo = sign('RuaViva', 1.55, .48, C.blue, 104); vanLogo.position.set(.886, 1.10, .34); vanLogo.rotation.y = Math.PI / 2; van.add(vanLogo);
const basePoint = vec(2.8, .085, 30);
const stops = [vec(-2.7, .085, 10.2), vec(2.9, .085, 0), vec(.8, .085, -14)];
// Neste trecho linear, enumera as 6 ordens e escolhe a menor rota aberta.
function permutations(xs) { return xs.length ? xs.flatMap((v, i) => permutations(xs.filter((_, j) => i !== j)).map(p => [v, ...p])) : [[]]; }
const order = permutations([0, 1, 2]).sort((a, b) => {
  const length = seq => seq.reduce((sum, index, i) => sum + stops[index].distanceTo(i ? stops[seq[i - 1]] : basePoint), 0);
  return length(a) - length(b);
})[0];
const routeLegs = [], samplesPerLeg = 100;
let previous = basePoint;
for (const index of order) {
  const end = stops[index];
  const curve = new THREE.CatmullRomCurve3([previous.clone(), previous.clone().lerp(end, .28), previous.clone().lerp(end, .72), end.clone()]);
  routeLegs.push(curve); previous = end;
}
// Faixa horizontal: largura constante, sem depender do suporte a linhas largas do GL.
const routePositions = [];
for (const curve of routeLegs) for (let i = 0; i < samplesPerLeg; i++) {
  const a = curve.getPoint(i / samplesPerLeg), b = curve.getPoint((i + 1) / samplesPerLeg);
  const right = vec(b.z - a.z, 0, a.x - b.x).normalize().multiplyScalar(.105);
  const al = a.clone().sub(right), ar = a.clone().add(right), bl = b.clone().sub(right), br = b.clone().add(right);
  for (const p of [al, ar, bl, ar, br, bl]) routePositions.push(p.x, p.y, p.z);
}
const routeGeometry = new THREE.BufferGeometry(); routeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(routePositions, 3));
const routeMaterial = new THREE.MeshBasicMaterial({ color: C.yellow, side: THREE.DoubleSide, transparent: true });
const route = mesh(routeGeometry, routeMaterial); route.castShadow = false;
const stopRings = stops.map(p => {
  const ring = mesh(new THREE.RingGeometry(.58, .66, 32), new THREE.MeshBasicMaterial({ color: C.yellow, transparent: true, side: THREE.DoubleSide }), p.clone().setY(.09));
  ring.rotation.x = -Math.PI / 2; return ring;
});

// Hermite com tangentes temporais compartilhadas: câmera contínua em posição e
// velocidade, sem congelar a cada troca de capítulo.
const shots = [
  { t: 0, p: [32, 55, 48], aim: [0, 0, 0] },
  { t: 5, p: [7, 10, 29], aim: [-1, 1.0, 10] },
  { t: 9, p: [3.3, 5.6, 23], aim: [0, 1.0, 2] },
  { t: 13, p: [6, 10.5, 12], aim: [0, 1.8, -3] },
  { t: 21, p: [8, 23, 32], aim: [0, 5, 0] },
  { t: 29, p: [7, 35, 50], aim: [0, 3, 12] },
  { t: 34, p: [6, 25, 34], aim: [0, 1, 12] },
  { t: 37.8, p: [4, 9, 23], aim: [-3, .5, 12] },
  { t: 39.25, p: [3.5, 8, 22], aim: [-3.5, .5, 12] },
  { t: 40.2, p: [1, 10, 12], aim: [3.3, .3, 0] },
  { t: 41, p: [1, 10, 11], aim: [3.3, .3, 0] },
  { t: 42, p: [5, 9, -1], aim: [-1, .3, -12] },
  { t: 43.2, p: [5, 9, -2], aim: [-1, .3, -12] },
  { t: 44, p: [9, 22, 14], aim: [0, 1.8, 0] },
  { t: 48, p: [40, 51, 42], aim: [0, 0, 0] }
];
function cameraValue(t, key) {
  let i = shots.findIndex((s, j) => j < shots.length - 1 && t <= shots[j + 1].t);
  if (i < 0) i = shots.length - 2;
  const a = shots[i], b = shots[i + 1], before = shots[Math.max(0, i - 1)], after = shots[Math.min(shots.length - 1, i + 2)];
  const dt = b.t - a.t, u = clamp((t - a.t) / dt), u2 = u * u, u3 = u2 * u;
  return a[key].map((value, axis) => {
    const tangentA = (b[key][axis] - before[key][axis]) / (b.t - before.t);
    const tangentB = (after[key][axis] - a[key][axis]) / (after.t - a.t);
    return (2 * u3 - 3 * u2 + 1) * value + (u3 - 2 * u2 + u) * tangentA * dt
      + (-2 * u3 + 3 * u2) * b[key][axis] + (u3 - u2) * tangentB * dt;
  });
}
const captions = [
  [5, 13, 'Bueiro entupido, sarjeta afundada, buraco: o morador vê todo dia.'],
  [13, 21, 'Cada vizinho afetado apoia o registro.'],
  [21, 29, 'A fila prioriza gravidade, apoios e quem está perto de escola, UBS ou creche.'],
  [29, 38, 'A equipe recebe a rota do dia calculada para atender mais em menos tempo.'],
  [38, 44, 'Resolvido. E todo mundo acompanha.']
];
const $ = id => document.getElementById(id);
const ui = { opening: $('abertura'), ending: $('fecho'), caption: $('legenda'), identity: $('identidade'), note: $('nota') };
const redColor = new THREE.Color(C.red), greenColor = new THREE.Color(C.green);
const up = vec(0, 1, 0);
const queueCenter = vec(0, 12.5, 0);
const travelTimes = [[29.2, 36.8], [39.1, 39.6], [40.6, 41.1]];

// Agrupa geometria estática por material: menos draw calls, sem cache temporal.
const dynamicMeshes = new Set([patch, cavity, puddle, route, ...stopRings, ...slabs.flatMap(({ tile, curb }) => [tile, curb]), ...particles.map(({ particle }) => particle)]);
const batches = new Map();
scene.updateMatrixWorld(true);
for (const object of [...scene.children]) {
  if (!object.isMesh || dynamicMeshes.has(object)) continue;
  const key = object.material.uuid;
  if (!batches.has(key)) batches.set(key, { material: object.material, geometries: [] });
  const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
  if (geometry.index) {
    batches.get(key).geometries.push(geometry.toNonIndexed());
    geometry.dispose();
  } else batches.get(key).geometries.push(geometry);
  scene.remove(object); object.geometry.dispose();
}
for (const { material, geometries } of batches.values()) {
  mesh(mergeGeometries(geometries), material);
  for (const geometry of geometries) geometry.dispose();
}

window.renderizar = function renderizar(segundos) {
  if (typeof segundos !== 'number' || !Number.isFinite(segundos)) throw new TypeError('renderizar exige segundos como número finito.');
  const t = clamp(segundos, 0, DURACAO);
  camera.position.fromArray(cameraValue(t, 'p'));
  camera.lookAt(new THREE.Vector3().fromArray(cameraValue(t, 'aim')));
  camera.updateMatrixWorld();
  const queueBlend = progress(t, 21, 22.6) * (1 - progress(t, 28, 29));
  const queueDepth = queueBlend > 0 ? queueCenter.clone().project(camera).z : 0;

  for (let i = 0; i < occurrences.length; i++) {
    const item = occurrences[i];
    const appear = progress(t, 5.35 + i * .70, 6.45 + i * .70);
    const repair = progress(t, ...item.repairAt);
    item.repair = repair;
    item.group.visible = appear > 0;
    item.group.scale.setScalar(mix(.01, 1, appear) * mix(1, 1.75, queueBlend));
    const home = item.at.clone().setY(mix(.2, 2.6, appear) + .08 * Math.sin(t * 1.25 + i));
    item.group.position.copy(home);
    if (queueBlend > 0) {
      const queued = vec((310 + i * 650) / W * 2 - 1, 1 - 190 / H * 2, queueDepth).unproject(camera);
      item.group.position.lerp(queued, queueBlend);
    }
    item.group.quaternion.copy(camera.quaternion);
    // Um único marco troca cor, símbolo e etiqueta, sem estados intermediários ambíguos.
    const resolved = t >= item.repairAt[1];
    item.material.color.copy(resolved ? greenColor : redColor);
    item.faceMaterial.map = resolved ? checkMap : item.numberMap;
    const count = Math.round(item.supports * progress(t, 13.6 + i * .2, 18.5));
    const mode = resolved ? 'resolved' : queueBlend > .5 ? 'priority' : 'support';
    updatePanel(item, mode, count);
  }

  for (const { particle, start, item, launch, duration, arc } of particles) {
    const p = (t - launch) / duration;
    particle.visible = p >= 0 && p <= 1 && t < 21;
    const u = ease(p);
    const destination = item.at.clone().setY(3.5);
    particle.position.copy(start).lerp(destination, u);
    particle.position.y += Math.sin(clamp(p) * Math.PI) * arc;
    particle.material.opacity = envelope(p, 0, 1, .14);
    particle.scale.setScalar(1 + .28 * Math.sin(clamp(p) * Math.PI));
  }
  for (const { outline, windowMat } of highlights) {
    const illumination = progress(t, 22, 23) * (1 - progress(t, 28, 29));
    outline.material.opacity = illumination * .95;
    outline.visible = illumination > 0;
    windowMat.emissiveIntensity = .035 + illumination * .75;
  }

  let legIndex = 0, legProgress = 0;
  for (let i = 0; i < travelTimes.length; i++) {
    if (t >= travelTimes[i][0]) { legIndex = i; legProgress = progress(t, ...travelTimes[i]); }
  }
  const leg = routeLegs[legIndex];
  van.position.copy(leg.getPoint(legProgress));
  const heading = leg.getTangent(legProgress).normalize();
  // Orientação contínua durante as pausas, antes de partir para o próximo ponto.
  if (legProgress >= 1 && legIndex < routeLegs.length - 1) {
    const turn = progress(t, travelTimes[legIndex + 1][0] - .12, travelTimes[legIndex + 1][0]);
    heading.lerp(routeLegs[legIndex + 1].getTangent(0), turn).normalize();
  }
  van.quaternion.setFromAxisAngle(up, Math.atan2(-heading.x, -heading.z));
  const visibleSegments = Math.floor((legIndex + legProgress) * samplesPerLeg);
  routeGeometry.setDrawRange(0, visibleSegments * 6);
  route.visible = t >= 29.2;
  routeMaterial.opacity = 1 - .68 * progress(t, 43, 47);
  for (let i = 0; i < stopRings.length; i++) {
    const visit = order.indexOf(i);
    const reached = progress(t, travelTimes[visit][1] - .15, travelTimes[visit][1] + .2);
    stopRings[i].visible = t >= 29;
    stopRings[i].material.opacity = .30 + .70 * reached;
    stopRings[i].material.color.copy(new THREE.Color(C.yellow)).lerp(greenColor, occurrences[i].repair);
  }
  const fill = occurrences[2].repair;
  patch.visible = fill > 0;
  patch.scale.set(Math.max(.001, fill), 1, .75 * Math.max(.001, fill));
  cavity.visible = fill < 1;
  cracks.visible = fill < 1;
  garbage.scale.setScalar(Math.max(.001, 1 - occurrences[0].repair));
  garbage.visible = occurrences[0].repair < 1;
  puddle.visible = occurrences[1].repair < 1;
  puddle.scale.setScalar(Math.max(.001, 1 - occurrences[1].repair));
  for (const { tile, curb, tiltX, tiltZ } of slabs) {
    const damage = 1 - occurrences[1].repair;
    // Face superior em .035, no mesmo plano do asfalto quando reparada.
    tile.position.y = -.03 - .10 * damage;
    tile.rotation.set(tiltX * damage, 0, tiltZ * damage);
    curb.position.y = .14 - .13 * damage;
    curb.rotation.z = tiltZ * damage;
  }
  positionPanels(t, queueBlend);

  ui.opening.style.opacity = String(envelope(t, -.4, 5, .55));
  ui.opening.style.transform = `translateY(${18 * (1 - progress(t, 0, 1))}px)`;
  ui.identity.style.opacity = String(envelope(t, 5, 44));
  ui.ending.style.opacity = String(progress(t, 44, 44.8));
  ui.ending.style.transform = `translateY(${18 * (1 - progress(t, 44, 44.8))}px)`;
  ui.note.style.opacity = String(1 - progress(t, 44, 44.6));
  const caption = captions.find(([a, b]) => t >= a && t < b);
  ui.caption.textContent = caption ? caption[2] : '';
  ui.caption.style.opacity = String(caption ? envelope(t, caption[0], caption[1]) : 0);
  renderer.render(scene, camera);
  return t;
};
window.cenaInfo = Object.freeze({ largura: W, altura: H, duracao: DURACAO, fps: 30, ordemRota: order.map(i => i + 1), dados: 'database/02_dml.sql; posições e reparos ilustrativos', ocorrencias: Object.freeze(occurrences.map(({ id, databaseId, label, address, category, score, supports, repairAt }) => Object.freeze({ id, databaseId, label, address, category, score, supports, repairAt: Object.freeze([...repairAt]) }))) });
// Compila também os materiais usados mais tarde, antes de sinalizar prontidão.
renderer.compile(scene, camera);
window.renderizar(0);
$('carregamento').hidden = true;
window.cenaPronta = true;

// Único relógio em tempo real: opt-in explícito. Nunca é iniciado na captura.
if (new URLSearchParams(location.search).get('preview') === '1') {
  let origin;
  function preview(now) {
    if (origin === undefined) origin = now;
    window.renderizar(((now - origin) / 1000) % DURACAO);
    requestAnimationFrame(preview);
  }
  requestAnimationFrame(preview);
}
