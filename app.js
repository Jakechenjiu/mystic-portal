/**
 * 从心而书 · 神秘学殿堂
 * 核心交互逻辑
 */

// ============================================
// 粒子系统
// ============================================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.enabled = true;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // 火星粒子（缓慢上升）
  addEmber(x, y) {
    this.particles.push({
      type: 'ember',
      x: x || Math.random() * this.canvas.width,
      y: y || this.canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.8 - 0.2,
      size: Math.random() * 2 + 1,
      life: 1,
      decay: Math.random() * 0.003 + 0.001,
      color: Math.random() > 0.5 ? '#e8a33c' : '#b8962e'
    });
  }

  // 金色尘埃
  addDust() {
    this.particles.push({
      type: 'dust',
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.1,
      vy: Math.random() * 0.05,
      size: Math.random() * 1.5 + 0.5,
      life: 1,
      decay: Math.random() * 0.002 + 0.0005,
      color: '#c0c0d0',
      twinkle: Math.random() * Math.PI * 2
    });
  }

  // 符文碎片（极快闪现）
  addRuneFragment() {
    const symbols = ['✦', '☽', '☿', '♃', '♄', '☉', '⚶', '△', '◇'];
    this.particles.push({
      type: 'rune',
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      size: Math.random() * 10 + 8,
      life: 1,
      decay: 0.03, // 0.3秒即逝
      color: '#b8962e'
    });
  }

  update() {
    if (!this.enabled) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 随机生成粒子
    if (Math.random() < 0.03) this.addEmber();
    if (Math.random() < 0.05) this.addDust();
    if (Math.random() < 0.002) this.addRuneFragment();

    this.particles = this.particles.filter(p => {
      p.life -= p.decay;
      if (p.life <= 0) return false;

      if (p.type === 'ember') {
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.2;
        p.y += p.vy;
        this.ctx.globalAlpha = p.life * 0.8;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        // 光晕
        this.ctx.globalAlpha = p.life * 0.2;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        this.ctx.fill();
      }

      if (p.type === 'dust') {
        p.x += p.vx;
        p.y += p.vy;
        p.twinkle += 0.02;
        const twinkle = (Math.sin(p.twinkle) + 1) / 2;
        this.ctx.globalAlpha = p.life * twinkle * 0.5;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      if (p.type === 'rune') {
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.font = `${p.size}px serif`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(p.symbol, p.x, p.y);
      }

      this.ctx.globalAlpha = 1;
      return true;
    });

    requestAnimationFrame(() => this.update());
  }

  start() {
    this.update();
  }
}

// ============================================
// 音效系统
// ============================================
class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.initialized = false;
    this.ambientNode = null;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.initialized = true;
  }

  toggle() {
    if (!this.initialized) this.init();
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playAmbient();
    } else {
      this.stopAmbient();
    }
    return this.enabled;
  }

  // 玉石轻叩
  playClick() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // 水晶碗泛音
  playSuccess() {
    if (!this.enabled || !this.ctx) return;
    [523, 659, 784].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 1.5);
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 1.5);
    });
  }

  // 低沉鼓声
  playError() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 80;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  // 钟声余韵
  playBell() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 220;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3);
    osc.start();
    osc.stop(this.ctx.currentTime + 3);
  }

  // 翻牌声
  playCardFlip() {
    if (!this.enabled || !this.ctx) return;
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    }
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    gain.gain.value = 0.05;
    noise.start();
  }

  // 环境音
  playAmbient() {
    if (!this.ctx) return;
    // 低频嗡鸣
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 60;
    osc.type = 'sine';
    gain.gain.value = 0.015;
    osc.start();
    this.ambientNode = { osc, gain };

    // 定时钟声
    this.bellInterval = setInterval(() => this.playBell(), 30000);
  }

  stopAmbient() {
    if (this.ambientNode) {
      this.ambientNode.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
      setTimeout(() => {
        try { this.ambientNode.osc.stop(); } catch(e) {}
        this.ambientNode = null;
      }, 1000);
    }
    if (this.bellInterval) {
      clearInterval(this.bellInterval);
      this.bellInterval = null;
    }
  }
}

// ============================================
// 塔罗牌数据
// ============================================
const TAROT_CARDS = [
  { name: '愚者', symbol: '✦', meaning: '新的开始正在展开。你站在悬崖边，但风会托住你。此刻的力量正在把你推向未知——那是你一直回避的方向。', reflection: '你不需要看清整条路才迈出第一步。信任那个让你心跳加速的冲动。' },
  { name: '魔术师', symbol: '☿', meaning: '你手中已经握着所有需要的工具。你一直在寻找的资源，其实早已在你身边。', reflection: '停止等待"更好的时机"。此刻就是你施展的时刻。' },
  { name: '女祭司', symbol: '☽', meaning: '答案不在外面，在里面。你已经知道了，只是还没有承认。那些深夜浮现的直觉，不是幻觉。', reflection: '安静下来。你内心的低语比外界的喧嚣更真实。' },
  { name: '女皇', symbol: '♀', meaning: '丰盛正在靠近。不是你争取来的，而是你允许它到来。你值得拥有好的事物。', reflection: '放下"我不配"的念头。接受本身就是一种力量。' },
  { name: '皇帝', symbol: '♂', meaning: '是时候为自己的生活建立结构了。混乱中隐藏着秩序，你只需要一个决定。', reflection: '不要害怕做那个说"就这样"的人。边界是爱的另一种形式。' },
  { name: '教皇', symbol: '✝', meaning: '有些古老的智慧正在召唤你。也许是一本书，一个人，或一段你遗忘的记忆。', reflection: '不是所有答案都需要自己想出来。向那些走过这条路的人请教。' },
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

// ============================================
// 每日启示数据
// ============================================
const DAILY_MESSAGES = [
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

// ============================================
// 应用核心
// ============================================
class MysticApp {
  constructor() {
    this.currentPage = 'home';
    this.audio = new AudioSystem();
    this.particles = new ParticleSystem(document.getElementById('particles-canvas'));
    this.records = this.loadRecords();
    this.dailyUsed = this.loadDailyUsed();
    this.selectedCard = null;

    this.init();
  }

  init() {
    // 启动粒子
    this.particles.start();

    // 绑定事件
    this.bindSplash();
    this.bindNavigation();
    this.bindTarot();
    this.bindDaily();
    this.bindSettings();
    this.bindAudio();

    // 渲染记录
    this.renderRecords();

    // 检查年龄门控
    this.checkAgeGate();
  }

  // ---------- 年龄门控 ----------
  checkAgeGate() {
    if (localStorage.getItem('mystic_age_verified')) return;

    const gate = document.createElement('div');
    gate.className = 'age-gate';
    gate.innerHTML = `
      <div class="age-gate-content">
        <p>你已年满18岁吗？</p>
        <p style="font-size:0.8rem;color:var(--text-dim);line-height:1.8;">
          你还年轻，星辰为你保留了最多的可能性。<br>
          这些解读可以参考，但不要让它替你做决定。
        </p>
        <div class="age-gate-buttons">
          <button class="btn-ritual" id="age-yes"><span class="btn-text">我已成年</span></button>
          <button class="btn-ritual btn-secondary" id="age-no"><span class="btn-text">我还未成年</span></button>
        </div>
      </div>
    `;
    document.body.appendChild(gate);

    document.getElementById('age-yes').onclick = () => {
      localStorage.setItem('mystic_age_verified', 'true');
      gate.style.opacity = '0';
      gate.style.transition = 'opacity 0.5s';
      setTimeout(() => gate.remove(), 500);
    };

    document.getElementById('age-no').onclick = () => {
      gate.querySelector('.age-gate-content p').textContent =
        '星辰为你保留了最多的可能性。等你准备好了，再来。';
      gate.querySelector('.age-gate-buttons').innerHTML =
        '<button class="btn-ritual" onclick="this.closest(\'.age-gate\').remove()"><span class="btn-text">好的</span></button>';
    };
  }

  // ---------- 启动画面 ----------
  bindSplash() {
    const enterBtn = document.getElementById('enter-btn');
    const splash = document.getElementById('splash');
    const app = document.getElementById('app');

    enterBtn.addEventListener('click', () => {
      this.audio.playClick();

      // 开门
      document.querySelector('.door-left').classList.add('open');
      document.querySelector('.door-right').classList.add('open');

      // 淡出启动画面
      setTimeout(() => {
        splash.classList.add('fade-out');
        app.classList.remove('hidden');
        this.audio.playSuccess();
      }, 800);

      // 完全移除
      setTimeout(() => {
        splash.style.display = 'none';
      }, 2000);
    });
  }

  // ---------- 导航 ----------
  bindNavigation() {
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.navigateTo(page);
      });
    });
  }

  navigateTo(page) {
    if (page === this.currentPage) return;
    this.audio.playClick();

    // 烟雾过渡
    const smoke = document.getElementById('smoke-transition');
    smoke.classList.add('active');

    setTimeout(() => {
      // 切换页面
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const target = document.getElementById(`page-${page}`);
      if (target) target.classList.add('active');

      // 更新导航
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
      if (activeLink) activeLink.classList.add('active');

      this.currentPage = page;

      // 烟雾消散
      smoke.classList.add('out');
      setTimeout(() => {
        smoke.classList.remove('active', 'out');
      }, 800);
    }, 400);
  }

  // ---------- 塔罗占卜 ----------
  bindTarot() {
    const beginBtn = document.getElementById('tarot-begin');
    const againBtn = document.getElementById('tarot-again');

    beginBtn.addEventListener('click', () => {
      this.audio.playClick();
      this.startTarotPreparing();
    });

    againBtn.addEventListener('click', () => {
      this.audio.playClick();
      this.resetTarot();
    });

    // 绑定选牌
    document.querySelectorAll('.tarot-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('flipped')) return;
        this.selectTarotCard(card);
      });
    });
  }

  startTarotPreparing() {
    document.getElementById('tarot-intro').classList.add('hidden');
    document.getElementById('tarot-preparing').classList.remove('hidden');

    // 蜡烛依次亮起
    const candles = ['candle-1', 'candle-2', 'candle-3'];
    candles.forEach((id, i) => {
      setTimeout(() => {
        document.getElementById(id).classList.add('lit');
        this.audio.playClick();
      }, (i + 1) * 1000);
    });

    // 进入选牌
    setTimeout(() => {
      document.getElementById('tarot-preparing').classList.add('hidden');
      document.getElementById('tarot-choosing').classList.remove('hidden');
    }, 4000);
  }

  selectTarotCard(cardEl) {
    this.audio.playCardFlip();

    // 翻牌
    cardEl.classList.add('flipped', 'selected');

    // 金粉效果
    this.spawnGoldDust(cardEl);

    // 随机选牌
    const cardData = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    this.selectedCard = cardData;

    // 填充牌面
    const front = cardEl.querySelector('.card-front');
    front.innerHTML = `<span style="font-size:1.2rem">${cardData.symbol}</span><span>${cardData.name}</span>`;

    // 延迟显示结果
    setTimeout(() => {
      this.showTarotResult(cardData);
    }, 1500);
  }

  spawnGoldDust(el) {
    const rect = el.getBoundingClientRect();
    for (let i = 0; i < 15; i++) {
      const dust = document.createElement('div');
      dust.className = 'gold-dust';
      dust.style.left = (rect.left + rect.width / 2) + 'px';
      dust.style.top = (rect.top + rect.height / 2) + 'px';
      dust.style.setProperty('--dx', (Math.random() - 0.5) * 100 + 'px');
      dust.style.setProperty('--dy', (Math.random() - 0.5) * 100 + 'px');
      document.body.appendChild(dust);
      setTimeout(() => dust.remove(), 2000);
    }
  }

  showTarotResult(card) {
    document.getElementById('tarot-choosing').classList.add('hidden');
    document.getElementById('tarot-result').classList.remove('hidden');

    document.getElementById('result-card-name').textContent = card.name;
    document.getElementById('result-card-symbol').textContent = card.symbol;

    // 墨水渗透效果
    this.inkRevealText('result-text', card.meaning);
    setTimeout(() => {
      this.inkRevealText('result-reflection', card.reflection);
    }, card.meaning.length * 40 + 500);

    this.audio.playSuccess();

    // 保存记录
    this.saveRecord({
      type: '塔罗',
      title: card.name,
      symbol: card.symbol,
      text: card.meaning,
      reflection: card.reflection
    });
  }

  resetTarot() {
    document.getElementById('tarot-result').classList.add('hidden');
    document.getElementById('tarot-intro').classList.remove('hidden');

    // 重置所有牌
    document.querySelectorAll('.tarot-card').forEach(card => {
      card.classList.remove('flipped', 'selected');
    });

    // 重置蜡烛
    document.querySelectorAll('.countdown-candle').forEach(c => {
      c.classList.remove('lit');
    });

    this.selectedCard = null;
  }

  // ---------- 墨水渗透效果 ----------
  inkRevealText(elementId, text) {
    const el = document.getElementById(elementId);
    el.innerHTML = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i >= text.length) {
        clearInterval(interval);
        return;
      }
      const span = document.createElement('span');
      span.className = 'ink-char';
      span.textContent = text[i];
      span.style.animationDelay = '0s';
      el.appendChild(span);
      i++;
    }, 35);
  }

  // ---------- 每日启示 ----------
  bindDaily() {
    const revealBtn = document.getElementById('daily-reveal');
    revealBtn.addEventListener('click', () => {
      this.audio.playClick();
      this.showDailyRevelation();
    });
  }

  showDailyRevelation() {
    const today = new Date().toDateString();

    if (this.dailyUsed === today) {
      document.getElementById('daily-result').classList.remove('hidden');
      document.getElementById('daily-reveal').textContent = '今日已窥见';
      document.getElementById('daily-reveal').disabled = true;
      return;
    }

    const message = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];

    document.getElementById('daily-result').classList.remove('hidden');
    this.inkRevealText('daily-message', message);

    this.dailyUsed = today;
    localStorage.setItem('mystic_daily_used', today);

    document.getElementById('daily-reveal').textContent = '今日已窥见';
    document.getElementById('daily-reveal').disabled = true;
    document.getElementById('daily-reveal').style.opacity = '0.5';

    this.audio.playSuccess();

    this.saveRecord({
      type: '每日启示',
      title: '今日启示',
      symbol: '🕯',
      text: message
    });
  }

  loadDailyUsed() {
    return localStorage.getItem('mystic_daily_used') || '';
  }

  // ---------- 记录系统 ----------
  loadRecords() {
    try {
      return JSON.parse(localStorage.getItem('mystic_records') || '[]');
    } catch {
      return [];
    }
  }

  saveRecord(record) {
    record.id = Date.now();
    record.date = new Date().toLocaleDateString('zh-CN');
    this.records.unshift(record);
    localStorage.setItem('mystic_records', JSON.stringify(this.records));
    this.renderRecords();
  }

  deleteRecord(id) {
    this.records = this.records.filter(r => r.id !== id);
    localStorage.setItem('mystic_records', JSON.stringify(this.records));
    this.renderRecords();
  }

  renderRecords() {
    const list = document.getElementById('records-list');
    const empty = document.getElementById('records-empty');

    if (this.records.length === 0) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    list.innerHTML = this.records.map(r => `
      <div class="record-item" data-id="${r.id}">
        <div class="record-header">
          <span class="record-type">${r.type}</span>
          <span class="record-date">${r.date}</span>
        </div>
        <div class="record-title">${r.symbol} ${r.title}</div>
        <div class="record-preview">${r.text}</div>
        <button class="record-delete" data-id="${r.id}">抹去这段痕迹</button>
      </div>
    `).join('');

    // 绑定删除
    list.querySelectorAll('.record-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        if (confirm('你确定要抹去这段痕迹吗？\n有些东西一旦消失，就再也找不回来了。')) {
          this.deleteRecord(id);
          this.audio.playClick();
        }
      });
    });
  }

  // ---------- 设置 ----------
  bindSettings() {
    const panel = document.getElementById('settings-panel');
    const openBtn = document.getElementById('settings-btn');
    const closeBtn = document.getElementById('settings-close');
    const overlay = panel.querySelector('.settings-overlay');

    openBtn.addEventListener('click', () => {
      this.audio.playClick();
      panel.classList.remove('hidden');
      requestAnimationFrame(() => panel.classList.add('visible'));
    });

    const close = () => {
      panel.classList.remove('visible');
      setTimeout(() => panel.classList.add('hidden'), 500);
    };

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    // 清除数据
    document.getElementById('clear-data').addEventListener('click', () => {
      if (confirm('确定要清除所有个人数据吗？此操作不可撤销。')) {
        localStorage.removeItem('mystic_records');
        localStorage.removeItem('mystic_daily_used');
        localStorage.removeItem('mystic_age_verified');
        this.records = [];
        this.renderRecords();
        this.audio.playClick();
        alert('所有数据已清除。');
      }
    });

    // 粒子开关
    document.getElementById('particles-toggle').addEventListener('change', (e) => {
      this.particles.enabled = e.target.checked;
    });
  }

  // ---------- 音频按钮 ----------
  bindAudio() {
    const btn = document.getElementById('audio-toggle');
    const icon = btn.querySelector('.audio-icon');

    btn.addEventListener('click', () => {
      const enabled = this.audio.toggle();
      icon.textContent = enabled ? '🔊' : '🔇';
    });
  }
}

// ============================================
// 启动
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  new MysticApp();
});