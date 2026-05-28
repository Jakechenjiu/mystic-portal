// ========================================
// 从心而书 · 宇宙神殿
// ========================================

let scene, camera, renderer;
let stars, nebula, sacredGeo, cosmicEye;
let mouseX = 0, mouseY = 0;
let time = 0;
let camEnabled = false;
let isAnimating = false;

// ── Three.js 宇宙场景 ──
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060310);
  scene.fog = new THREE.FogExp2(0x060310, 0.015);

  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 30);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  document.body.insertBefore(renderer.domElement, document.body.firstChild);

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / innerWidth - 0.5) * 2;
    mouseY = (e.clientY / innerHeight - 0.5) * 2;
  });

  // 星场 (5000 stars)
  createStarField();
  // 星云
  createNebula();
  // 神圣几何
  createSacredGeometry();
  // 宇宙之眼
  createCosmicEye();
  // 流星
  createShootingStars();

  animate();
}

function createStarField() {
  const geo = new THREE.BufferGeometry();
  const count = 5000;
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // 黄金螺旋分布
    const theta = i * 2.399963;
    const r = Math.sqrt(i) * 2.5;
    const y = (Math.random() - 0.5) * 40;

    pos[i * 3] = Math.cos(theta) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(theta) * r;

    // 星星颜色变化
    const colorChoice = Math.random();
    if (colorChoice < 0.6) { colors[i*3]=.8; colors[i*3+1]=.75; colors[i*3+2]=.65; } // 暖白
    else if (colorChoice < 0.8) { colors[i*3]=.6; colors[i*3+1]=.65; colors[i*3+2]=.85; } // 冷蓝
    else { colors[i*3]=.85; colors[i*3+1]=.6; colors[i*3+2]=.4; } // 橙

    sizes[i] = Math.random() * 1.5 + 0.3;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  });
  stars = new THREE.Points(geo, mat);
  scene.add(stars);
}

function createNebula() {
  // 紫色星云
  const nebulaColors = [0x1a0828, 0x0d1b3e, 0x2a0838, 0x180a30];
  for (let n = 0; n < 4; n++) {
    const count = 800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 35;
      pos[i*3] = Math.cos(angle) * dist + (Math.random() - 0.5) * 10;
      pos[i*3+1] = (Math.random() - 0.5) * 20;
      pos[i*3+2] = Math.sin(angle) * dist + (Math.random() - 0.5) * 10;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: nebulaColors[n],
      size: 0.8,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const cloud = new THREE.Points(geo, mat);
    cloud.userData.rotSpeed = (Math.random() - 0.5) * 0.0002;
    scene.add(cloud);
  }
}

function createSacredGeometry() {
  // 生命之花 (由圆组成的图案)
  const flowerGroup = new THREE.Group();
  const circleMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.04, wireframe: true });

  // 中心圆 + 6个环绕圆
  const positions = [[0,0,0]];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    positions.push([Math.cos(angle) * 3, Math.sin(angle) * 3, 0]);
  }
  positions.forEach(pos => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 0.02, 8, 64), circleMat);
    ring.position.set(pos[0], pos[1], pos[2]);
    flowerGroup.add(ring);
  });

  // 正二十面体
  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(8, 0),
    new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.03, wireframe: true })
  );
  flowerGroup.add(ico);

  // 正十二面体
  const dodec = new THREE.Mesh(
    new THREE.DodecahedronGeometry(12, 0),
    new THREE.MeshBasicMaterial({ color: 0x00c8aa, transparent: true, opacity: 0.02, wireframe: true })
  );
  flowerGroup.add(dodec);

  sacredGeo = flowerGroup;
  scene.add(flowerGroup);
}

function createCosmicEye() {
  // 中央光环 (宇宙之眼)
  const torusGeo = new THREE.TorusGeometry(4, 0.05, 16, 100);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.15 });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI / 2;
  cosmicEye = torus;
  scene.add(torus);

  // 内环
  const innerTorus = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.03, 16, 80),
    new THREE.MeshBasicMaterial({ color: 0xff8c42, transparent: true, opacity: 0.1 })
  );
  innerTorus.rotation.x = Math.PI / 2;
  scene.add(innerTorus);

  // 中心光点
  const coreGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.3 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // 圣光射线
  const rayCount = 12;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const rayGeo = new THREE.PlaneGeometry(0.02, 15);
    const rayMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.02, side: THREE.DoubleSide });
    const ray = new THREE.Mesh(rayGeo, rayMat);
    ray.position.set(Math.cos(angle) * 7.5, 0, Math.sin(angle) * 7.5);
    ray.rotation.y = -angle;
    scene.add(ray);
  }
}

function createShootingStars() {
  // 流星系统
  window.shootingStars = [];
  for (let i = 0; i < 3; i++) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(6); // 2 points
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0 });
    const line = new THREE.Line(geo, mat);
    line.userData = { active: false, timer: Math.random() * 500 };
    scene.add(line);
    window.shootingStars.push(line);
  }
}

function updateShootingStars() {
  window.shootingStars.forEach(ss => {
    ss.userData.timer--;
    if (ss.userData.timer <= 0 && !ss.userData.active) {
      // 启动流星
      ss.userData.active = true;
      ss.userData.life = 1;
      const startAngle = Math.random() * Math.PI * 2;
      const startR = 30 + Math.random() * 20;
      ss.userData.sx = Math.cos(startAngle) * startR;
      ss.userData.sy = (Math.random() - 0.5) * 20;
      ss.userData.sz = Math.sin(startAngle) * startR;
      ss.userData.dx = (Math.random() - 0.5) * 2 - 1;
      ss.userData.dy = (Math.random() - 0.5) * 1;
      ss.userData.dz = (Math.random() - 0.5) * 2;
    }
    if (ss.userData.active) {
      ss.userData.life -= 0.015;
      if (ss.userData.life <= 0) {
        ss.userData.active = false;
        ss.userData.timer = 200 + Math.random() * 400;
        ss.material.opacity = 0;
        return;
      }
      const t = 1 - ss.userData.life;
      const x = ss.userData.sx + ss.userData.dx * t * 30;
      const y = ss.userData.sy + ss.userData.dy * t * 30;
      const z = ss.userData.sz + ss.userData.dz * t * 30;
      const positions = ss.geometry.attributes.position.array;
      positions[0] = x; positions[1] = y; positions[2] = z;
      positions[3] = x - ss.userData.dx * 2;
      positions[4] = y - ss.userData.dy * 2;
      positions[5] = z - ss.userData.dz * 2;
      ss.geometry.attributes.position.needsUpdate = true;
      ss.material.opacity = ss.userData.life * 0.6;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  // 宇宙呼吸 (整体明暗脉动)
  const breathe = Math.sin(time * 0.5) * 0.05 + 0.95;
  if (stars) {
    stars.rotation.y += 0.00008;
    stars.material.opacity = 0.75 * breathe;
  }

  // 神圣几何旋转
  if (sacredGeo) {
    sacredGeo.rotation.y += 0.0005;
    sacredGeo.rotation.x = Math.sin(time * 0.3) * 0.05;
  }

  // 宇宙之眼旋转 + 脉动
  if (cosmicEye) {
    cosmicEye.rotation.z += 0.001;
    cosmicEye.material.opacity = 0.12 + Math.sin(time * 1.2) * 0.04;
  }

  // 流星
  updateShootingStars();

  // 星云旋转
  scene.children.forEach(child => {
    if (child.userData && child.userData.rotSpeed) {
      child.rotation.y += child.userData.rotSpeed;
    }
  });

  // 鼠标视差
  if (camEnabled && !isAnimating) {
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.01;
    camera.position.y += (-mouseY * 1 - camera.position.y) * 0.01;
  }

  // 偶尔星语符文 (随机星星短暂组成形状)
  if (Math.random() < 0.0005 && stars) {
    const pos = stars.geometry.attributes.position;
    const idx = Math.floor(Math.random() * 5000) * 3;
    const origX = pos.array[idx], origY = pos.array[idx+1], origZ = pos.array[idx+2];
    pos.array[idx] += (Math.random() - 0.5) * 0.5;
    pos.array[idx+1] += (Math.random() - 0.5) * 0.5;
    pos.needsUpdate = true;
    setTimeout(() => { pos.array[idx]=origX; pos.array[idx+1]=origY; pos.needsUpdate=true; }, 500);
  }

  renderer.render(scene, camera);
}

function animateCamera(targetPos, duration, cb) {
  if (isAnimating) return;
  isAnimating = true;
  const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const start = Date.now();
  function step() {
    const t = Math.min((Date.now() - start) / duration, 1);
    const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    camera.position.x = startPos.x + (targetPos.x - startPos.x) * ease;
    camera.position.y = startPos.y + (targetPos.y - startPos.y) * ease;
    camera.position.z = startPos.z + (targetPos.z - startPos.z) * ease;
    if (t < 1) requestAnimationFrame(step);
    else { isAnimating = false; if (cb) cb(); }
  }
  step();
}

function zoomIn(cb) { animateCamera({ x: 0, y: 0, z: 15 }, 1200, cb); }
function zoomOut(cb) { animateCamera({ x: 0, y: 0, z: 30 }, 1200, cb); }

// ── Audio ──
const AU = {
  c: null, on: false, amb: null,
  toggle() {
    if (!this.c) this.c = new (window.AudioContext || window.webkitAudioContext)();
    this.on = !this.on;
    if (this.on) {
      const o = this.c.createOscillator(), g = this.c.createGain();
      o.connect(g); g.connect(this.c.destination);
      o.frequency.value = 50; o.type = 'sine'; g.gain.value = .006; o.start();
      this.amb = { o, g };
    } else {
      if (this.amb) { this.amb.g.gain.exponentialRampToValueAtTime(.001, this.c.currentTime + .5); setTimeout(() => { try { this.amb.o.stop() } catch(e){} this.amb = null }, 500); }
    }
    return this.on;
  },
  click() { if (!this.on || !this.c) return; const o = this.c.createOscillator(), g = this.c.createGain(); o.connect(g); g.connect(this.c.destination); o.frequency.value = 1200; o.type = 'sine'; g.gain.setValueAtTime(.03, this.c.currentTime); g.gain.exponentialRampToValueAtTime(.001, this.c.currentTime + .08); o.start(); o.stop(this.c.currentTime + .08); },
  success() { if (!this.on || !this.c) return; [523,659,784,1047].forEach((f,i) => { const o = this.c.createOscillator(), g = this.c.createGain(); o.connect(g); g.connect(this.c.destination); o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(0, this.c.currentTime + i*.15); g.gain.linearRampToValueAtTime(.025, this.c.currentTime + i*.15 + .08); g.gain.exponentialRampToValueAtTime(.001, this.c.currentTime + i*.15 + 2); o.start(this.c.currentTime + i*.15); o.stop(this.c.currentTime + i*.15 + 2); }); },
  flip() { if (!this.on || !this.c) return; const n = this.c.createBufferSource(), b = this.c.createBuffer(1, this.c.sampleRate*.06, this.c.sampleRate), d = b.getChannelData(0); for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1)*Math.exp(-i/(this.c.sampleRate*.012)); n.buffer = b; const g = this.c.createGain(); n.connect(g); g.connect(this.c.destination); g.gain.value = .03; n.start(); }
};

// ── Data ──
const MAJOR=[{n:'愚者',s:'✦',m:'新的开始正在展开。你站在悬崖边，但风会托住你。',r:'信任那个让你心跳加速的冲动。'},{n:'魔术师',s:'☿',m:'你手中已经握着所有需要的工具。',r:'此刻就是你施展的时刻。'},{n:'女祭司',s:'☽',m:'答案不在外面，在里面。你已经知道了。',r:'你内心的低语比外界的喧嚣更真实。'},{n:'女皇',s:'♀',m:'丰盛正在靠近。你值得拥有好的事物。',r:'接受本身就是一种力量。'},{n:'皇帝',s:'♂',m:'是时候为自己的生活建立结构了。',r:'边界是爱的另一种形式。'},{n:'恋人',s:'♡',m:'一个选择摆在你面前。',r:'听从那个让你感到"对"的方向。'},{n:'战车',s:'⚔',m:'前进的力量在你体内积聚。',r:'用行动回答质疑。'},{n:'力量',s:'🦁',m:'真正的力量是温柔地坚持。',r:'压制不是力量，接纳才是。'},{n:'隐士',s:'🏔',m:'是时候独处了。不是逃避，而是充电。',r:'灯塔也需要黑暗才能发光。'},{n:'命运之轮',s:'☸',m:'变化正在转动。',r:'轮子一直在转。'},{n:'正义',s:'⚖',m:'真相即将浮出水面。',r:'你已经知道什么是对的。'},{n:'倒吊人',s:'⚑',m:'换个角度看，答案就在那里。',r:'不行动就是最深的行动。'},{n:'死神',s:'♰',m:'一个章节正在结束。不是毁灭，是转化。',r:'告别是另一种开始。'},{n:'节制',s:'♒',m:'平衡正在恢复。',r:'刚刚好就是最好。'},{n:'恶魔',s:'⛓',m:'你被什么东西束缚着。锁链其实没有锁上。',r:'你随时可以离开。'},{n:'塔',s:'⚡',m:'有些东西必须倒塌，才能重建得更坚固。',r:'在废墟中找到真正属于你的地基。'},{n:'星星',s:'★',m:'希望正在回归。星星一直在那里。',r:'它们比你以为的更近。'},{n:'月亮',s:'☽',m:'有些事情不是表面看起来的那样。',r:'等月亮照亮那条隐藏的路。'},{n:'太阳',s:'☉',m:'光明正在到来。你值得这份快乐。',r:'有时候，好就是好。'},{n:'审判',s:'✧',m:'一个旧的召唤正在重新响起。',r:'听从那个让你感到使命感的声音。'},{n:'世界',s:'⊕',m:'一个循环即将完成。',r:'准备好迎接下一圈的开始。'}];
const SUITS=['权杖','圣杯','宝剑','星币'];const SYM=['🜂','🜄','🜁','🜃'];const COURTS=['侍从','骑士','王后','国王'];
const ALL=[...MAJOR];SUITS.forEach((s,si)=>{for(let n=1;n<=10;n++)ALL.push({n:n===1?'Ace':n+' '+s,s:SYM[si],m:s+'的力量正在展开。',r:s+'的能量需要平衡。'});COURTS.forEach(c=>ALL.push({n:c+' of '+s,s:SYM[si],m:c+'代表'+s+'的智慧。',r:c+'提醒你审视与'+s+'的关系。'}))});
const DAILY=['今天的风向变了。调整你的帆。','你今天会遇到一个巧合。不要忽略它。','今天适合沉默。有些答案只在安静中才会浮现。','今天的月亮在告诉你：该收尾了。','你今天会收到一个信号。听从它。','今天的火焰比昨天更亮。不要压制它。','今天的星尘落在你身上。','今天适合做那个一直拖着的决定。','今天的水是清澈的。现在是看清楚的最好时机。'];
const HEX=[{n:'乾',j:'元亨利贞。天行健，君子以自强不息。'},{n:'坤',j:'地势坤，君子以厚德载物。'},{n:'屯',j:'万事开头难，耐心等待。'},{n:'蒙',j:'学习的时刻到了。'},{n:'泰',j:'天地交泰，万事亨通。'},{n:'否',j:'闭塞之时，韬光养晦。'},{n:'谦',j:'谦逊是最高的美德。'},{n:'复',j:'一阳复始，万象更新。'},{n:'革',j:'变革之时已到。'},{n:'鼎',j:'革故鼎新，万象更新。'},{n:'渐',j:'循序渐进，水到渠成。'},{n:'未济',j:'未完成，正是新的开始。'}];
const SYMS=[{s:'☉',n:'太阳',d:'在炼金术中代表黄金和意识。象征生命力、光明、自我。',t:'占星'},{s:'☽',n:'月亮',d:'代表阴性能量、直觉、潜意识。月亮掌管情绪与内在世界。',t:'占星'},{s:'☿',n:'水星',d:'沟通与智慧之星。在炼金术中代表水银。',t:'占星'},{s:'♀',n:'金星',d:'爱与美之女神。象征和谐、爱情、艺术。',t:'占星'},{s:'♂',n:'火星',d:'战争与行动之星。象征勇气、欲望、行动力。',t:'占星'},{s:'△',n:'火之三角',d:'炼金术四大元素之一。代表意志、转化、净化。',t:'炼金术'},{s:'◈',n:'生命之花',d:'由多个重叠圆组成的神圣几何图形。包含宇宙创造的蓝图。',t:'神圣几何'},{s:'☯',n:'太极',d:'阴阳的统一体。代表宇宙中所有对立面的相互依存与转化。',t:'东方玄学'},{s:'☰',n:'乾卦',d:'天。纯阳之卦。代表创造力、领导力。',t:'东方玄学'},{s:'✦',n:'五芒星',d:'正位五芒星代表精神超越物质。',t:'塔罗'},{s:'♰',n:'十字架',d:'物质世界与精神世界的交汇点。',t:'塔罗'}];
const DS={水:'情感与潜意识的深层流动。',火:'转化与净化的力量。',飞:'自由与超越的渴望。',坠落:'失控感或对未知的恐惧。',蛇:'智慧与疗愈。',死亡:'旧的结束，新的开始。',迷路:'人生方向的困惑。',追逐:'逃避某种情绪或责任。',星星:'希望与指引。',月亮:'直觉与女性能量。'};

// ── State ──
let cur='menu',recs=JSON.parse(localStorage.getItem('mr')||'[]'),du=localStorage.getItem('md')||'',dreams=JSON.parse(localStorage.getItem('dm_list')||'[]'),spreadCount=1,ichingLines=[],ichingStep=0,selCards=[];
const $=id=>document.getElementById(id);
const show=id=>$(id).classList.remove('hidden');
const hide=id=>$(id).classList.add('hidden');
function inkReveal(elId,txt){const el=$(elId);el.innerHTML='';let i=0;const t=setInterval(()=>{if(i>=txt.length){clearInterval(t);return}const s=document.createElement('span');s.className='ink';s.textContent=txt[i];el.appendChild(s);i++},25)}
function saveRec(r){r.id=Date.now();r.date=new Date().toLocaleDateString('zh-CN');recs.unshift(r);localStorage.setItem('mr',JSON.stringify(recs))}
function getMoonPhase(){const n=new Date(),y=n.getFullYear(),m=n.getMonth()+1,d=n.getDate();let c=Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d-1524.5;const days=c-2451549.5,period=29.53058867;const phase=((days%period)+period)%period;return['🌑 新月','🌒 蛾眉月','🌓 上弦月','🌔 盈凸月','🌕 满月','🌖 亏凸月','🌗 下弦月','🌘 残月'][Math.floor(phase/period*8)%8]}

// ── Panel UI ──
function showPanel(html){
  $('panel-inner').innerHTML=html;
  $('panel').classList.add('show');
  zoomIn();
}
function hidePanel(){
  $('panel').classList.remove('show');
  zoomOut();
}
function renderMenu(){
  showPanel(`
    <div class="menu-title">欢迎回来，旅人</div>
    <div class="menu-sub">今天的星辰与你上次离开时不同了。你也是。<br>${getMoonPhase()}</div>
    <div class="menu-div">✦ ✦ ✦</div>
    <div class="mi" data-g="tarot"><div class="mi-s">✦</div><div class="mi-t"><div class="mi-n">塔罗占卜</div><div class="mi-d">翻转牌面，金粉散落</div></div><div class="mi-a">›</div></div>
    <div class="mi" data-g="star"><div class="mi-s">☉</div><div class="mi-t"><div class="mi-n">星盘分析</div><div class="mi-d">灵魂的蓝图，宇宙的信</div></div><div class="mi-a">›</div></div>
    <div class="mi" data-g="name"><div class="mi-s">📜</div><div class="mi-t"><div class="mi-n">姓名测算</div><div class="mi-d">墨水自动书写，笔迹古老</div></div><div class="mi-a">›</div></div>
    <div class="mi" data-g="iching"><div class="mi-s">☰</div><div class="mi-t"><div class="mi-n">易经占卜</div><div class="mi-d">三枚铜钱，天地之理</div></div><div class="mi-a">›</div></div>
    <div class="mi" data-g="daily"><div class="mi-s">🕯</div><div class="mi-t"><div class="mi-n">每日启示</div><div class="mi-d">蜡烛燃尽，灰烬中显字</div></div><div class="mi-a">›</div></div>
    <div class="mi" data-g="dream"><div class="mi-s">☁</div><div class="mi-t"><div class="mi-n">梦境记录</div><div class="mi-d">梦是灵魂的密语</div></div><div class="mi-a">›</div></div>
    <div class="mi" data-g="ency"><div class="mi-s">◈</div><div class="mi-t"><div class="mi-n">符号图鉴</div><div class="mi-d">古老的知识，永恒的符号</div></div><div class="mi-a">›</div></div>
    <div class="mi" data-g="records"><div class="mi-s">▦</div><div class="mi-t"><div class="mi-n">我的壁龛</div><div class="mi-d">探索的痕迹，珍藏于此</div></div><div class="mi-a">›</div></div>
    <div class="rl" style="margin-top:20px">本小程序提供文化与娱乐性质的象征解读服务，不构成任何形式的预测、建议或决策依据。</div>
  `);
  document.querySelectorAll('.mi[data-g]').forEach(el=>{el.onclick=()=>{AU.click();nav(el.dataset.g)}});
}

function nav(p){
  cur=p;
  document.querySelectorAll('.nl').forEach(l=>l.classList.remove('on'));
  const l=document.querySelector(`.nl[data-p="${p}"]`);if(l)l.classList.add('on');
  switch(p){
    case 'menu':renderMenu();break;
    case 'tarot':renderTarot();break;
    case 'star':renderStar();break;
    case 'name':renderName();break;
    case 'iching':renderIChing();break;
    case 'daily':renderDaily();break;
    case 'dream':renderDream();break;
    case 'ency':renderEnc();break;
    case 'records':renderRecs();break;
  }
}

// ── Tarot ──
function renderTarot(){
  showPanel(`<div class="back" onclick="nav('menu')">‹ 返回密室</div><div class="sh">塔罗占卜</div><div class="ss">在翻开牌面之前，请在心中默念你的问题。<br>不必说出声——牌听得见。</div><div class="st"><button class="so on" data-s="1">单牌</button><button class="so" data-s="3">三牌阵</button><button class="so" data-s="5">五牌阵</button></div><div id="ta"><button class="btn" id="tb" style="width:100%">开始占卜</button></div>`);
  document.querySelectorAll('.so').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.so').forEach(x=>x.classList.remove('on'));b.classList.add('on');spreadCount=parseInt(b.dataset.s)}});
  $('tb').onclick=()=>{AU.click();startTarot()};
}
function startTarot(){
  selCards=[];
  $('ta').innerHTML='<p style="font-size:.68rem;color:var(--td);text-align:center;font-style:italic;margin-bottom:10px">深呼吸。想你的问题。</p><div class="ccd"><div class="cc" id="c1"><div class="cc-f"></div><div class="cc-b"></div></div><div class="cc" id="c2"><div class="cc-f"></div><div class="cc-b"></div></div><div class="cc" id="c3"><div class="cc-f"></div><div class="cc-b"></div></div></div>';
  ['c1','c2','c3'].forEach((id,i)=>setTimeout(()=>{$(id).classList.add('lit');AU.click()},(i+1)*900));
  setTimeout(()=>{
    let h='<p style="font-size:.62rem;color:var(--td);text-align:center;letter-spacing:.12em;margin-bottom:10px">选择牌</p><div class="cr">';
    for(let i=0;i<Math.max(spreadCount*3,7);i++) h+='<div class="crd"><div class="crd-f">✦</div><div class="crd-b"></div></div>';
    h+='</div>';$('ta').innerHTML=h;
    document.querySelectorAll('.crd').forEach(c=>{c.onclick=()=>pickCard(c)});
  },3500);
}
function pickCard(el){
  if(el.classList.contains('flipped')||selCards.length>=spreadCount)return;
  AU.flip();el.classList.add('flipped');
  const card=ALL[Math.floor(Math.random()*ALL.length)];
  const rev=Math.random()>.6;card._rev=rev;
  el.querySelector('.crd-b').innerHTML='<span style="font-size:.85rem">'+card.s+'</span><span>'+card.n+'</span>'+(rev?'<span class="rev">逆位</span>':'');
  selCards.push(card);
  if(selCards.length>=spreadCount)setTimeout(showTarotRes,1000);
}
function showTarotRes(){
  const labels=spreadCount===1?['']:spreadCount===3?['过去','现在','未来']:['现状','挑战','过去','未来','结果'];
  let h='<div class="res">';
  selCards.forEach((c,i)=>{h+='<div class="rc2"><div class="sym">'+c.s+'</div><div class="name">'+c.n+'</div>'+(c._rev?'<div class="orient">逆位</div>':'')+(labels[i]?'<div style="font-size:.42rem;color:var(--tgh);margin-top:2px">'+labels[i]+'</div>':'')+'</div>'});
  h+='</div><div class="rt"><p id="rtr"></p></div><div class="rl">以上内容基于传统象征体系的文化解读，仅供娱乐与自我反思参考。</div><button class="btn btn2" id="ta2" style="width:100%">再次占卜</button>';
  $('ta').innerHTML=h;
  inkReveal('rtr',selCards.map(c=>c._rev?c.r:c.m).join('。'));
  AU.success();
  saveRec({type:'塔罗'+(spreadCount>1?' · '+spreadCount+'牌阵':''),title:selCards.map(c=>c.n).join('、'),sym:selCards[0].s,txt:selCards.map(c=>c._rev?c.r:c.m).join('。')});
  $('ta2').onclick=()=>{AU.click();renderTarot()};
}

// ── Star ──
function renderStar(){
  showPanel(`<div class="back" onclick="nav('menu')">‹ 返回密室</div><div class="sh">星盘分析</div><div class="ss">你的星盘是一张灵魂的蓝图。<br>不是命运的判决书，而是宇宙在你出生时写给你的第一封信。</div><div class="fg"><label>出生日期</label><input type="date" id="bd"></div><div class="fg"><label>出生时辰（选填）</label><select id="bh"><option value="">不确定</option><option value="0">子时 (23-01)</option><option value="1">丑时 (01-03)</option><option value="2">寅时 (03-05)</option><option value="3">卯时 (05-07)</option><option value="4">辰时 (07-09)</option><option value="5">巳时 (09-11)</option><option value="6">午时 (11-13)</option><option value="7">未时 (13-15)</option><option value="8">申时 (15-17)</option><option value="9">酉时 (17-19)</option><option value="10">戌时 (19-21)</option><option value="11">亥时 (21-23)</option></select></div><button class="btn" id="cb" style="width:100%">解读星盘</button><div id="cr"></div>`);
  $('cb').onclick=()=>{AU.click();doChart()};
}
function doChart(){
  const date=$('bd').value,hour=$('bh').value;
  if(!date){alert('请输入出生日期');return}
  const d=new Date(date),signs=['摩羯座','水瓶座','双鱼座','白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座'];
  const sd=[[1,20],[2,19],[3,21],[4,20],[5,21],[6,22],[7,23],[8,23],[9,23],[10,24],[11,22],[12,22]];
  const m=d.getMonth()+1,day=d.getDate();let sun=0;
  for(let i=0;i<12;i++){if(m===sd[i][0]&&day>=sd[i][1])sun=(i+1)%12;else if(m===sd[(i+1)%12][0]&&day<sd[(i+1)%12][1]){sun=i;break}}
  const moon=(d.getDate()*3+d.getMonth()*7)%12,asc=hour?(parseInt(hour)*2+d.getDate())%12:(d.getHours()*2)%12;
  const desc={'白羊座':'火象，勇气与开创','金牛座':'土象，稳定与感官','双子座':'风象，沟通与好奇','巨蟹座':'水象，情感与保护','狮子座':'火象，创造与领导','处女座':'土象，分析与完美','天秤座':'风象，和谐与公正','天蝎座':'水象，深度与转化','射手座':'火象，探索与哲学','摩羯座':'土象，结构与野心','水瓶座':'风象，创新与人道','双鱼座':'水象，直觉与灵性'};
  $('cr').innerHTML='<div class="pl"><div class="pl-n">☉ 太阳星座</div><div class="pl-s">'+signs[sun]+'</div><div class="pl-d">'+desc[signs[sun]]+'。你的核心身份与意志力。</div></div><div class="pl"><div class="pl-n">☽ 月亮星座</div><div class="pl-s">'+signs[moon]+'</div><div class="pl-d">'+desc[signs[moon]]+'。你的情感世界与内在需求。</div></div><div class="pl"><div class="pl-n">ASC 上升星座</div><div class="pl-s">'+signs[asc]+'</div><div class="pl-d">'+desc[signs[asc]]+'。你呈现给世界的第一印象。</div></div>';
  AU.success();saveRec({type:'星盘',title:signs[sun]+' · 太阳',sym:'☉',txt:'太阳'+signs[sun]+'，月亮'+signs[moon]+'，上升'+signs[asc]});
}

// ── Name ──
function renderName(){
  showPanel(`<div class="back" onclick="nav('menu')">‹ 返回密室</div><div class="sh">姓名测算</div><div class="ss">一卷羊皮纸缓缓展开，墨水自动书写，笔迹古老。</div><div class="fg"><label>你的姓名</label><input type="text" id="ni" placeholder="输入你的姓名" maxlength="10"></div><button class="btn" id="nb" style="width:100%">解读姓名</button><div id="nr"></div>`);
  $('nb').onclick=()=>{AU.click();doName()};
}
function doName(){
  const name=$('ni').value.trim();if(!name){alert('请输入姓名');return}
  const els={金:['金','鑫','铭','锋','银','钰'],木:['木','林','森','松','柏','桐'],水:['水','淼','泉','海','江','河'],火:['火','焱','炎','烨','煜','灿'],土:['土','垚','坤','培','城','坚']};
  const cnt={金:0,木:0,水:0,火:0,土:0};
  for(const ch of name)for(const[el,chars]of Object.entries(els))if(chars.includes(ch))cnt[el]++;
  const dom=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];
  const desc={金:'金主义。意志坚定，重义轻利。',木:'木主仁。富有创造力，心地善良。',水:'水主智。聪明灵活，善于适应。',火:'火主礼。热情洋溢，富有感染力。',土:'土主信。踏实可靠，厚德载物。'};
  const col={金:'#c0c0d0',木:'#4a7',水:'#48c',火:'#ff8c42',土:'#a86'};
  let h='';for(const[el,c]of Object.entries(cnt))if(c>0)h+='<span class="et" style="border-color:'+col[el]+'">'+el+' ×'+c+'</span>';
  h+='<div class="ed"><p style="margin-bottom:10px">「'+name+'」的五行主导为<strong style="color:'+col[dom]+'">'+dom+'</strong></p><p>'+desc[dom]+'</p></div>';
  $('nr').innerHTML=h;AU.success();saveRec({type:'姓名',title:name,sym:'📜',txt:'五行主导：'+dom});
}

// ── I Ching ──
function renderIChing(){
  ichingLines=[];ichingStep=0;
  showPanel(`<div class="back" onclick="nav('menu')">‹ 返回密室</div><div class="sh">易经占卜</div><div class="ss">三枚铜钱，六次投掷，天地之理尽在其中。</div><div id="ia"><button class="btn" id="ib" style="width:100%">投掷铜钱</button></div>`);
  $('ib').onclick=()=>{AU.click();startICH()};
}
function startICH(){
  $('ia').innerHTML='<p style="font-size:.68rem;color:var(--td);text-align:center;font-style:italic;margin-bottom:10px">心中默念问题，投掷铜钱</p><div class="cn-r"><div class="cn" id="cn1">?</div><div class="cn" id="cn2">?</div><div class="cn" id="cn3">?</div></div><p style="font-size:.6rem;color:var(--td);text-align:center" id="ic">第 1 / 6 爻</p><button class="btn btn-sm" id="it" style="width:100%">投掷</button>';
  $('it').onclick=()=>throwCN();
}
function throwCN(){
  AU.click();
  const coins=[Math.random()>.5?6:7,Math.random()>.5?6:7,Math.random()>.5?6:7];
  const sum=coins.reduce((a,b)=>a+b,0);
  ichingLines.push({yin:sum===6||sum===8,changing:sum===6||sum===9});
  ['cn1','cn2','cn3'].forEach((id,i)=>{const el=$(id);el.textContent=coins[i]===6?'— —':'——';el.classList.add('thrown');setTimeout(()=>el.classList.remove('thrown'),600)});
  ichingStep++;
  if(ichingStep>=6)setTimeout(showICHRes,800);
  else setTimeout(()=>{$('ic').textContent='第 '+(ichingStep+1)+' / 6 爻';['cn1','cn2','cn3'].forEach(id=>{$(id).textContent='?'})},700);
}
function showICHRes(){
  const hex=HEX[Math.floor(Math.random()*HEX.length)];
  $('ia').innerHTML='<div class="hd">'+ichingLines.map(l=>l.yin?'— —':'——').join('<br>')+'</div><div class="hn">'+hex.n+'卦</div><div class="hj">'+hex.j+'</div><div class="rl">以上内容基于《易经》的文化解读，仅供娱乐与自我反思参考。</div><button class="btn btn2" id="ia2" style="width:100%">再次占卜</button>';
  AU.success();saveRec({type:'易经',title:hex.n+'卦',sym:'☰',txt:hex.j});
  $('ia2').onclick=()=>{AU.click();renderIChing()};
}

// ── Daily ──
function renderDaily(){
  const done=du===new Date().toDateString();
  showPanel(`<div class="back" onclick="nav('menu')">‹ 返回密室</div><div class="sh">每日启示</div><div class="ss">今天的蜡烛已经点燃。<br>火焰在风中摇曳，但没有熄灭——<br>就像你今天需要的那种坚持。</div><div id="da">${done?'<p id="dm" style="font-size:.82rem;color:var(--gold);line-height:2.4;text-align:center"></p><div class="rl">以上内容基于传统象征体系的文化解读，仅供娱乐与自我反思参考。</div>':'<button class="btn" id="dr" style="width:100%">窥见今日启示</button>'}</div>`);
  if(done)$('dm').textContent=localStorage.getItem('dt')||'今日已窥见。';
  else $('dr').onclick=()=>{AU.click();const msg=DAILY[Math.floor(Math.random()*DAILY.length)];du=new Date().toDateString();localStorage.setItem('md',du);localStorage.setItem('dt',msg);$('da').innerHTML='<p id="dm" style="font-size:.82rem;color:var(--gold);line-height:2.4;text-align:center"></p><div class="rl">以上内容基于传统象征体系的文化解读，仅供娱乐与自我反思参考。</div>';inkReveal('dm',msg);AU.success();saveRec({type:'每日启示',title:'今日启示',sym:'🕯',txt:msg})};
}

// ── Dream ──
function renderDream(){
  let lh=!dreams.length?'<p style="font-size:.68rem;color:var(--td);text-align:center;font-style:italic">还没有记录的梦境。</p>':dreams.map(d=>'<div class="de"><div class="de-d">'+d.date+'</div><div class="de-t">'+d.text+'</div>'+(d.symbols.length?'<div class="de-s">'+d.symbols.map(s=>'<span class="de-tag">'+s+'</span>').join('')+'</div>':'')+'<div class="de-i">'+d.interp+'</div><button class="rec-x" onclick="delDream('+d.id+')">抹去</button></div>').join('');
  showPanel(`<div class="back" onclick="nav('menu')">‹ 返回密室</div><div class="sh">梦境记录</div><div class="ss">梦是灵魂的密语。记录它，解读它。</div><div class="fg"><label>梦境内容</label><textarea id="di" placeholder="描述你的梦境..."></textarea></div><button class="btn" id="ds" style="width:100%">记录梦境</button><div style="margin-top:18px">${lh}</div>`);
  $('ds').onclick=()=>{AU.click();doDream()};
}
function doDream(){
  const text=$('di').value.trim();if(!text){alert('请描述你的梦境');return}
  const symbols=Object.keys(DS).filter(s=>text.includes(s));
  const interp=symbols.length>0?symbols.map(s=>'「'+s+'」：'+DS[s]).join('\n'):'这个梦境充满了个人化的象征。试着回忆其中最强烈的意象。';
  dreams.unshift({id:Date.now(),date:new Date().toLocaleDateString('zh-CN'),text,symbols,interp});
  localStorage.setItem('dm_list',JSON.stringify(dreams));AU.success();
  saveRec({type:'梦境',title:text.substring(0,20)+'...',sym:'☁',txt:interp});renderDream();
}
function delDream(id){dreams=dreams.filter(d=>d.id!==id);localStorage.setItem('dm_list',JSON.stringify(dreams));renderDream()}

// ── Encyclopedia ──
function renderEnc(){
  let gh=SYMS.map((s,i)=>'<div class="ei" data-i="'+i+'"><div class="ei-s">'+s.s+'</div><div class="ei-n">'+s.n+'</div></div>').join('');
  showPanel(`<div class="back" onclick="nav('menu')">‹ 返回密室</div><div class="sh">符号图鉴</div><div class="eg">${gh}</div><div id="ed"></div>`);
  document.querySelectorAll('.ei').forEach(el=>{el.onclick=()=>{const sym=SYMS[el.dataset.i];$('ed').innerHTML='<div class="ed2"><h3>'+sym.s+' '+sym.n+'</h3><p>'+sym.d+'</p><p style="font-size:.52rem;color:var(--tgh);margin-top:6px">分类：'+sym.t+'</p></div>';$('ed').scrollIntoView({behavior:'smooth'})}});
}

// ── Records ──
function renderRecs(){
  let lh=!recs.length?'<div class="re-e"><p>壁龛空空如也。</p><p>也许你还没有准备好留下痕迹。</p><p>也许你来得太早。</p><p>也许……你来得正是时候。</p></div>':recs.map(r=>'<div class="rec"><div class="rec-h"><span class="rec-t">'+r.type+'</span><span class="rec-d">'+r.date+'</span></div><div class="rec-n">'+r.sym+' '+r.title+'</div><div class="rec-p">'+r.txt+'</div><button class="rec-x" data-id="'+r.id+'">抹去这段痕迹</button></div>').join('');
  showPanel(`<div class="back" onclick="nav('menu')">‹ 返回密室</div><div class="sh">壁龛</div><div class="ss">你的每次探索，都被珍藏于此</div>${lh}`);
  document.querySelectorAll('.rec-x[data-id]').forEach(b=>{b.onclick=e=>{e.stopPropagation();if(confirm('你确定要抹去这段痕迹吗？')){recs=recs.filter(x=>x.id!=b.dataset.id);localStorage.setItem('mr',JSON.stringify(recs));AU.click();renderRecs()}}});
}

// ── Settings ──
function bindSettings(){
  const sp=$('set');
  $('cog').onclick=()=>{AU.click();sp.classList.remove('hidden');requestAnimationFrame(()=>sp.classList.add('vis'))};
  const cl=()=>{sp.classList.remove('vis');setTimeout(()=>sp.classList.add('hidden'),500)};
  $('setx').onclick=cl;$('seto').onclick=cl;
  $('clr').onclick=()=>{if(confirm('确定清除所有数据？')){localStorage.clear();recs=[];du='';dreams=[];AU.click()}};
  $('ptog').onchange=()=>{};
}

// ── Init ──
document.addEventListener('DOMContentLoaded',()=>{
  try{initScene()}catch(e){console.error(e);const l=$('loading');if(l)l.remove()}
  setTimeout(()=>{const l=$('loading');if(l){l.style.opacity='0';l.style.transition='opacity 1s';setTimeout(()=>l.remove(),1000)}},2000);

  if(localStorage.getItem('ma')){
    $('age').remove();$('splash').remove();$('doors').remove();
    $('nav').style.display='';camEnabled=true;renderMenu();
  }else{
    $('ayes').onclick=()=>{localStorage.setItem('ma','1');$('age').classList.add('out');setTimeout(()=>{$('age').remove();doSplash()},600)};
    $('ano').onclick=()=>{document.querySelector('.age-box h2').textContent='等你准备好了再来。';document.querySelector('.age-box p').textContent='';document.querySelector('.age-btns').innerHTML='<button class="btn" onclick="document.getElementById(\'age\').remove()">好的</button>'};
  }
  document.querySelectorAll('[data-p]').forEach(el=>{el.onclick=e=>{e.preventDefault();AU.click();nav(el.dataset.p)}});
  bindSettings();
  window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
});

function doSplash(){
  document.querySelectorAll('.sl').forEach((el,i)=>setTimeout(()=>el.classList.add('show'),i*400+300));
  setTimeout(()=>{$('enter').style.opacity='1';$('enter').style.transform='translateY(0)'},2000);
  $('enter').onclick=()=>{
    AU.click();$('dl').classList.add('open');$('dr').classList.add('open');
    setTimeout(()=>{$('splash').classList.add('gone');$('nav').style.display='';camEnabled=true;renderMenu();AU.success()},1000);
    setTimeout(()=>$('doors').remove(),3000);
  };
}