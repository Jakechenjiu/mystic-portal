/**
 * 从心而书 · 神秘学殿堂
 */

// ========== 粒子系统 ==========
const particles = {
  canvas: null, ctx: null, list: [], enabled: true,
  init() {
    this.canvas = document.getElementById('particles-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  },
  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; },
  addEmber() {
    this.list.push({
      type: 'ember', x: Math.random() * this.canvas.width, y: this.canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.3, vy: -(Math.random() * 0.6 + 0.2),
      size: Math.random() * 2 + 1, life: 1, decay: Math.random() * 0.003 + 0.001,
      color: Math.random() > 0.5 ? '#e8a33c' : '#b8962e'
    });
  },
  addDust() {
    this.list.push({
      type: 'dust', x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.1, vy: Math.random() * 0.05,
      size: Math.random() * 1.5 + 0.5, life: 1, decay: Math.random() * 0.002 + 0.0005,
      color: '#c0c0d0', twinkle: Math.random() * Math.PI * 2
    });
  },
  addRune() {
    const symbols = ['✦', '☽', '☿', '♃', '♄', '☉', '△', '◇'];
    this.list.push({
      type: 'rune', x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      size: Math.random() * 10 + 8, life: 1, decay: 0.03, color: '#b8962e'
    });
  },
  loop() {
    if (!this.enabled) { requestAnimationFrame(() => this.loop()); return; }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (Math.random() < 0.03) this.addEmber();
    if (Math.random() < 0.05) this.addDust();
    if (Math.random() < 0.002) this.addRune();
    this.list = this.list.filter(p => {
      p.life -= p.decay;
      if (p.life <= 0) return false;
      if (p.type === 'ember') {
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.2; p.y += p.vy;
        this.ctx.globalAlpha = p.life * 0.8; this.ctx.fillStyle = p.color;
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.globalAlpha = p.life * 0.2;
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2); this.ctx.fill();
      }
      if (p.type === 'dust') {
        p.x += p.vx; p.y += p.vy; p.twinkle += 0.02;
        this.ctx.globalAlpha = p.life * ((Math.sin(p.twinkle) + 1) / 2) * 0.5;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); this.ctx.fill();
      }
      if (p.type === 'rune') {
        this.ctx.globalAlpha = p.life; this.ctx.fillStyle = p.color;
        this.ctx.font = `${p.size}px serif`; this.ctx.textAlign = 'center';
        this.ctx.fillText(p.symbol, p.x, p.y);
      }
      this.ctx.globalAlpha = 1;
      return true;
    });
    requestAnimationFrame(() => this.loop());
  }
};

// ========== 音效系统 ==========
const audio = {
  ctx: null, enabled: false, ambient: null,
  init() { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  toggle() {
    if (!this.ctx) this.init();
    this.enabled = !this.enabled;
    if (this.enabled) this.startAmbient(); else this.stopAmbient();
    return this.enabled;
  },
  click() {
    if (!this.enabled || !this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.frequency.value = 800; o.type = 'sine';
    g.gain.setValueAtTime(0.06, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    o.start(); o.stop(this.ctx.currentTime + 0.12);
  },
  success() {
    if (!this.enabled || !this.ctx) return;
    [523, 659, 784].forEach((f, i) => {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.connect(g); g.connect(this.ctx.destination);
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
      g.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + i * 0.1 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 1.5);
      o.start(this.ctx.currentTime + i * 0.1); o.stop(this.ctx.currentTime + i * 0.1 + 1.5);
    });
  },
  cardFlip() {
    if (!this.enabled || !this.ctx) return;
    const n = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    n.buffer = buf;
    const g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 2000;
    n.connect(f); f.connect(g); g.connect(this.ctx.destination);
    g.gain.value = 0.04; n.start();
  },
  bell() {
    if (!this.enabled || !this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.frequency.value = 220; o.type = 'sine';
    g.gain.setValueAtTime(0.02, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3);
    o.start(); o.stop(this.ctx.currentTime + 3);
  },
  startAmbient() {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.frequency.value = 60; o.type = 'sine'; g.gain.value = 0.012;
    o.start(); this.ambient = { o, g };
    this.bellTimer = setInterval(() => this.bell(), 30000);
  },
  stopAmbient() {
    if (this.ambient) {
      this.ambient.g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      setTimeout(() => { try { this.ambient.o.stop(); } catch(e) {} this.ambient = null; }, 500);
    }
    if (this.bellTimer) { clearInterval(this.bellTimer); this.bellTimer = null; }
  }
};

// ========== 塔罗牌数据 ==========
const TAROT = [
  { name: '愚者', symbol: '✦', meaning: '新的开始正在展开。你站在悬崖边，但风会托住你。此刻的力量正在把你推向未知——那是你一直回避的方向。', reflection: '你不需要看清整条路才迈出第一步。信任那个让你心跳加速的冲动。' },
  { name: '魔术师', symbol: '☿', meaning: '你手中已经握着所有需要的工具。你一直在寻找的资源，其实早已在你身边。', reflection: '停止等待"更好的时机"。此刻就是你施展的时刻。' },
  { name: '女祭司', symbol: '☽', meaning: '答案不在外面，在里面。你已经知道了，只是还没有承认。那些深夜浮现的直觉，不是幻觉。', reflection: '安静下来。你内心的低语比外界的喧嚣更真实。' },
  { name: '女皇', symbol: '♀', meaning: '丰盛正在靠近。不是你争取来的，而是你允许它到来。你值得拥有好的事物。', reflection: '放下"我不配"的念头。接受本身就是一种力量。' },
  { name: '皇帝', symbol: '♂', meaning: '是时候为自己的生活建立结构了。混乱中隐藏着秩序，你只需要一个决定。', reflection: '不要害怕做那个说"就这样"的人。边界是爱的另一种形式。' },
  { name: '恋人', symbol: '♡', meaning: '一个选择摆在你面前。不是好与坏的选择，而是两种都想要的东西之间的取舍。', reflection: '听从那个让你感到"对"的方向，即使它更难。' },
  { name: '战车', symbol: '⚔', meaning: '前进的力量在你体内积聚。障碍不是阻碍，是磨砺。你比你以为的更强大。', reflection: '不要停下来解释自己。用行动回答质疑。' },
  { name: '力量', symbol: '🦁', meaning: '真正的力量不是征服，是温柔地坚持。你正在学习的，是如何与自己的野性共处。', reflection: '对自己温柔一些。压制不是力量，接纳才是。' },
  { name: '隐士', symbol: '🏔', meaning: '是时候独处了。不是逃避，而是充电。你需要在安静中找到那个被噪音淹没的答案。', reflection: '暂时退出不是放弃。灯塔也需要黑暗才能发光。' },
  { name: '命运之轮', symbol: '☸', meaning: '变化正在转动。有些事情即将改变——不是因为你做了什么，而是因为周期本身就是如此。', reflection: '抓住上升的势头，但不要害怕低谷。轮子一直在转。' },
  { name: '正义', symbol: '⚖', meaning: '真相即将浮出水面。你种下的因，正在结出果。如果你一直在走正路，不必担心。', reflection: '对自己诚实。你已经知道什么是对的。' },
  { name: '倒吊人', symbol: '⚑', meaning: '换个角度看，答案就在那里。你一直在挣扎的事情，也许需要的不是更多努力，而是放手。', reflection: '暂停不是失败。有时候，不行动就是最深的行动。' },
  { name: '死神', symbol: '♰', meaning: '一个章节正在结束。不是毁灭，是转化。枯叶落下，是为了让新芽有空间生长。', reflection: '不要紧抓已经完成使命的东西。告别是另一种开始。' },
  { name: '节制', symbol: '♒', meaning: '平衡正在恢复。你最近走得太远了——无论哪个方向。回来，找到中间那条路。', reflection: '不是所有事情都需要全力以赴。有时候，刚刚好就是最好。' },
  { name: '恶魔', symbol: '⛓', meaning: '你被什么东西束缚着——一个习惯、一段关系、一个信念。关键是：锁链其实没有锁上。', reflection: '你随时可以离开。你只是还没有允许自己相信这一点。' },
  { name: '塔', symbol: '⚡', meaning: '有些东西必须倒塌，才能重建得更坚固。不要害怕震动——它在清除不再适合你的结构。', reflection: '在废墟中，你会找到被掩盖的地基。那是真正属于你的。' },
  { name: '星星', symbol: '★', meaning: '希望正在回归。经历了风暴之后，你终于可以仰望天空。星星一直在那里，只是云层太厚。', reflection: '相信那些你还看不见的东西。它们比你以为的更近。' },
  { name: '月亮', symbol: '☽', meaning: '有些事情不是表面看起来的那样。你的恐惧可能在误导你，但你的梦境在告诉你真相。', reflection: '不要在迷雾中做决定。等月亮照亮那条隐藏的路。' },
  { name: '太阳', symbol: '☉', meaning: '光明正在到来。不是那种刺眼的光，而是温暖的、让你想要微笑的光。你值得这份快乐。', reflection: '接受好消息。不是所有事情都有陷阱。有时候，好就是好。' },
  { name: '审判', symbol: '✧', meaning: '一个旧的召唤正在重新响起。你曾经放下的某件事，正在以新的形式回来。这次，你会回应吗？', reflection: '听从那个让你感到使命感的声音。它比恐惧更古老。' },
  { name: '世界', symbol: '⊕', meaning: '一个循环即将完成。你走了很远，经历了很多。现在，站在这个节点上，你可以看到完整的图景。', reflection: '庆祝你走过的路。然后，准备好迎接下一圈的开始。' }
];

const DAILY = [
  '今天的风向变了。不要逆风而行，调整你的帆。有些阻力不是敌人，是方向的指引。',
  '你今天会遇到一个巧合。不要忽略它。巧合是宇宙在不被注意时说的悄悄话。',
  '今天适合沉默。不是因为没有话说，而是因为有些答案只在安静中才会浮现。',
  '你今天种下的种子，会在你看不见的地方发芽。不要急着检查它长了多少。',
  '今天有人在想你。不是猜测——是那些你偶尔想起的人，也偶尔想起你。',
  '今天的月亮在告诉你：该收尾了。那件拖了很久的事，今天画上句号吧。',
  '你今天会收到一个信号。可能是一句话，一个画面，一种感觉。听从它。',
  '今天适合回头看。不是为了停留，而是为了确认——你已经走了多远。',
  '今天的火焰比昨天更亮。你内心的某种东西正在苏醒。不要压制它。',
  '今天会有一次测试。不是惩罚，是确认——你已经准备好了。',
  '你今天需要的不是答案，而是更好的问题。花时间问对的问题。',
  '今天的星尘落在你身上。那些微小的好运，正在你不注意的时候聚集。',
  '今天适合做那个一直拖着的决定。犹豫消耗的能量，比错误的决定更多。',
  '你今天会感受到一种古老的召唤。不要害怕。那是你灵魂深处的声音在醒来。',
  '今天的水是清澈的。如果你在寻找什么，现在是看清楚的最好时机。'
];

// ========== 应用 ==========
let currentPage = 'home';
let records = JSON.parse(localStorage.getItem('mystic_records') || '[]');
let dailyUsed = localStorage.getItem('mystic_daily_used') || '';

function init() {
  particles.init();
  bindAgeGate();
  bindSplash();
  bindNav();
  bindTarot();
  bindDaily();
  bindSettings();
  bindAudio();
  renderRecords();
  renderTarotCards();
}

// 年龄确认
function bindAgeGate() {
  const gate = document.getElementById('age-gate');
  if (localStorage.getItem('mystic_age_verified')) { gate.remove(); return; }
  document.getElementById('age-yes').onclick = () => {
    localStorage.setItem('mystic_age_verified', 'true');
    gate.style.opacity = '0';
    setTimeout(() => gate.remove(), 500);
  };
  document.getElementById('age-no').onclick = () => {
    gate.querySelector('.age-title').textContent = '星辰为你保留了最多的可能性。等你准备好了，再来。';
    gate.querySelector('.age-sub').textContent = '';
    gate.querySelector('.age-gate-buttons').innerHTML = '<button class="btn-ritual" onclick="document.getElementById(\'age-gate\').remove()"><span>好的</span></button>';
  };
}

// 启动画面
function bindSplash() {
  document.getElementById('enter-btn').onclick = () => {
    audio.click();
    document.getElementById('door-left').classList.add('open');
    document.getElementById('door-right').classList.add('open');
    setTimeout(() => {
      document.getElementById('splash').style.opacity = '0';
      document.getElementById('app').classList.remove('hidden');
      audio.success();
    }, 800);
    setTimeout(() => document.getElementById('splash').remove(), 1600);
  };
}

// 导航
function bindNav() {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });
}

function navigateTo(page) {
  if (page === currentPage) return;
  audio.click();
  const smoke = document.getElementById('smoke-transition');
  smoke.classList.add('active');
  setTimeout(() => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (link) link.classList.add('active');
    currentPage = page;
    smoke.classList.add('out');
    setTimeout(() => smoke.classList.remove('active', 'out'), 600);
  }, 400);
}

// 塔罗
function renderTarotCards() {
  const spread = document.getElementById('tarot-spread');
  spread.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const card = document.createElement('div');
    card.className = 'tarot-card';
    card.dataset.index = i;
    card.innerHTML = '<div class="card-back">✦</div><div class="card-front"></div>';
    card.onclick = () => selectCard(card);
    spread.appendChild(card);
  }
}

function bindTarot() {
  document.getElementById('tarot-begin').onclick = () => {
    audio.click();
    document.getElementById('tarot-intro').classList.add('hidden');
    document.getElementById('tarot-preparing').classList.remove('hidden');
    ['candle-1', 'candle-2', 'candle-3'].forEach((id, i) => {
      setTimeout(() => { document.getElementById(id).classList.add('lit'); audio.click(); }, (i + 1) * 800);
    });
    setTimeout(() => {
      document.getElementById('tarot-preparing').classList.add('hidden');
      document.getElementById('tarot-choosing').classList.remove('hidden');
    }, 3000);
  };
  document.getElementById('tarot-again').onclick = () => {
    audio.click();
    resetTarot();
  };
}

function selectCard(el) {
  if (el.classList.contains('flipped')) return;
  audio.cardFlip();
  el.classList.add('flipped', 'selected');
  spawnDust(el);
  const card = TAROT[Math.floor(Math.random() * TAROT.length)];
  el.querySelector('.card-front').innerHTML = `<span style="font-size:1.1rem">${card.symbol}</span><span>${card.name}</span>`;
  setTimeout(() => showResult(card), 1200);
}

function spawnDust(el) {
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 12; i++) {
    const d = document.createElement('div');
    d.className = 'gold-dust';
    d.style.left = (r.left + r.width / 2) + 'px';
    d.style.top = (r.top + r.height / 2) + 'px';
    d.style.setProperty('--dx', (Math.random() - 0.5) * 80 + 'px');
    d.style.setProperty('--dy', (Math.random() - 0.5) * 80 + 'px');
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1500);
  }
}

function showResult(card) {
  document.getElementById('tarot-choosing').classList.add('hidden');
  document.getElementById('tarot-result').classList.remove('hidden');
  document.getElementById('result-card-name').textContent = card.name;
  document.getElementById('result-card-symbol').textContent = card.symbol;
  inkReveal('result-text', card.meaning);
  setTimeout(() => inkReveal('result-reflection', card.reflection), card.meaning.length * 35 + 400);
  audio.success();
  saveRecord({ type: '塔罗', title: card.name, symbol: card.symbol, text: card.meaning, reflection: card.reflection });
}

function resetTarot() {
  document.getElementById('tarot-result').classList.add('hidden');
  document.getElementById('tarot-intro').classList.remove('hidden');
  document.querySelectorAll('.tarot-card').forEach(c => c.classList.remove('flipped', 'selected'));
  document.querySelectorAll('.cd-candle').forEach(c => c.classList.remove('lit'));
  renderTarotCards();
}

function inkReveal(id, text) {
  const el = document.getElementById(id);
  el.innerHTML = '';
  let i = 0;
  const timer = setInterval(() => {
    if (i >= text.length) { clearInterval(timer); return; }
    const span = document.createElement('span');
    span.className = 'ink-char';
    span.textContent = text[i];
    el.appendChild(span);
    i++;
  }, 30);
}

// 每日启示
function bindDaily() {
  document.getElementById('daily-reveal').onclick = () => {
    audio.click();
    const today = new Date().toDateString();
    if (dailyUsed === today) {
      document.getElementById('daily-result').classList.remove('hidden');
      document.getElementById('daily-reveal').textContent = '今日已窥见';
      document.getElementById('daily-reveal').disabled = true;
      return;
    }
    const msg = DAILY[Math.floor(Math.random() * DAILY.length)];
    document.getElementById('daily-result').classList.remove('hidden');
    inkReveal('daily-message', msg);
    dailyUsed = today;
    localStorage.setItem('mystic_daily_used', today);
    document.getElementById('daily-reveal').textContent = '今日已窥见';
    document.getElementById('daily-reveal').disabled = true;
    document.getElementById('daily-reveal').style.opacity = '0.5';
    audio.success();
    saveRecord({ type: '每日启示', title: '今日启示', symbol: '🕯', text: msg });
  };
}

// 记录
function saveRecord(r) {
  r.id = Date.now();
  r.date = new Date().toLocaleDateString('zh-CN');
  records.unshift(r);
  localStorage.setItem('mystic_records', JSON.stringify(records));
  renderRecords();
}

function deleteRecord(id) {
  records = records.filter(r => r.id !== id);
  localStorage.setItem('mystic_records', JSON.stringify(records));
  renderRecords();
}

function renderRecords() {
  const list = document.getElementById('records-list');
  const empty = document.getElementById('records-empty');
  if (records.length === 0) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  list.innerHTML = records.map(r => `
    <div class="record-item">
      <div class="record-header"><span class="record-type">${r.type}</span><span class="record-date">${r.date}</span></div>
      <div class="record-title">${r.symbol} ${r.title}</div>
      <div class="record-preview">${r.text}</div>
      <button class="record-delete" data-id="${r.id}">抹去这段痕迹</button>
    </div>
  `).join('');
  list.querySelectorAll('.record-delete').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      if (confirm('你确定要抹去这段痕迹吗？\n有些东西一旦消失，就再也找不回来了。')) {
        deleteRecord(parseInt(btn.dataset.id));
        audio.click();
      }
    };
  });
}

// 设置
function bindSettings() {
  const panel = document.getElementById('settings-panel');
  document.getElementById('settings-btn').onclick = () => { audio.click(); panel.classList.remove('hidden'); requestAnimationFrame(() => panel.classList.add('visible')); };
  const close = () => { panel.classList.remove('visible'); setTimeout(() => panel.classList.add('hidden'), 500); };
  document.getElementById('settings-close').onclick = close;
  document.getElementById('settings-overlay').onclick = close;
  document.getElementById('clear-data').onclick = () => {
    if (confirm('确定要清除所有个人数据吗？')) {
      localStorage.clear(); records = []; dailyUsed = ''; renderRecords(); audio.click(); alert('已清除。');
    }
  };
  document.getElementById('particles-toggle').onchange = e => { particles.enabled = e.target.checked; };
}

// 音频
function bindAudio() {
  document.getElementById('audio-toggle').onclick = () => {
    const on = audio.toggle();
    document.getElementById('audio-toggle').textContent = on ? '🔊' : '🔇';
  };
}

// 启动
document.addEventListener('DOMContentLoaded', init);