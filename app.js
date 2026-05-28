// ========================================
// 从心而书 · 神秘学殿堂 — 3D 沉浸版
// ========================================

// ── Three.js Scene ──
let scene, camera, renderer;
let candleLight, candleFlame;
let parchmentMesh, tableMesh;
let starField;
let cameraTarget = { x: 0, y: 2.5, z: 5 };
let cameraLookAt = { x: 0, y: 1.2, z: 0 };
let isAnimating = false;
let mouseX = 0, mouseY = 0;
let camEnabled = false;

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020108);
  scene.fog = new THREE.FogExp2(0x020108, 0.08);

  camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 2.5, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  document.body.insertBefore(renderer.domElement, document.body.firstChild);

  // Mouse parallax for subtle camera movement
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / innerWidth - 0.5) * 2;
    mouseY = (e.clientY / innerHeight - 0.5) * 2;
  });

  // Ambient light (明亮)
  const ambient = new THREE.AmbientLight(0x2a2030, 0.8);
  scene.add(ambient);

  // Hemisphere light (天光+地光)
  const hemi = new THREE.HemisphereLight(0x304060, 0x1a1008, 0.5);
  scene.add(hemi);

  // Candle light (主光源)
  candleLight = new THREE.PointLight(0xe8a33c, 3.5, 12, 1.5);
  candleLight.position.set(0.5, 2, 0.2);
  candleLight.castShadow = true;
  candleLight.shadow.mapSize.set(512, 512);
  candleLight.shadow.radius = 4;
  scene.add(candleLight);

  // 桌面补光
  const tableLight = new THREE.PointLight(0xd4af37, 1.2, 6);
  tableLight.position.set(0, 1.8, 0.5);
  scene.add(tableLight);

  // 背景暖光
  const backLight = new THREE.PointLight(0xb8962e, 0.8, 10);
  backLight.position.set(-1, 3, -2);
  scene.add(backLight);

  // 侧面补光
  const sideLight = new THREE.PointLight(0x6080a0, 0.4, 8);
  sideLight.position.set(3, 2, 1);
  scene.add(sideLight);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(20, 20);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x14101e,
    roughness: 0.85,
    metalness: 0.1
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Table
  createTable();

  // Candle
  createCandle();

  // Parchment
  createParchment();

  // Star field (background)
  createStarField();

  // Observatory walls (simple)
  createWalls();

  // Start render loop
  animate();

  // Hide loading
  const loadEl = document.getElementById('loading');
  if (loadEl) {
    loadEl.style.opacity = '0';
    loadEl.style.transition = 'opacity 1s';
    setTimeout(() => loadEl.remove(), 1000);
  }
}

function createTable() {
  // Table top
  const topGeo = new THREE.BoxGeometry(2.4, 0.08, 1.6);
  const topMat = new THREE.MeshStandardMaterial({
    color: 0x3a2a18,
    roughness: 0.75,
    metalness: 0.05
  });
  tableMesh = new THREE.Mesh(topGeo, topMat);
  tableMesh.position.set(0, 1.0, 0);
  tableMesh.castShadow = true;
  tableMesh.receiveShadow = true;
  scene.add(tableMesh);

  // Table legs
  const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 1, 8);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.9 });
  const legPositions = [[-1, 0.5, -0.6], [1, 0.5, -0.6], [-1, 0.5, 0.6], [1, 0.5, 0.6]];
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(...pos);
    leg.castShadow = true;
    scene.add(leg);
  });

  // Table edge trim
  const edgeGeo = new THREE.BoxGeometry(2.44, 0.04, 1.64);
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.7, metalness: 0.1 });
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.position.set(0, 1.06, 0);
  scene.add(edge);
}

function createCandle() {
  // Candle body
  const bodyGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.3, 12);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.6 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0.5, 1.25, 0.2);
  body.castShadow = true;
  scene.add(body);

  // Candle holder
  const holderGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.04, 12);
  const holderMat = new THREE.MeshStandardMaterial({ color: 0x8a6f20, roughness: 0.4, metalness: 0.6 });
  const holder = new THREE.Mesh(holderGeo, holderMat);
  holder.position.set(0.5, 1.1, 0.2);
  scene.add(holder);

  // Flame (sprite)
  const flameCanvas = document.createElement('canvas');
  flameCanvas.width = 32;
  flameCanvas.height = 64;
  const fctx = flameCanvas.getContext('2d');
  const grad = fctx.createRadialGradient(16, 48, 2, 16, 32, 16);
  grad.addColorStop(0, 'rgba(255,240,200,1)');
  grad.addColorStop(0.3, 'rgba(232,163,60,0.8)');
  grad.addColorStop(0.7, 'rgba(232,163,60,0.3)');
  grad.addColorStop(1, 'transparent');
  fctx.fillStyle = grad;
  fctx.fillRect(0, 0, 32, 64);

  const flameTex = new THREE.CanvasTexture(flameCanvas);
  const flameMat = new THREE.SpriteMaterial({ map: flameTex, blending: THREE.AdditiveBlending, transparent: true });
  candleFlame = new THREE.Sprite(flameMat);
  candleFlame.position.set(0.5, 1.45, 0.2);
  candleFlame.scale.set(0.12, 0.2, 1);
  scene.add(candleFlame);

  // 额外蜡烛光晕
  const glowLight = new THREE.PointLight(0xffa500, 1.5, 4);
  glowLight.position.set(0.5, 1.5, 0.2);
  scene.add(glowLight);

  // Candle light position
  candleLight.position.set(0.5, 1.5, 0.2);
}

function createParchment() {
  // Parchment plane
  const parchGeo = new THREE.PlaneGeometry(1.8, 1.2);
  const parchCanvas = document.createElement('canvas');
  parchCanvas.width = 512;
  parchCanvas.height = 340;
  const pctx = parchCanvas.getContext('2d');

  // Parchment texture
  pctx.fillStyle = '#2a2018';
  pctx.fillRect(0, 0, 512, 340);

  // Aged edges
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 340;
    const alpha = Math.random() * 0.03;
    pctx.fillStyle = `rgba(184,150,46,${alpha})`;
    pctx.fillRect(x, y, 1, 1);
  }

  // Border
  pctx.strokeStyle = 'rgba(184,150,46,0.15)';
  pctx.lineWidth = 2;
  pctx.strokeRect(10, 10, 492, 320);
  pctx.strokeStyle = 'rgba(184,150,46,0.08)';
  pctx.lineWidth = 1;
  pctx.strokeRect(16, 16, 480, 308);

  // Title text
  pctx.font = '24px serif';
  pctx.fillStyle = 'rgba(200,168,78,0.6)';
  pctx.textAlign = 'center';
  pctx.fillText('从心而书', 256, 50);
  pctx.font = '14px serif';
  pctx.fillStyle = 'rgba(200,168,78,0.3)';
  pctx.fillText('神秘学殿堂', 256, 75);

  // Divider
  pctx.strokeStyle = 'rgba(184,150,46,0.1)';
  pctx.beginPath();
  pctx.moveTo(100, 90);
  pctx.lineTo(412, 90);
  pctx.stroke();

  // Menu items
  const items = [
    { sym: '✦', name: '塔罗占卜', desc: '桌上的牌' },
    { sym: '☉', name: '星盘分析', desc: '天球仪' },
    { sym: '☰', name: '易经占卜', desc: '铜钱与卦' },
    { sym: '📜', name: '姓名测算', desc: '羊皮纸' },
    { sym: '🕯', name: '每日启示', desc: '桌角的蜡烛' },
    { sym: '☁', name: '梦境记录', desc: '梦的密语' }
  ];
  items.forEach((item, i) => {
    const y = 120 + i * 34;
    pctx.font = '16px serif';
    pctx.fillStyle = 'rgba(184,150,46,0.4)';
    pctx.textAlign = 'left';
    pctx.fillText(item.sym, 40, y);
    pctx.font = '15px serif';
    pctx.fillStyle = 'rgba(200,168,78,0.5)';
    pctx.fillText(item.name, 70, y);
    pctx.font = '11px serif';
    pctx.fillStyle = 'rgba(128,120,104,0.4)';
    pctx.fillText(item.desc, 70, y + 16);
  });

  const parchTex = new THREE.CanvasTexture(parchCanvas);
  const parchMat = new THREE.MeshStandardMaterial({
    map: parchTex,
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide
  });
  parchmentMesh = new THREE.Mesh(parchGeo, parchMat);
  parchmentMesh.rotation.x = -Math.PI / 2 + 0.05;
  parchmentMesh.position.set(-0.2, 1.09, 0);
  parchmentMesh.receiveShadow = true;
  scene.add(parchmentMesh);
}

function createStarField() {
  const starsGeo = new THREE.BufferGeometry();
  const starsCount = 2000;
  const positions = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = 30 + Math.random() * 20;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 5;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xc0c0d0, size: 0.08, transparent: true, opacity: 0.6 });
  starField = new THREE.Points(starsGeo, starsMat);
  scene.add(starField);
}

function createWalls() {
  // Back wall
  const wallGeo = new THREE.PlaneGeometry(20, 8);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x12101a, roughness: 0.9, metalness: 0 });
  const backWall = new THREE.Mesh(wallGeo, wallMat);
  backWall.position.set(0, 4, -6);
  scene.add(backWall);

  // Side walls
  const leftWall = new THREE.Mesh(wallGeo, wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-8, 4, 0);
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeo, wallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(8, 4, 0);
  scene.add(rightWall);

  // Ceiling
  const ceilGeo = new THREE.PlaneGeometry(20, 20);
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0a0812, roughness: 1 });
  const ceil = new THREE.Mesh(ceilGeo, ceilMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 8;
  scene.add(ceil);
}

function animate() {
  requestAnimationFrame(animate);

  // Candle flicker
  if (candleLight) {
    const t = Date.now() * 0.003;
    candleLight.intensity = 3.2 + Math.sin(t * 3) * 0.3 + Math.sin(t * 7) * 0.15;
    if (candleFlame) {
      candleFlame.scale.y = 0.2 + Math.sin(t * 5) * 0.02;
      candleFlame.position.x = 0.5 + Math.sin(t * 4) * 0.003;
    }
  }

  // Star rotation
  if (starField) starField.rotation.y += 0.00005;

  // Subtle camera parallax (only when not animating)
  if (!isAnimating && camEnabled) {
    camera.position.x += (cameraTarget.x + mouseX * 0.15 - camera.position.x) * 0.02;
    camera.position.y += (cameraTarget.y - mouseY * 0.08 - camera.position.y) * 0.02;
  }

  renderer.render(scene, camera);
}

function animateCamera(targetPos, targetLook, duration, callback) {
  if (isAnimating) return;
  isAnimating = true;
  const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const startLook = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
  const startTime = Date.now();

  function step() {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.x = startPos.x + (targetPos.x - startPos.x) * ease;
    camera.position.y = startPos.y + (targetPos.y - startPos.y) * ease;
    camera.position.z = startPos.z + (targetPos.z - startPos.z) * ease;
    controls.target.x = startLook.x + (targetLook.x - startLook.x) * ease;
    controls.target.y = startLook.y + (targetLook.y - startLook.y) * ease;
    controls.target.z = startLook.z + (targetLook.z - startLook.z) * ease;

    if (t < 1) requestAnimationFrame(step);
    else { isAnimating = false; if (callback) callback(); }
  }
  step();
}

function zoomToParchment(callback) {
  animateCamera(
    { x: -0.2, y: 2.8, z: 1.5 },
    { x: -0.2, y: 1.1, z: 0 },
    1200,
    callback
  );
}

function zoomToOverview(callback) {
  animateCamera(
    { x: 0, y: 2.5, z: 5 },
    { x: 0, y: 1.2, z: 0 },
    1200,
    callback
  );
}

// ── Audio System ──
const AU = {
  c: null, on: false, amb: null,
  toggle() {
    if (!this.c) this.c = new (window.AudioContext || window.webkitAudioContext)();
    this.on = !this.on;
    if (this.on) {
      const o = this.c.createOscillator(), g = this.c.createGain();
      o.connect(g); g.connect(this.c.destination);
      o.frequency.value = 55; o.type = 'sine'; g.gain.value = .008; o.start();
      this.amb = { o, g };
    } else {
      if (this.amb) { this.amb.g.gain.exponentialRampToValueAtTime(.001, this.c.currentTime + .5); setTimeout(() => { try { this.amb.o.stop() } catch (e) {} this.amb = null }, 500); }
    }
    return this.on;
  },
  click() { if (!this.on || !this.c) return; const o = this.c.createOscillator(), g = this.c.createGain(); o.connect(g); g.connect(this.c.destination); o.frequency.value = 880; o.type = 'sine'; g.gain.setValueAtTime(.04, this.c.currentTime); g.gain.exponentialRampToValueAtTime(.001, this.c.currentTime + .1); o.start(); o.stop(this.c.currentTime + .1); },
  success() { if (!this.on || !this.c) return; [523, 659, 784].forEach((f, i) => { const o = this.c.createOscillator(), g = this.c.createGain(); o.connect(g); g.connect(this.c.destination); o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(0, this.c.currentTime + i * .12); g.gain.linearRampToValueAtTime(.03, this.c.currentTime + i * .12 + .06); g.gain.exponentialRampToValueAtTime(.001, this.c.currentTime + i * .12 + 1.8); o.start(this.c.currentTime + i * .12); o.stop(this.c.currentTime + i * .12 + 1.8); }); },
  flip() { if (!this.on || !this.c) return; const n = this.c.createBufferSource(), b = this.c.createBuffer(1, this.c.sampleRate * .08, this.c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.c.sampleRate * .015)); n.buffer = b; const g = this.c.createGain(), f = this.c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500; n.connect(f); f.connect(g); g.connect(this.c.destination); g.gain.value = .03; n.start(); }
};

// ── Data ──
const MAJOR = [
  { n: '愚者', s: '✦', m: '新的开始正在展开。你站在悬崖边，但风会托住你。', r: '信任那个让你心跳加速的冲动。' },
  { n: '魔术师', s: '☿', m: '你手中已经握着所有需要的工具。', r: '此刻就是你施展的时刻。' },
  { n: '女祭司', s: '☽', m: '答案不在外面，在里面。你已经知道了。', r: '你内心的低语比外界的喧嚣更真实。' },
  { n: '女皇', s: '♀', m: '丰盛正在靠近。你值得拥有好的事物。', r: '接受本身就是一种力量。' },
  { n: '皇帝', s: '♂', m: '是时候为自己的生活建立结构了。', r: '边界是爱的另一种形式。' },
  { n: '恋人', s: '♡', m: '一个选择摆在你面前。', r: '听从那个让你感到"对"的方向。' },
  { n: '战车', s: '⚔', m: '前进的力量在你体内积聚。', r: '用行动回答质疑。' },
  { n: '力量', s: '🦁', m: '真正的力量是温柔地坚持。', r: '压制不是力量，接纳才是。' },
  { n: '隐士', s: '🏔', m: '是时候独处了。不是逃避，而是充电。', r: '灯塔也需要黑暗才能发光。' },
  { n: '命运之轮', s: '☸', m: '变化正在转动。', r: '轮子一直在转。' },
  { n: '正义', s: '⚖', m: '真相即将浮出水面。', r: '你已经知道什么是对的。' },
  { n: '倒吊人', s: '⚑', m: '换个角度看，答案就在那里。', r: '不行动就是最深的行动。' },
  { n: '死神', s: '♰', m: '一个章节正在结束。不是毁灭，是转化。', r: '告别是另一种开始。' },
  { n: '节制', s: '♒', m: '平衡正在恢复。', r: '刚刚好就是最好。' },
  { n: '恶魔', s: '⛓', m: '你被什么东西束缚着。锁链其实没有锁上。', r: '你随时可以离开。' },
  { n: '塔', s: '⚡', m: '有些东西必须倒塌，才能重建得更坚固。', r: '在废墟中找到真正属于你的地基。' },
  { n: '星星', s: '★', m: '希望正在回归。星星一直在那里。', r: '它们比你以为的更近。' },
  { n: '月亮', s: '☽', m: '有些事情不是表面看起来的那样。', r: '等月亮照亮那条隐藏的路。' },
  { n: '太阳', s: '☉', m: '光明正在到来。你值得这份快乐。', r: '有时候，好就是好。' },
  { n: '审判', s: '✧', m: '一个旧的召唤正在重新响起。', r: '听从那个让你感到使命感的声音。' },
  { n: '世界', s: '⊕', m: '一个循环即将完成。', r: '准备好迎接下一圈的开始。' }
];
const SUITS = ['权杖', '圣杯', '宝剑', '星币'];
const SUIT_SYM = ['🜂', '🜄', '🜁', '🜃'];
const COURTS = ['侍从', '骑士', '王后', '国王'];
const ALL_CARDS = [...MAJOR];
SUITS.forEach((s, si) => { for (let n = 1; n <= 10; n++) ALL_CARDS.push({ n: n === 1 ? 'Ace' : String(n) + ' ' + s, s: SUIT_SYM[si], m: s + '的力量正在展开。', r: s + '的能量需要平衡。' }); COURTS.forEach(c => ALL_CARDS.push({ n: c + ' of ' + s, s: SUIT_SYM[si], m: c + '代表' + s + '的智慧。', r: c + '提醒你审视与' + s + '的关系。' })); });
const DAILY = ['今天的风向变了。调整你的帆。', '你今天会遇到一个巧合。不要忽略它。', '今天适合沉默。有些答案只在安静中才会浮现。', '今天的月亮在告诉你：该收尾了。', '你今天会收到一个信号。听从它。', '今天的火焰比昨天更亮。不要压制它。', '今天的星尘落在你身上。', '今天适合做那个一直拖着的决定。', '今天的水是清澈的。现在是看清楚的最好时机。'];
const HEXAGRAMS = [{ n: '乾', j: '元亨利贞。天行健，君子以自强不息。' }, { n: '坤', j: '元亨，利牝马之贞。地势坤，君子以厚德载物。' }, { n: '屯', j: '万事开头难，耐心等待。' }, { n: '蒙', j: '学习的时刻到了。' }, { n: '需', j: '等待是最好的策略。' }, { n: '讼', j: '避免争端，退一步海阔天空。' }, { n: '泰', j: '天地交泰，万事亨通。' }, { n: '否', j: '闭塞之时，韬光养晦。' }, { n: '谦', j: '谦逊是最高的美德。' }, { n: '复', j: '一阳复始，万象更新。' }, { n: '革', j: '变革之时已到。' }, { n: '鼎', j: '革故鼎新，万象更新。' }, { n: '渐', j: '循序渐进，水到渠成。' }, { n: '丰', j: '光明丰盛，但居安思危。' }, { n: '既济', j: '完成之时，谨防倒退。' }, { n: '未济', j: '未完成，正是新的开始。' }];
const SYMBOLS = [{ s: '☉', n: '太阳', d: '在炼金术中代表黄金和意识。象征生命力、光明、自我。', t: '占星' }, { s: '☽', n: '月亮', d: '代表阴性能量、直觉、潜意识。月亮掌管情绪与内在世界。', t: '占星' }, { s: '☿', n: '水星', d: '沟通与智慧之星。在炼金术中代表水银。', t: '占星' }, { s: '♀', n: '金星', d: '爱与美之女神。象征和谐、爱情、艺术。', t: '占星' }, { s: '♂', n: '火星', d: '战争与行动之星。象征勇气、欲望、行动力。', t: '占星' }, { s: '△', n: '火之三角', d: '炼金术四大元素之一。代表意志、转化、净化。', t: '炼金术' }, { s: '▽', n: '水之三角', d: '炼金术四大元素之一。代表情感、直觉、净化。', t: '炼金术' }, { s: '◈', n: '生命之花', d: '由多个重叠圆组成的神圣几何图形。包含宇宙创造的蓝图。', t: '神圣几何' }, { s: '☯', n: '太极', d: '阴阳的统一体。代表宇宙中所有对立面的相互依存与转化。', t: '东方玄学' }, { s: '☰', n: '乾卦', d: '天。纯阳之卦。代表创造力、领导力。', t: '东方玄学' }, { s: '✦', n: '五芒星', d: '正位五芒星代表精神超越物质。', t: '塔罗' }, { s: '♰', n: '十字架', d: '物质世界与精神世界的交汇点。', t: '塔罗' }];
const DREAM_SYMBOLS = { 水: '情感与潜意识的深层流动。', 火: '转化与净化的力量。', 飞: '自由与超越的渴望。', 坠落: '失控感或对未知的恐惧。', 蛇: '智慧与疗愈。蜕皮象征重生。', 死亡: '旧的结束，新的开始。', 迷路: '人生方向的困惑。', 考试: '对自我价值的考验。', 追逐: '逃避某种情绪或责任。', 牙齿: '力量与自信。', 镜子: '自我审视。', 门: '新的机会或选择。', 雨: '情感的释放与净化。', 星星: '希望与指引。', 月亮: '直觉与女性能量。' };

// ── State ──
let cur = 'menu', recs = JSON.parse(localStorage.getItem('mr') || '[]'), du = localStorage.getItem('md') || '', dreams = JSON.parse(localStorage.getItem('dm_list') || '[]'), spreadCount = 1, ichingLines = [], ichingStep = 0, selectedCards = [];
const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove('hidden');
const hide = id => $(id).classList.add('hidden');

function inkReveal(elId, txt) { const el = $(elId); el.innerHTML = ''; let i = 0; const t = setInterval(() => { if (i >= txt.length) { clearInterval(t); return; } const s = document.createElement('span'); s.className = 'ink'; s.textContent = txt[i]; el.appendChild(s); i++; }, 28); }
function saveRec(r) { r.id = Date.now(); r.date = new Date().toLocaleDateString('zh-CN'); recs.unshift(r); localStorage.setItem('mr', JSON.stringify(recs)); }
function getMoonPhase() { const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate(); let c = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d - 1524.5; const days = c - 2451549.5, period = 29.53058867; const phase = ((days % period) + period) % period; const phases = ['🌑 新月', '🌒 蛾眉月', '🌓 上弦月', '🌔 盈凸月', '🌕 满月', '🌖 亏凸月', '🌗 下弦月', '🌘 残月']; return phases[Math.floor(phase / period * 8) % 8]; }

// ── Parchment UI ──
function showParchment(html) {
  const p = $('parchment');
  $('parch-inner').innerHTML = html;
  p.classList.add('show');
  zoomToParchment();
}

function hideParchment() {
  $('parchment').classList.remove('show');
  zoomToOverview();
}

function renderMenu() {
  const moon = getMoonPhase();
  showParchment(`
    <div class="menu-title">欢迎回来，旅人</div>
    <div class="menu-sub">今天的星辰与你上次离开时不同了。你也是。<br>${moon}</div>
    <div class="menu-divider">✦ ✦ ✦</div>
    <div class="menu-item" data-goto="tarot"><div class="mi-sym">✦</div><div class="mi-text"><div class="mi-name">塔罗占卜</div><div class="mi-desc">桌上的牌，翻转时有金粉散落</div></div><div class="mi-arrow">›</div></div>
    <div class="menu-item" data-goto="star"><div class="mi-sym">☉</div><div class="mi-text"><div class="mi-name">星盘分析</div><div class="mi-desc">天球仪，三维星图缓慢旋转</div></div><div class="mi-arrow">›</div></div>
    <div class="menu-item" data-goto="name"><div class="mi-sym">📜</div><div class="mi-text"><div class="mi-name">姓名测算</div><div class="mi-desc">羊皮纸，墨水自动书写</div></div><div class="mi-arrow">›</div></div>
    <div class="menu-item" data-goto="iching"><div class="mi-sym">☰</div><div class="mi-text"><div class="mi-name">易经占卜</div><div class="mi-desc">铜钱与卦，天地之理</div></div><div class="mi-arrow">›</div></div>
    <div class="menu-item" data-goto="daily"><div class="mi-sym">🕯</div><div class="mi-text"><div class="mi-name">每日启示</div><div class="mi-desc">桌角的蜡烛，每日燃尽显字</div></div><div class="mi-arrow">›</div></div>
    <div class="menu-item" data-goto="dream"><div class="mi-sym">☁</div><div class="mi-text"><div class="mi-name">梦境记录</div><div class="mi-desc">梦的密语，灵魂的低语</div></div><div class="mi-arrow">›</div></div>
    <div class="menu-item" data-goto="ency"><div class="mi-sym">◈</div><div class="mi-text"><div class="mi-name">符号图鉴</div><div class="mi-desc">古老的知识，永恒的符号</div></div><div class="mi-arrow">›</div></div>
    <div class="menu-item" data-goto="records"><div class="mi-sym">▦</div><div class="mi-text"><div class="mi-name">我的壁龛</div><div class="mi-desc">探索的痕迹，珍藏于此</div></div><div class="mi-arrow">›</div></div>
    <div class="rl" style="margin-top:24px">本小程序提供文化与娱乐性质的象征解读服务，不构成任何形式的预测、建议或决策依据。</div>
  `);
  bindMenuItems();
}

function bindMenuItems() {
  document.querySelectorAll('.menu-item[data-goto]').forEach(el => {
    el.onclick = () => { AU.click(); navigateTo(el.dataset.goto); };
  });
}

function navigateTo(page) {
  cur = page;
  document.querySelectorAll('.nl').forEach(l => l.classList.remove('on'));
  const link = document.querySelector(`.nl[data-p="${page}"]`);
  if (link) link.classList.add('on');
  switch (page) {
    case 'menu': renderMenu(); break;
    case 'tarot': renderTarot(); break;
    case 'star': renderStar(); break;
    case 'name': renderName(); break;
    case 'iching': renderIChing(); break;
    case 'daily': renderDaily(); break;
    case 'dream': renderDream(); break;
    case 'ency': renderEncyclopedia(); break;
    case 'records': renderRecords(); break;
  }
}

// ── Tarot ──
function renderTarot() {
  showParchment(`
    <div class="back" onclick="navigateTo('menu')">‹ 返回密室</div>
    <div class="sec-h">塔罗占卜</div>
    <div class="sec-sub">在翻开牌面之前，请在心中默念你的问题。<br>不必说出声——牌听得见。</div>
    <div class="spread-type">
      <button class="sp-opt on" data-spread="1">单牌</button>
      <button class="sp-opt" data-spread="3">三牌阵</button>
      <button class="sp-opt" data-spread="5">五牌阵</button>
    </div>
    <div id="tarot-area"><button class="btn" id="tbegin" style="width:100%">开始占卜</button></div>
  `);
  document.querySelectorAll('.sp-opt').forEach(b => { b.onclick = () => { document.querySelectorAll('.sp-opt').forEach(x => x.classList.remove('on')); b.classList.add('on'); spreadCount = parseInt(b.dataset.spread); }; });
  $('tbegin').onclick = () => { AU.click(); startTarot(); };
}

function startTarot() {
  selectedCards = [];
  $('tarot-area').innerHTML = `
    <p style="font-size:.75rem;color:var(--td);text-align:center;font-style:italic;margin-bottom:12px">深呼吸。想你的问题。</p>
    <div class="ccd"><div class="cc" id="c1"><div class="cc-f"></div><div class="cc-b"></div></div><div class="cc" id="c2"><div class="cc-f"></div><div class="cc-b"></div></div><div class="cc" id="c3"><div class="cc-f"></div><div class="cc-b"></div></div></div>
  `;
  ['c1', 'c2', 'c3'].forEach((id, i) => setTimeout(() => { $(id).classList.add('lit'); AU.click(); }, (i + 1) * 800));
  setTimeout(() => {
    let html = '<p style="font-size:.68rem;color:var(--td);text-align:center;letter-spacing:.1em;margin-bottom:10px">选择牌</p><div class="card-row">';
    const count = Math.max(spreadCount * 3, 7);
    for (let i = 0; i < count; i++) html += '<div class="card" data-idx="' + i + '"><div class="card-f">✦</div><div class="card-b"></div></div>';
    html += '</div>';
    $('tarot-area').innerHTML = html;
    document.querySelectorAll('.card').forEach(c => { c.onclick = () => pickCard(c); });
  }, 3200);
}

function pickCard(el) {
  if (el.classList.contains('flipped') || selectedCards.length >= spreadCount) return;
  AU.flip(); el.classList.add('flipped');
  const card = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];
  const rev = Math.random() > .6; card._rev = rev;
  el.querySelector('.card-b').innerHTML = '<span style="font-size:.9rem">' + card.s + '</span><span>' + card.n + '</span>' + (rev ? '<span class="rev">逆位</span>' : '');
  selectedCards.push(card);
  if (selectedCards.length >= spreadCount) setTimeout(showTarotResult, 1000);
}

function showTarotResult() {
  const labels = spreadCount === 1 ? [''] : spreadCount === 3 ? ['过去', '现在', '未来'] : ['现状', '挑战', '过去', '未来', '结果'];
  let html = '<div class="results">';
  selectedCards.forEach((card, i) => {
    html += '<div class="res-card"><div class="sym">' + card.s + '</div><div class="name">' + card.n + '</div>' + (card._rev ? '<div class="orient">逆位</div>' : '') + (labels[i] ? '<div style="font-size:.48rem;color:var(--tgh);margin-top:2px">' + labels[i] + '</div>' : '') + '</div>';
  });
  html += '</div><div class="res-txt"><p id="rt-res"></p></div><div class="rl">以上内容基于传统象征体系的文化解读，仅供娱乐与自我反思参考。</div><button class="btn btn2" id="tagain" style="width:100%">再次占卜</button>';
  $('tarot-area').innerHTML = html;
  const allText = selectedCards.map(c => (c._rev ? c.r : c.m)).join('。');
  inkReveal('rt-res', allText);
  AU.success();
  saveRec({ type: '塔罗' + (spreadCount > 1 ? ' · ' + spreadCount + '牌阵' : ''), title: selectedCards.map(c => c.n).join('、'), sym: selectedCards[0].s, txt: allText });
  $('tagain').onclick = () => { AU.click(); renderTarot(); };
}

// ── Star Chart ──
function renderStar() {
  showParchment(`
    <div class="back" onclick="navigateTo('menu')">‹ 返回密室</div>
    <div class="sec-h">星盘分析</div>
    <div class="sec-sub">你的星盘是一张灵魂的蓝图。<br>不是命运的判决书，而是宇宙在你出生时写给你的第一封信。</div>
    <div class="fg"><label>出生日期</label><input type="date" id="birth-date"></div>
    <div class="fg"><label>出生时辰（选填）</label><select id="birth-hour"><option value="">不确定</option><option value="0">子时 (23-01)</option><option value="1">丑时 (01-03)</option><option value="2">寅时 (03-05)</option><option value="3">卯时 (05-07)</option><option value="4">辰时 (07-09)</option><option value="5">巳时 (09-11)</option><option value="6">午时 (11-13)</option><option value="7">未时 (13-15)</option><option value="8">申时 (15-17)</option><option value="9">酉时 (17-19)</option><option value="10">戌时 (19-21)</option><option value="11">亥时 (21-23)</option></select></div>
    <button class="btn" id="chart-btn" style="width:100%">解读星盘</button>
    <div id="chart-result"></div>
  `);
  $('chart-btn').onclick = () => { AU.click(); analyzeChart(); };
}

function analyzeChart() {
  const date = $('birth-date').value, hour = $('birth-hour').value;
  if (!date) { alert('请输入出生日期'); return; }
  const d = new Date(date);
  const signs = ['摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座'];
  const signDates = [[1, 20], [2, 19], [3, 21], [4, 20], [5, 21], [6, 22], [7, 23], [8, 23], [9, 23], [10, 24], [11, 22], [12, 22]];
  const m = d.getMonth() + 1, day = d.getDate();
  let sun = 0;
  for (let i = 0; i < 12; i++) { if (m === signDates[i][0] && day >= signDates[i][1]) sun = (i + 1) % 12; else if (m === signDates[(i + 1) % 12][0] && day < signDates[(i + 1) % 12][1]) { sun = i; break; } }
  const moonIdx = (d.getDate() * 3 + d.getMonth() * 7) % 12;
  const ascIdx = hour ? ((parseInt(hour) * 2 + d.getDate()) % 12) : ((d.getHours() * 2) % 12);
  const desc = { '白羊座': '火象，勇气与开创', '金牛座': '土象，稳定与感官', '双子座': '风象，沟通与好奇', '巨蟹座': '水象，情感与保护', '狮子座': '火象，创造与领导', '处女座': '土象，分析与完美', '天秤座': '风象，和谐与公正', '天蝎座': '水象，深度与转化', '射手座': '火象，探索与哲学', '摩羯座': '土象，结构与野心', '水瓶座': '风象，创新与人道', '双鱼座': '水象，直觉与灵性' };
  $('chart-result').innerHTML = '<div class="planet"><div class="planet-name">☉ 太阳星座</div><div class="planet-sign">' + signs[sun] + '</div><div class="planet-desc">' + desc[signs[sun]] + '。你的核心身份与意志力。</div></div><div class="planet"><div class="planet-name">☽ 月亮星座</div><div class="planet-sign">' + signs[moonIdx] + '</div><div class="planet-desc">' + desc[signs[moonIdx]] + '。你的情感世界与内在需求。</div></div><div class="planet"><div class="planet-name">ASC 上升星座</div><div class="planet-sign">' + signs[ascIdx] + '</div><div class="planet-desc">' + desc[signs[ascIdx]] + '。你呈现给世界的第一印象。</div></div>';
  AU.success();
  saveRec({ type: '星盘', title: signs[sun] + ' · 太阳', sym: '☉', txt: '太阳' + signs[sun] + '，月亮' + signs[moonIdx] + '，上升' + signs[ascIdx] });
}

// ── Name Analysis ──
function renderName() {
  showParchment(`
    <div class="back" onclick="navigateTo('menu')">‹ 返回密室</div>
    <div class="sec-h">姓名测算</div>
    <div class="sec-sub">一卷羊皮纸缓缓展开，墨水自动书写，笔迹古老。</div>
    <div class="fg"><label>你的姓名</label><input type="text" id="name-input" placeholder="输入你的姓名" maxlength="10"></div>
    <button class="btn" id="name-btn" style="width:100%">解读姓名</button>
    <div id="name-result"></div>
  `);
  $('name-btn').onclick = () => { AU.click(); analyzeName(); };
}

function analyzeName() {
  const name = $('name-input').value.trim();
  if (!name) { alert('请输入姓名'); return; }
  const els = { 金: ['金', '鑫', '铭', '锋', '银', '钰'], 木: ['木', '林', '森', '松', '柏', '桐'], 水: ['水', '淼', '泉', '海', '江', '河'], 火: ['火', '焱', '炎', '烨', '煜', '灿'], 土: ['土', '垚', '坤', '培', '城', '坚'] };
  const counts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  for (const ch of name) { for (const [el, chars] of Object.entries(els)) { if (chars.includes(ch)) counts[el]++; } }
  const dom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const desc = { 金: '金主义。意志坚定，重义轻利。', 木: '木主仁。富有创造力，心地善良。', 水: '水主智。聪明灵活，善于适应。', 火: '火主礼。热情洋溢，富有感染力。', 土: '土主信。踏实可靠，厚德载物。' };
  const col = { 金: '#c0c0d0', 木: '#4a7', 水: '#48c', 火: '#e8a33c', 土: '#a86' };
  let html = '';
  for (const [el, cnt] of Object.entries(counts)) { if (cnt > 0) html += '<span class="el-tag" style="border-color:' + col[el] + '">' + el + ' ×' + cnt + '</span>'; }
  html += '<div class="el-desc"><p style="margin-bottom:10px">「' + name + '」的五行主导为<strong style="color:' + col[dom] + '">' + dom + '</strong></p><p>' + desc[dom] + '</p></div>';
  $('name-result').innerHTML = html;
  AU.success();
  saveRec({ type: '姓名', title: name, sym: '📜', txt: '五行主导：' + dom + '，' + desc[dom] });
}

// ── I Ching ──
function renderIChing() {
  ichingLines = []; ichingStep = 0;
  showParchment(`
    <div class="back" onclick="navigateTo('menu')">‹ 返回密室</div>
    <div class="sec-h">易经占卜</div>
    <div class="sec-sub">三枚铜钱，六次投掷，天地之理尽在其中。</div>
    <div id="iching-area"><button class="btn" id="ibegin" style="width:100%">投掷铜钱</button></div>
  `);
  $('ibegin').onclick = () => { AU.click(); startIChing(); };
}

function startIChing() {
  $('iching-area').innerHTML = '<p style="font-size:.72rem;color:var(--td);text-align:center;font-style:italic;margin-bottom:10px">心中默念问题，投掷铜钱</p><div class="coin-row"><div class="coin" id="coin1">?</div><div class="coin" id="coin2">?</div><div class="coin" id="coin3">?</div></div><p style="font-size:.65rem;color:var(--td);text-align:center" id="iching-count">第 1 / 6 爻</p><button class="btn btn-sm" id="ithrow" style="width:100%">投掷</button>';
  $('ithrow').onclick = () => throwCoins();
}

function throwCoins() {
  AU.click();
  const coins = [Math.random() > .5 ? 6 : 7, Math.random() > .5 ? 6 : 7, Math.random() > .5 ? 6 : 7];
  const sum = coins.reduce((a, b) => a + b, 0);
  ichingLines.push({ yin: sum === 6 || sum === 8, changing: sum === 6 || sum === 9 });
  ['coin1', 'coin2', 'coin3'].forEach((id, i) => { const el = $(id); el.textContent = coins[i] === 6 ? '— —' : '——'; el.classList.add('thrown'); setTimeout(() => el.classList.remove('thrown'), 600); });
  ichingStep++;
  if (ichingStep >= 6) setTimeout(showIChingResult, 800);
  else setTimeout(() => { $('iching-count').textContent = '第 ' + (ichingStep + 1) + ' / 6 爻'; ['coin1', 'coin2', 'coin3'].forEach(id => { $(id).textContent = '?'; }); }, 700);
}

function showIChingResult() {
  const binary = ichingLines.map(l => l.yin ? '0' : '1').join('');
  const upper = parseInt(binary.substring(0, 3), 2);
  const lower = parseInt(binary.substring(3, 6), 2);
  const hex = HEXAGRAMS[(upper * 8 + lower) % HEXAGRAMS.length];
  $('iching-area').innerHTML = '<div class="hex-disp">' + ichingLines.map(l => l.yin ? '— —' : '——').join('<br>') + '</div><div class="hex-name">' + hex.n + '卦</div><div class="hex-judge">' + hex.j + '</div><div class="rl">以上内容基于《易经》的文化解读，仅供娱乐与自我反思参考。</div><button class="btn btn2" id="iagain" style="width:100%">再次占卜</button>';
  AU.success();
  saveRec({ type: '易经', title: hex.n + '卦', sym: '☰', txt: hex.j });
  $('iagain').onclick = () => { AU.click(); renderIChing(); };
}

// ── Daily ──
function renderDaily() {
  const done = du === new Date().toDateString();
  showParchment(`
    <div class="back" onclick="navigateTo('menu')">‹ 返回密室</div>
    <div class="sec-h">每日启示</div>
    <div class="sec-sub">今天的蜡烛已经点燃。<br>火焰在风中摇曳，但没有熄灭——<br>就像你今天需要的那种坚持。</div>
    <div id="daily-area">
      ${done ? '<p id="dm" style="font-size:.88rem;color:var(--tg);line-height:2.2;text-align:center"></p><div class="rl">以上内容基于传统象征体系的文化解读，仅供娱乐与自我反思参考。</div>' : '<button class="btn" id="dreveal" style="width:100%">窥见今日启示</button>'}
    </div>
  `);
  if (done) { $('dm').textContent = localStorage.getItem('dm_txt') || '今日已窥见。'; }
  else {
    $('dreveal').onclick = () => {
      AU.click();
      const msg = DAILY[Math.floor(Math.random() * DAILY.length)];
      du = new Date().toDateString(); localStorage.setItem('md', du); localStorage.setItem('dm_txt', msg);
      $('daily-area').innerHTML = '<p id="dm" style="font-size:.88rem;color:var(--tg);line-height:2.2;text-align:center"></p><div class="rl">以上内容基于传统象征体系的文化解读，仅供娱乐与自我反思参考。</div>';
      inkReveal('dm', msg);
      AU.success();
      saveRec({ type: '每日启示', title: '今日启示', sym: '🕯', txt: msg });
    };
  }
}

// ── Dream ──
function renderDream() {
  let listHtml = '';
  if (!dreams.length) listHtml = '<p style="font-size:.72rem;color:var(--td);text-align:center;font-style:italic">还没有记录的梦境。</p>';
  else listHtml = dreams.map(d => '<div class="dream-entry"><div class="dream-date">' + d.date + '</div><div class="dream-text">' + d.text + '</div>' + (d.symbols.length ? '<div class="dream-symbols">' + d.symbols.map(s => '<span class="dream-tag">' + s + '</span>').join('') + '</div>' : '') + '<div class="dream-interp">' + d.interp + '</div><button class="rec-x" onclick="delDream(' + d.id + ')">抹去</button></div>').join('');
  showParchment(`
    <div class="back" onclick="navigateTo('menu')">‹ 返回密室</div>
    <div class="sec-h">梦境记录</div>
    <div class="sec-sub">梦是灵魂的密语。记录它，解读它。</div>
    <div class="fg"><label>梦境内容</label><textarea id="dream-input" placeholder="描述你的梦境..."></textarea></div>
    <button class="btn" id="dream-save" style="width:100%">记录梦境</button>
    <div style="margin-top:20px">${listHtml}</div>
  `);
  $('dream-save').onclick = () => { AU.click(); saveDream(); };
}

function saveDream() {
  const text = $('dream-input').value.trim();
  if (!text) { alert('请描述你的梦境'); return; }
  const symbols = Object.keys(DREAM_SYMBOLS).filter(s => text.includes(s));
  const interp = symbols.length > 0 ? symbols.map(s => '「' + s + '」：' + DREAM_SYMBOLS[s]).join('\n') : '这个梦境充满了个人化的象征。试着回忆其中最强烈的意象。';
  dreams.unshift({ id: Date.now(), date: new Date().toLocaleDateString('zh-CN'), text, symbols, interp });
  localStorage.setItem('dm_list', JSON.stringify(dreams));
  AU.success();
  saveRec({ type: '梦境', title: text.substring(0, 20) + '...', sym: '☁', txt: interp });
  renderDream();
}

function delDream(id) { dreams = dreams.filter(d => d.id !== id); localStorage.setItem('dm_list', JSON.stringify(dreams)); renderDream(); }

// ── Encyclopedia ──
function renderEncyclopedia() {
  let gridHtml = SYMBOLS.map((s, i) => '<div class="enc-item" data-idx="' + i + '"><div class="enc-s">' + s.s + '</div><div class="enc-n">' + s.n + '</div></div>').join('');
  showParchment(`
    <div class="back" onclick="navigateTo('menu')">‹ 返回密室</div>
    <div class="sec-h">符号图鉴</div>
    <div class="enc-grid">${gridHtml}</div>
    <div id="enc-det"></div>
  `);
  document.querySelectorAll('.enc-item').forEach(el => {
    el.onclick = () => {
      const sym = SYMBOLS[el.dataset.idx];
      $('enc-det').innerHTML = '<div class="enc-det"><h3>' + sym.s + ' ' + sym.n + '</h3><p>' + sym.d + '</p><p style="font-size:.58rem;color:var(--tgh);margin-top:6px">分类：' + sym.t + '</p></div>';
      $('enc-det').scrollIntoView({ behavior: 'smooth' });
    };
  });
}

// ── Records ──
function renderRecords() {
  let listHtml = '';
  if (!recs.length) listHtml = '<div class="re-empty"><p>壁龛空空如也。</p><p>也许你还没有准备好留下痕迹。</p><p>也许你来得太早。</p><p>也许……你来得正是时候。</p></div>';
  else listHtml = recs.map(r => '<div class="rec"><div class="rec-h"><span class="rec-t">' + r.type + '</span><span class="rec-d">' + r.date + '</span></div><div class="rec-n">' + r.sym + ' ' + r.title + '</div><div class="rec-p">' + r.txt + '</div><button class="rec-x" data-id="' + r.id + '">抹去这段痕迹</button></div>').join('');
  showParchment(`
    <div class="back" onclick="navigateTo('menu')">‹ 返回密室</div>
    <div class="sec-h">壁龛</div>
    <div class="sec-sub">你的每次探索，都被珍藏于此</div>
    ${listHtml}
  `);
  document.querySelectorAll('.rec-x[data-id]').forEach(b => {
    b.onclick = e => {
      e.stopPropagation();
      if (confirm('你确定要抹去这段痕迹吗？\n有些东西一旦消失，就再也找不回来了。')) {
        recs = recs.filter(x => x.id != b.dataset.id);
        localStorage.setItem('mr', JSON.stringify(recs));
        AU.click();
        renderRecords();
      }
    };
  });
}

// ── Settings ──
function bindSettings() {
  const sp = $('set');
  $('cog').onclick = () => { AU.click(); sp.classList.remove('hidden'); requestAnimationFrame(() => sp.classList.add('vis')); };
  const cl = () => { sp.classList.remove('vis'); setTimeout(() => sp.classList.add('hidden'), 500); };
  $('setx').onclick = cl;
  $('seto').onclick = cl;
  $('clr').onclick = () => { if (confirm('确定清除所有数据？')) { localStorage.clear(); recs = []; du = ''; dreams = []; AU.click(); } };
  $('ptog').onchange = e => { /* particle toggle */ };
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  // Init Three.js
  try {
    initScene();
  } catch (e) {
    console.error('Three.js init error:', e);
    const loadEl = document.getElementById('loading');
    if (loadEl) loadEl.querySelector('#load-status').textContent = '3D 场景加载失败，但功能仍可用';
    setTimeout(() => { if (loadEl) loadEl.remove(); }, 2000);
  }

  // Age gate
  if (localStorage.getItem('ma')) {
    $('age').remove(); $('splash').remove(); $('doors').remove();
    $('nav').style.display = '';
    camEnabled = true;
    renderMenu();
  } else {
    $('ayes').onclick = () => {
      localStorage.setItem('ma', '1');
      $('age').classList.add('out');
      setTimeout(() => { $('age').remove(); animateSplash(); }, 600);
    };
    $('ano').onclick = () => {
      document.querySelector('.age-box h2').textContent = '等你准备好了再来。';
      document.querySelector('.age-box p').textContent = '';
      document.querySelector('.age-btns').innerHTML = '<button class="btn" onclick="document.getElementById(\'age\').remove()">好的</button>';
    };
  }

  // Nav
  document.querySelectorAll('[data-p]').forEach(el => {
    el.onclick = e => { e.preventDefault(); AU.click(); navigateTo(el.dataset.p); };
  });

  bindSettings();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
});

function animateSplash() {
  document.querySelectorAll('.sl').forEach((el, i) => setTimeout(() => el.classList.add('show'), i * 300 + 200));
  setTimeout(() => { $('enter').style.opacity = '1'; $('enter').style.transform = 'translateY(0)'; }, 1600);
  $('enter').onclick = () => {
    AU.click();
    $('dl').classList.add('open');
    $('dr').classList.add('open');
    setTimeout(() => {
      $('splash').classList.add('gone');
      $('nav').style.display = '';
      camEnabled = true;
      renderMenu();
      AU.success();
    }, 900);
    setTimeout(() => { $('doors').remove(); }, 2500);
  };
}