<template>
  <div class="tech-showcase">
    <div class="tech-showcase-title">
      <span class="tech-title-text">Frontier Technologies</span>
      <span class="tech-title-line" />
    </div>
    <div class="tech-grid">
      <div class="tech-card" v-for="(tech, i) in techs" :key="i">
        <canvas :ref="el => { if (el) canvasRefs[i] = el }" class="tech-canvas" />
        <div class="tech-info">
          <span class="tech-name">{{ tech.name }}</span>
          <span class="tech-desc">{{ tech.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRefs = ref([])
let animationIds = []

const techs = [
  { name: 'Large Language Model', desc: 'Token Generation & Attention' },
  { name: 'Diffusion Model', desc: 'Noise → Structure' },
  { name: 'Computer Vision', desc: 'Detection & Recognition' },
  { name: 'Reinforcement Learning', desc: 'Agent Policy Optimization' },
  { name: 'GAN', desc: 'Generator vs Discriminator' },
  { name: 'LLM Reasoning', desc: 'Chain-of-Thought Planning' },
  { name: 'Multimodal AI', desc: 'Vision-Language Alignment' },
  { name: 'Embodied AI', desc: 'Perception-Action Loop' },
  { name: 'Neuro-Symbolic', desc: 'Neural + Logic Reasoning' },
  { name: 'LSTM', desc: 'Long Short-Term Memory' },
]

onMounted(() => {
  const dpr = window.devicePixelRatio || 1
  const W = 280, H = 200

  function initCanvas(cvs) {
    cvs.width = W * dpr
    cvs.height = H * dpr
    cvs.style.width = W + 'px'
    cvs.style.height = H + 'px'
    const ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return ctx
  }

  // ====== 1. LLM - Token 生成 + Attention ======
  function startLLM(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0
    const tokens = [], cols = 7, tokenW = 18, tokenH = 12, gap = 4

    function frame() {
      time++
      ctx.clearRect(0, 0, W, H)
      if (time % 15 === 0 && tokens.length < 36) {
        tokens.push({ birth: time, col: tokens.length % cols, row: Math.floor(tokens.length / cols), hue: Math.random() > 0.5 ? 185 : 270, b: 0.3 + Math.random() * 0.5 })
      }
      if (tokens.length >= 36) { tokens.splice(0, cols); tokens.forEach((t, i) => { t.col = i % cols; t.row = Math.floor(i / cols) }) }
      const sx = 30, sy = 45
      for (let i = Math.max(0, tokens.length - 8); i < tokens.length; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          const t1 = tokens[i], t2 = tokens[j]
          ctx.beginPath()
          ctx.moveTo(sx + t1.col * (tokenW + gap) + tokenW / 2, sy + t1.row * (tokenH + gap) + tokenH / 2)
          ctx.lineTo(sx + t2.col * (tokenW + gap) + tokenW / 2, sy + t2.row * (tokenH + gap) + tokenH / 2)
          ctx.strokeStyle = `rgba(0,229,255,${0.03 + Math.sin(time * 0.05 + i + j) * 0.02})`
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      }
      tokens.forEach((t, i) => {
        const x = sx + t.col * (tokenW + gap), y = sy + t.row * (tokenH + gap)
        const fade = Math.min((time - t.birth) / 10, 1), p = 0.5 + Math.sin(time * 0.06 + i * 0.5) * 0.2
        const g = ctx.createRadialGradient(x + tokenW / 2, y + tokenH / 2, 0, x + tokenW / 2, y + tokenH / 2, tokenW)
        g.addColorStop(0, `hsla(${t.hue},100%,70%,${0.15 * fade * p})`); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.fillRect(x - tokenW / 2, y - tokenH / 2, tokenW * 2, tokenH * 2)
        ctx.fillStyle = `hsla(${t.hue},80%,60%,${fade * t.b * p})`; ctx.fillRect(x, y, tokenW, tokenH)
        if (i === tokens.length - 1) { ctx.strokeStyle = `rgba(0,229,255,${0.4 + Math.sin(time * 0.15) * 0.3})`; ctx.lineWidth = 1.5; ctx.strokeRect(x - 1, y - 1, tokenW + 2, tokenH + 2) }
      })
      if (Math.sin(time * 0.1) > 0) { const cx = sx + (tokens.length % cols) * (tokenW + gap), cy = sy + Math.floor(tokens.length / cols) * (tokenH + gap); ctx.fillStyle = 'rgba(0,229,255,0.8)'; ctx.fillRect(cx, cy, 2, tokenH) }
      animationIds[0] = requestAnimationFrame(frame)
    }
    frame()
  }

  // ====== 2. Diffusion - 噪声→结构 ======
  function startDiffusion(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0
    const gs = 6, cells = []
    for (let y = 0; y < H; y += gs) for (let x = 0; x < W; x += gs) {
      const d = Math.sqrt((x - W / 2) ** 2 + (y - H / 2) ** 2), a = Math.atan2(y - H / 2, x - W / 2)
      const isT = Math.abs(Math.sin(d / 20)) > 0.7 || Math.cos(a * 3) * 30 + 50 > d
      cells.push({ x, y, noise: Math.random(), target: isT ? 0.6 + Math.random() * 0.4 : 0, hue: isT ? (d < 40 ? 270 : 185) : 200 })
    }
    function frame() {
      time++; ctx.clearRect(0, 0, W, H)
      const c = (time % 300) / 300, cl = c < 0.5 ? c * 2 : (1 - c) * 2
      cells.forEach(c => { const a = (c.target * cl + c.noise * (1 - cl) * 0.5) * 0.8; if (a > 0.05) { ctx.fillStyle = `hsla(${c.hue + Math.sin(time * 0.02) * 10},80%,60%,${a})`; ctx.fillRect(c.x, c.y, gs - 1, gs - 1) } })
      ctx.fillStyle = 'rgba(0,229,255,0.15)'; ctx.fillRect(20, H - 12, W - 40, 3)
      const gr = ctx.createLinearGradient(20, 0, 20 + (W - 40) * cl, 0); gr.addColorStop(0, 'rgba(0,229,255,0.6)'); gr.addColorStop(1, 'rgba(124,77,255,0.6)'); ctx.fillStyle = gr; ctx.fillRect(20, H - 12, (W - 40) * cl, 3)
      ctx.fillStyle = 'rgba(0,229,255,0.5)'; ctx.font = '9px monospace'; ctx.fillText(`t=${Math.floor(cl * 1000)}`, W - 48, H - 15)
      animationIds[1] = requestAnimationFrame(frame)
    }
    frame()
  }

  // ====== 3. Computer Vision - 扫描检测 ======
  function startCV(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0, scanY = 0
    const objs = Array.from({ length: 5 }, (_, i) => ({ x: 30 + Math.random() * (W - 80), y: 30 + Math.random() * (H - 80), w: 20 + Math.random() * 40, h: 20 + Math.random() * 35, detected: false, conf: (0.85 + Math.random() * 0.14).toFixed(2), hue: [185, 270, 140, 45, 320][i], drift: { x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.3 } }))
    function frame() {
      time++; ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(0,229,255,0.04)'; ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      scanY = (time * 1.2) % (H + 30) - 15
      const sg = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15); sg.addColorStop(0, 'rgba(0,229,255,0)'); sg.addColorStop(0.5, 'rgba(0,229,255,0.15)'); sg.addColorStop(1, 'rgba(0,229,255,0)'); ctx.fillStyle = sg; ctx.fillRect(0, scanY - 15, W, 30)
      objs.forEach(o => {
        o.x += o.drift.x; o.y += o.drift.y
        if (o.x < 10 || o.x + o.w > W - 10) o.drift.x *= -1
        if (o.y < 10 || o.y + o.h > H - 10) o.drift.y *= -1
        if (Math.abs(scanY - (o.y + o.h / 2)) < 20) { o.detected = true; o.dt = time }
        ctx.fillStyle = `hsla(${o.hue},60%,50%,0.25)`; ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, o.w / 2 * 0.7, o.h / 2 * 0.7, 0, 0, Math.PI * 2); ctx.fill()
        if (o.detected) {
          const f = Math.min((time - o.dt) / 8, 1), p = 0.6 + Math.sin(time * 0.08) * 0.2
          ctx.fillStyle = `hsla(${o.hue},80%,60%,${0.06 * f})`; ctx.fillRect(o.x, o.y, o.w, o.h)
          ctx.strokeStyle = `hsla(${o.hue},80%,60%,${f * p})`; ctx.lineWidth = 1.5
          ;[[o.x, o.y, 1, 1], [o.x + o.w, o.y, -1, 1], [o.x, o.y + o.h, 1, -1], [o.x + o.w, o.y + o.h, -1, -1]].forEach(([cx, cy, dx, dy]) => { ctx.beginPath(); ctx.moveTo(cx, cy + 6 * dy); ctx.lineTo(cx, cy); ctx.lineTo(cx + 6 * dx, cy); ctx.stroke() })
          if (f > 0.5) { ctx.fillStyle = `hsla(${o.hue},80%,70%,${f * 0.8})`; ctx.font = '8px monospace'; ctx.fillText(o.conf, o.x, o.y - 3) }
        }
      })
      if (scanY > H + 10) objs.forEach(o => o.detected = false)
      animationIds[2] = requestAnimationFrame(frame)
    }
    frame()
  }

  // ====== 4. Reinforcement Learning ======
  function startRL(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0
    const gW = 10, gH = 7, cs = 22, ox = (W - gW * cs) / 2, oy = (H - gH * cs) / 2
    const obs = new Set(['2,1', '2,2', '2,3', '5,2', '5,3', '5,4', '7,1', '7,5', '3,5', '8,3'])
    const goal = { x: 9, y: 6 }
    let ag = { x: 0, y: 0 }, path = [{ x: 0, y: 0 }], reward = 0, ep = 1
    const qV = {}
    for (let x = 0; x < gW; x++) for (let y = 0; y < gH; y++) qV[`${x},${y}`] = Math.max(0, 1 - (Math.abs(goal.x - x) + Math.abs(goal.y - y)) / (gW + gH))
    function move() {
      const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(([dx, dy]) => { const nx = ag.x + dx, ny = ag.y + dy; if (nx < 0 || nx >= gW || ny < 0 || ny >= gH || obs.has(`${nx},${ny}`)) return null; return { nx, ny, d: Math.abs(goal.x - nx) + Math.abs(goal.y - ny) } }).filter(Boolean).sort((a, b) => a.d - b.d)
      if (!dirs.length) { ag = { x: 0, y: 0 }; path = [{ x: 0, y: 0 }]; return }
      const c = Math.random() < 0.8 ? dirs[0] : dirs[Math.floor(Math.random() * dirs.length)]
      ag.x = c.nx; ag.y = c.ny; path.push({ x: ag.x, y: ag.y })
      if (ag.x === goal.x && ag.y === goal.y) { reward += 100; ep++; setTimeout(() => { ag = { x: 0, y: 0 }; path = [{ x: 0, y: 0 }] }, 500) }
    }
    function frame() {
      time++; ctx.clearRect(0, 0, W, H); if (time % 12 === 0) move()
      for (let x = 0; x < gW; x++) for (let y = 0; y < gH; y++) { const px = ox + x * cs, py = oy + y * cs, k = `${x},${y}`; ctx.fillStyle = obs.has(k) ? 'rgba(255,50,50,0.15)' : `rgba(0,229,255,${(qV[k] || 0) * 0.15})`; ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2); ctx.strokeStyle = 'rgba(0,229,255,0.06)'; ctx.lineWidth = 0.5; ctx.strokeRect(px, py, cs, cs) }
      if (path.length > 1) { ctx.beginPath(); ctx.moveTo(ox + path[0].x * cs + cs / 2, oy + path[0].y * cs + cs / 2); path.forEach(p => ctx.lineTo(ox + p.x * cs + cs / 2, oy + p.y * cs + cs / 2)); ctx.strokeStyle = 'rgba(0,229,255,0.3)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke() }
      const gx = ox + goal.x * cs + cs / 2, gy = oy + goal.y * cs + cs / 2; const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, cs); gg.addColorStop(0, `rgba(0,230,118,${0.4 + Math.sin(time * 0.08) * 0.2})`); gg.addColorStop(1, 'transparent'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(gx, gy, cs, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(0,230,118,0.8)'; ctx.beginPath(); ctx.arc(gx, gy, 4, 0, Math.PI * 2); ctx.fill()
      const ax = ox + ag.x * cs + cs / 2, ay = oy + ag.y * cs + cs / 2; const ag2 = ctx.createRadialGradient(ax, ay, 0, ax, ay, cs * 0.8); ag2.addColorStop(0, `rgba(124,77,255,${0.5 + Math.sin(time * 0.1) * 0.2})`); ag2.addColorStop(1, 'transparent'); ctx.fillStyle = ag2; ctx.beginPath(); ctx.arc(ax, ay, cs * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(180,130,255,0.9)'; ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(0,229,255,0.4)'; ctx.font = '8px monospace'; ctx.fillText(`Episode: ${ep}  Reward: ${reward}`, ox, oy - 4)
      animationIds[3] = requestAnimationFrame(frame)
    }
    frame()
  }

  // ====== 5. GAN - Generator vs Discriminator ======
  function startGAN(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0
    // 两组粒子：Generator（紫色）和 Real Data（青色）
    const realData = Array.from({ length: 40 }, () => {
      const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 20
      return { x: W * 0.7 + Math.cos(a) * r, y: H / 2 + Math.sin(a) * r, ox: Math.cos(a) * r, oy: Math.sin(a) * r }
    })
    const fakeData = Array.from({ length: 40 }, () => ({
      x: W * 0.25 + (Math.random() - 0.5) * 80,
      y: H / 2 + (Math.random() - 0.5) * 80,
      vx: 0, vy: 0,
    }))
    const cx_g = W * 0.25, cx_d = W * 0.7

    function frame() {
      time++; ctx.clearRect(0, 0, W, H)
      const cycle = (time % 400) / 400
      const genProgress = Math.min(cycle * 2.5, 1) // Generator 向 real 分布靠拢

      // 标签
      ctx.fillStyle = 'rgba(180,130,255,0.5)'; ctx.font = '9px monospace'; ctx.fillText('Generator', cx_g - 25, 22)
      ctx.fillStyle = 'rgba(0,229,255,0.5)'; ctx.fillText('Real Data', cx_d - 22, 22)

      // 中间判别器区域
      const dx = W / 2
      ctx.strokeStyle = `rgba(255,200,50,${0.15 + Math.sin(time * 0.05) * 0.08})`
      ctx.lineWidth = 1; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(dx, 30); ctx.lineTo(dx, H - 15); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(255,200,50,0.4)'; ctx.font = '8px monospace'; ctx.fillText('Discriminator', dx - 30, H - 5)

      // Real data 保持聚类形态，微动
      realData.forEach((d, i) => {
        d.x = cx_d + d.ox + Math.sin(time * 0.02 + i) * 3
        d.y = H / 2 + d.oy + Math.cos(time * 0.025 + i) * 3
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 8)
        g.addColorStop(0, 'rgba(0,229,255,0.5)'); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, 8, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(0,229,255,0.7)'; ctx.beginPath(); ctx.arc(d.x, d.y, 2, 0, Math.PI * 2); ctx.fill()
      })

      // Fake data 逐渐聚拢成类似 real 的分布
      fakeData.forEach((d, i) => {
        const targetR = realData[i % realData.length]
        // 从随机分布向目标缓慢移动
        const tx = cx_g + (targetR.ox) * genProgress + Math.sin(time * 0.03 + i * 0.5) * (5 * (1 - genProgress))
        const ty = H / 2 + (targetR.oy) * genProgress + Math.cos(time * 0.035 + i * 0.5) * (5 * (1 - genProgress))
        d.x += (tx - d.x) * 0.02
        d.y += (ty - d.y) * 0.02

        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 8)
        g.addColorStop(0, `rgba(180,130,255,${0.3 + genProgress * 0.3})`); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, 8, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `rgba(180,130,255,${0.5 + genProgress * 0.3})`; ctx.beginPath(); ctx.arc(d.x, d.y, 2, 0, Math.PI * 2); ctx.fill()
      })

      // 偶尔发射判别箭头
      if (time % 30 < 3) {
        const arrowX = dx + Math.sin(time * 0.2) * 5
        ctx.strokeStyle = 'rgba(255,200,50,0.5)'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(arrowX, H / 2 - 20); ctx.lineTo(arrowX, H / 2 + 20); ctx.stroke()
      }

      // Loss 曲线
      const lossY = H - 25
      ctx.strokeStyle = 'rgba(180,130,255,0.3)'; ctx.lineWidth = 1; ctx.beginPath()
      for (let i = 0; i < 100; i++) { const x = 15 + i * (W - 30) / 100, y = lossY - Math.sin(i * 0.1 + time * 0.02) * 5 * (1 - i / 100) - 3; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
      ctx.stroke()

      if (cycle > 0.95) fakeData.forEach(d => { d.x = cx_g + (Math.random() - 0.5) * 80; d.y = H / 2 + (Math.random() - 0.5) * 80 })

      animationIds[4] = requestAnimationFrame(frame)
    }
    frame()
  }

  // ====== 6. LLM Reasoning & Planning ======
  function startKG(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0

    // Chain-of-Thought 节点（左→右推理链）
    const cotSteps = [
      { x: 30,  y: H / 2, label: 'Q', hue: 185, r: 10 },
      { x: 80,  y: H / 2 - 20, label: 'T1', hue: 200, r: 8 },
      { x: 130, y: H / 2 + 15, label: 'T2', hue: 220, r: 8 },
      { x: 180, y: H / 2 - 10, label: 'T3', hue: 240, r: 8 },
      { x: 230, y: H / 2 + 5,  label: 'A', hue: 140, r: 10 },
    ]

    // 规划树（上方）：从 Plan 根节点分出分支
    const planRoot = { x: 140, y: 28 }
    const planBranches = [
      { x: 70,  y: 60, label: 'S1', chosen: false },
      { x: 140, y: 55, label: 'S2', chosen: true },
      { x: 210, y: 60, label: 'S3', chosen: false },
    ]
    const planLeaves = [
      { x: 45,  y: 88, parent: 0 },
      { x: 95,  y: 88, parent: 0 },
      { x: 120, y: 83, parent: 1 },
      { x: 160, y: 83, parent: 1 },
      { x: 195, y: 88, parent: 2 },
      { x: 235, y: 88, parent: 2 },
    ]

    // 思考气泡粒子
    let particles = []
    // 链上脉冲
    let chainPulses = []
    // 当前高亮步骤
    let activeStep = 0
    let stepTimer = 0

    function frame() {
      time++; ctx.clearRect(0, 0, W, H)

      // ---- 上半：规划树 ----
      ctx.fillStyle = 'rgba(180,130,255,0.35)'; ctx.font = 'bold 7px monospace'
      ctx.fillText('Plan', planRoot.x - 8, planRoot.y - 4)

      // 根 → 分支连线
      planBranches.forEach((b, i) => {
        const chosen = b.chosen
        ctx.beginPath(); ctx.moveTo(planRoot.x, planRoot.y); ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = chosen
          ? `rgba(0,229,255,${0.25 + Math.sin(time * 0.05) * 0.1})`
          : 'rgba(180,130,255,0.08)'
        ctx.lineWidth = chosen ? 1.5 : 0.6; ctx.stroke()

        // 分支节点
        const pulse = chosen ? 0.6 + Math.sin(time * 0.06) * 0.2 : 0.25
        if (chosen) {
          const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 14)
          g.addColorStop(0, `rgba(0,229,255,${0.15 * pulse})`); g.addColorStop(1, 'transparent')
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, 14, 0, Math.PI * 2); ctx.fill()
        }
        ctx.fillStyle = chosen ? `rgba(0,229,255,${0.7 * pulse})` : `rgba(180,130,255,${0.25})`
        ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = chosen ? `rgba(0,229,255,${0.6})` : 'rgba(180,130,255,0.2)'
        ctx.font = '6px monospace'; ctx.fillText(b.label, b.x - 4, b.y - 8)
      })

      // 分支 → 叶连线
      planLeaves.forEach(leaf => {
        const parent = planBranches[leaf.parent]
        const chosen = parent.chosen
        ctx.beginPath(); ctx.moveTo(parent.x, parent.y); ctx.lineTo(leaf.x, leaf.y)
        ctx.strokeStyle = chosen ? 'rgba(0,229,255,0.12)' : 'rgba(180,130,255,0.05)'
        ctx.lineWidth = 0.5; ctx.stroke()
        ctx.fillStyle = chosen ? 'rgba(0,229,255,0.3)' : 'rgba(180,130,255,0.12)'
        ctx.beginPath(); ctx.arc(leaf.x, leaf.y, 2.5, 0, Math.PI * 2); ctx.fill()
      })

      // ---- 下半：Chain-of-Thought ----
      // 步骤推进
      stepTimer++
      if (stepTimer > 50) { stepTimer = 0; activeStep = (activeStep + 1) % cotSteps.length }

      // 连线
      for (let i = 0; i < cotSteps.length - 1; i++) {
        const a = cotSteps[i], b = cotSteps[i + 1]
        const reached = i < activeStep
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = reached
          ? `rgba(0,229,255,${0.2 + Math.sin(time * 0.05 + i) * 0.08})`
          : 'rgba(0,229,255,0.06)'
        ctx.lineWidth = reached ? 1.2 : 0.5; ctx.stroke()

        // 箭头
        if (reached) {
          const angle = Math.atan2(b.y - a.y, b.x - a.x)
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
          ctx.save(); ctx.translate(mx, my); ctx.rotate(angle)
          ctx.fillStyle = `rgba(0,229,255,${0.3})`
          ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-3, -3); ctx.lineTo(-3, 3); ctx.closePath(); ctx.fill()
          ctx.restore()
        }
      }

      // 发射链脉冲
      if (time % 20 === 0 && activeStep > 0) {
        const idx = Math.min(activeStep - 1, cotSteps.length - 2)
        chainPulses.push({ from: idx, t: 0 })
      }
      chainPulses = chainPulses.filter(p => {
        p.t += 0.035; if (p.t > 1) return false
        const a = cotSteps[p.from], b = cotSteps[p.from + 1]
        const px = a.x + (b.x - a.x) * p.t
        const py = a.y + (b.y - a.y) * p.t
        const g = ctx.createRadialGradient(px, py, 0, px, py, 7)
        g.addColorStop(0, `rgba(0,229,255,${0.7 * (1 - p.t)})`); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill()
        return true
      })

      // CoT 节点
      cotSteps.forEach((s, i) => {
        const isActive = i === activeStep
        const isReached = i <= activeStep
        const pulse = isActive ? 0.7 + Math.sin(time * 0.1) * 0.3 : (isReached ? 0.55 : 0.2)

        // 光晕
        if (isReached) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5)
          g.addColorStop(0, `hsla(${s.hue},80%,65%,${0.2 * pulse})`); g.addColorStop(1, 'transparent')
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2); ctx.fill()
        }

        // 圆
        ctx.fillStyle = `hsla(${s.hue},80%,65%,${0.65 * pulse})`
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()

        // 活跃节点外圈
        if (isActive) {
          ctx.strokeStyle = `hsla(${s.hue},80%,70%,${0.4 + Math.sin(time * 0.12) * 0.2})`
          ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 4, 0, Math.PI * 2); ctx.stroke()
        }

        // 标签
        ctx.fillStyle = `hsla(${s.hue},80%,75%,${isReached ? 0.7 : 0.25})`
        ctx.font = isActive ? 'bold 8px monospace' : '7px monospace'
        ctx.fillText(s.label, s.x - ctx.measureText(s.label).width / 2, s.y + s.r + 12)
      })

      // 思考气泡（活跃节点上方冒出小气泡）
      if (time % 8 === 0 && activeStep < cotSteps.length) {
        const s = cotSteps[activeStep]
        particles.push({
          x: s.x + (Math.random() - 0.5) * 10,
          y: s.y - s.r - 5,
          vy: -0.4 - Math.random() * 0.3,
          life: 30 + Math.random() * 20,
          age: 0,
          r: 1.5 + Math.random() * 1.5,
        })
      }
      particles = particles.filter(p => {
        p.age++; p.y += p.vy; p.x += Math.sin(p.age * 0.15) * 0.3
        if (p.age > p.life) return false
        const alpha = (1 - p.age / p.life) * 0.5
        ctx.fillStyle = `rgba(0,229,255,${alpha})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - p.age / p.life * 0.5), 0, Math.PI * 2); ctx.fill()
        return true
      })

      // 底部标签
      const labels = ['Think', 'Reason', 'Plan']
      const lColors = ['rgba(0,229,255,', 'rgba(180,130,255,', 'rgba(0,230,118,']
      labels.forEach((l, i) => {
        const active = Math.floor((time / 60) % 3) === i
        ctx.fillStyle = `${lColors[i]}${active ? 0.7 : 0.25})`
        ctx.font = `${active ? 'bold ' : ''}7px monospace`
        ctx.fillText(l, 20 + i * 48, H - 8)
      })

      animationIds[5] = requestAnimationFrame(frame)
    }
    frame()
  }

  // ====== 7. Multimodal AI - Vision + Language 对齐 ======
  function startMultimodal(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0

    // 左侧：图像特征方块
    const imgFeatures = Array.from({ length: 16 }, (_, i) => ({
      x: 25 + (i % 4) * 22, y: 50 + Math.floor(i / 4) * 22,
      hue: 140 + Math.random() * 60, a: 0.3 + Math.random() * 0.4,
    }))
    // 右侧：文本特征条
    const txtFeatures = Array.from({ length: 6 }, (_, i) => ({
      x: 185, y: 45 + i * 25, w: 40 + Math.random() * 30, hue: 270 - i * 15,
    }))
    // 对齐连线
    const alignments = [[0, 0], [1, 0], [4, 1], [5, 2], [8, 3], [10, 4], [13, 5], [15, 5]]
    let pulses = []

    function frame() {
      time++; ctx.clearRect(0, 0, W, H)

      // 标签
      ctx.fillStyle = 'rgba(0,230,118,0.5)'; ctx.font = '9px monospace'; ctx.fillText('Vision', 42, 35)
      ctx.fillStyle = 'rgba(180,130,255,0.5)'; ctx.fillText('Language', 192, 35)

      // 中间桥
      ctx.fillStyle = `rgba(0,229,255,${0.06 + Math.sin(time * 0.04) * 0.03})`
      ctx.fillRect(130, 40, 40, H - 70)
      ctx.fillStyle = 'rgba(0,229,255,0.3)'; ctx.font = '7px monospace'; ctx.fillText('CLIP', 139, H - 25)

      // 图像特征
      imgFeatures.forEach((f, i) => {
        const pulse = 0.6 + Math.sin(time * 0.05 + i * 0.7) * 0.3
        ctx.fillStyle = `hsla(${f.hue},70%,55%,${f.a * pulse})`
        ctx.fillRect(f.x, f.y, 18, 18)
      })

      // 文本特征
      txtFeatures.forEach((f, i) => {
        const pulse = 0.6 + Math.sin(time * 0.04 + i * 1.1) * 0.3
        ctx.fillStyle = `hsla(${f.hue},70%,60%,${0.35 * pulse})`
        ctx.fillRect(f.x, f.y, f.w, 10)
      })

      // 对齐连线
      alignments.forEach(([ii, ti], idx) => {
        const img = imgFeatures[ii], txt = txtFeatures[ti]
        const ix = img.x + 18, iy = img.y + 9
        const tx = txt.x, ty = txt.y + 5
        const alpha = 0.08 + Math.sin(time * 0.04 + idx * 0.8) * 0.06
        ctx.beginPath(); ctx.moveTo(ix, iy)
        ctx.bezierCurveTo(ix + 40, iy, tx - 40, ty, tx, ty)
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`; ctx.lineWidth = 0.8; ctx.stroke()
      })

      // 脉冲
      if (time % 20 === 0) {
        const al = alignments[Math.floor(Math.random() * alignments.length)]
        pulses.push({ ii: al[0], ti: al[1], t: 0 })
      }
      pulses = pulses.filter(p => {
        p.t += 0.02; if (p.t > 1) return false
        const img = imgFeatures[p.ii], txt = txtFeatures[p.ti]
        const ix = img.x + 18, iy = img.y + 9, tx = txt.x, ty = txt.y + 5
        const t = p.t
        // Bezier 插值
        const mt = 1 - t
        const cx1 = ix + 40, cy1 = iy, cx2 = tx - 40, cy2 = ty
        const x = mt ** 3 * ix + 3 * mt ** 2 * t * cx1 + 3 * mt * t ** 2 * cx2 + t ** 3 * tx
        const y = mt ** 3 * iy + 3 * mt ** 2 * t * cy1 + 3 * mt * t ** 2 * cy2 + t ** 3 * ty
        const g = ctx.createRadialGradient(x, y, 0, x, y, 6)
        g.addColorStop(0, 'rgba(0,229,255,0.8)'); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill()
        return true
      })

      // Cosine similarity 分数
      const sim = (0.85 + Math.sin(time * 0.01) * 0.1).toFixed(2)
      ctx.fillStyle = 'rgba(0,229,255,0.5)'; ctx.font = '8px monospace'; ctx.fillText(`sim=${sim}`, 135, 55)

      animationIds[6] = requestAnimationFrame(frame)
    }
    frame()
  }

  // ====== 8. Embodied AI - 具身智能 ======
  function startEmbodied(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0

    // 机器人身体
    const robot = { x: W / 2, y: H / 2 + 10, angle: 0, targetAngle: 0 }
    // 感知射线
    const numRays = 12
    // 环境障碍物
    const obstacles = [
      { x: 60, y: 50, r: 18 },
      { x: 200, y: 60, r: 22 },
      { x: 80, y: 155, r: 15 },
      { x: 220, y: 150, r: 20 },
      { x: 140, y: 35, r: 12 },
    ]
    // 目标点
    let target = { x: 230, y: 170 }
    let trail = []
    let step = 0

    function frame() {
      time++; ctx.clearRect(0, 0, W, H)

      // 环境网格
      ctx.strokeStyle = 'rgba(0,229,255,0.03)'; ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 25) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

      // 障碍物
      obstacles.forEach(o => {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 1.5)
        g.addColorStop(0, 'rgba(255,60,60,0.12)'); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 1.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,80,80,0.25)'; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = 'rgba(255,80,80,0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.stroke()
      })

      // 目标
      const tp = 0.5 + Math.sin(time * 0.08) * 0.3
      const tg = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, 18)
      tg.addColorStop(0, `rgba(0,230,118,${0.4 * tp})`); tg.addColorStop(1, 'transparent')
      ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(target.x, target.y, 18, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = `rgba(0,230,118,${0.7 * tp})`; ctx.beginPath(); ctx.arc(target.x, target.y, 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(0,230,118,0.4)'; ctx.font = '7px monospace'; ctx.fillText('Goal', target.x - 10, target.y - 12)

      // 安全目标生成（远离障碍物和边缘）
      function safeTarget() {
        for (let tries = 0; tries < 50; tries++) {
          const tx = 40 + Math.random() * (W - 80), ty = 40 + Math.random() * (H - 80)
          const tooClose = obstacles.some(o => Math.sqrt((tx - o.x) ** 2 + (ty - o.y) ** 2) < o.r + 25)
          const tooNearRobot = Math.sqrt((tx - robot.x) ** 2 + (ty - robot.y) ** 2) < 60
          if (!tooClose && !tooNearRobot) return { x: tx, y: ty }
        }
        return { x: W / 2, y: H / 2 }
      }

      // 机器人移动逻辑
      if (time % 2 === 0) {
        const dx = target.x - robot.x, dy = target.y - robot.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        // 目标方向（归一化）
        const goalDx = dx / (dist || 1), goalDy = dy / (dist || 1)

        // 避障：斥力 + 切线力（绕过障碍物而非推回）
        let avoidX = 0, avoidY = 0
        obstacles.forEach(o => {
          const odx = robot.x - o.x, ody = robot.y - o.y
          const odist = Math.sqrt(odx * odx + ody * ody)
          const safeR = o.r + 35
          if (odist < safeR && odist > 0) {
            const force = ((safeR - odist) / safeR) ** 2
            // 斥力
            avoidX += (odx / odist) * force * 2
            avoidY += (ody / odist) * force * 2
            // 切线力（垂直于斥力方向，帮助绕行）
            avoidX += (-ody / odist) * force * 1.5
            avoidY += (odx / odist) * force * 1.5
          }
        })

        // 边界斥力
        const margin = 25
        if (robot.x < margin) avoidX += (margin - robot.x) / margin * 2
        if (robot.x > W - margin) avoidX -= (robot.x - (W - margin)) / margin * 2
        if (robot.y < margin) avoidY += (margin - robot.y) / margin * 2
        if (robot.y > H - margin) avoidY -= (robot.y - (H - margin)) / margin * 2

        // 合力
        const totalX = goalDx * 1.5 + avoidX
        const totalY = goalDy * 1.5 + avoidY
        const totalLen = Math.sqrt(totalX * totalX + totalY * totalY) || 1
        const speed = 1.0
        const moveX = (totalX / totalLen) * speed
        const moveY = (totalY / totalLen) * speed

        robot.x += moveX
        robot.y += moveY

        // 平滑转向
        const moveAngle = Math.atan2(moveY, moveX)
        let angleDiff = moveAngle - robot.angle
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
        robot.angle += angleDiff * 0.2

        // 硬边界
        robot.x = Math.max(12, Math.min(W - 12, robot.x))
        robot.y = Math.max(12, Math.min(H - 12, robot.y))

        trail.push({ x: robot.x, y: robot.y })
        if (trail.length > 80) trail.shift()

        // 卡住检测：最近 30 帧移动距离极小则换目标
        if (trail.length > 30) {
          const recent = trail.slice(-30)
          const totalMove = recent.reduce((sum, p, i) => {
            if (i === 0) return 0
            return sum + Math.sqrt((p.x - recent[i - 1].x) ** 2 + (p.y - recent[i - 1].y) ** 2)
          }, 0)
          if (totalMove < 8) {
            target = safeTarget()
            trail = []
          }
        }

        // 到达目标
        if (dist < 15) {
          step++
          target = safeTarget()
          trail = []
        }
      }

      // 轨迹
      if (trail.length > 1) {
        ctx.beginPath(); ctx.moveTo(trail[0].x, trail[0].y)
        trail.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.strokeStyle = 'rgba(0,229,255,0.15)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.stroke()
      }

      // 感知射线（LiDAR）
      for (let i = 0; i < numRays; i++) {
        const rayAngle = robot.angle + (i / numRays) * Math.PI * 2
        const rayLen = 50
        let hitDist = rayLen

        // 检测障碍物
        for (let d = 0; d < rayLen; d += 2) {
          const rx = robot.x + Math.cos(rayAngle) * d
          const ry = robot.y + Math.sin(rayAngle) * d
          for (const o of obstacles) {
            if (Math.sqrt((rx - o.x) ** 2 + (ry - o.y) ** 2) < o.r) { hitDist = d; break }
          }
          if (hitDist < rayLen) break
        }

        const endX = robot.x + Math.cos(rayAngle) * hitDist
        const endY = robot.y + Math.sin(rayAngle) * hitDist
        const rayAlpha = hitDist < rayLen ? 0.3 : 0.08

        ctx.beginPath(); ctx.moveTo(robot.x, robot.y); ctx.lineTo(endX, endY)
        ctx.strokeStyle = hitDist < rayLen ? `rgba(255,100,100,${rayAlpha})` : `rgba(0,229,255,${rayAlpha})`
        ctx.lineWidth = 0.6; ctx.stroke()

        // 命中点
        if (hitDist < rayLen) {
          ctx.fillStyle = 'rgba(255,100,100,0.5)'; ctx.beginPath(); ctx.arc(endX, endY, 2, 0, Math.PI * 2); ctx.fill()
        }
      }

      // 机器人本体
      const rp = 0.6 + Math.sin(time * 0.08) * 0.15
      // 身体光晕
      const rg = ctx.createRadialGradient(robot.x, robot.y, 0, robot.x, robot.y, 18)
      rg.addColorStop(0, `rgba(0,229,255,${0.25 * rp})`); rg.addColorStop(1, 'transparent')
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(robot.x, robot.y, 18, 0, Math.PI * 2); ctx.fill()
      // 身体
      ctx.fillStyle = `rgba(0,229,255,${0.7 * rp})`; ctx.beginPath(); ctx.arc(robot.x, robot.y, 7, 0, Math.PI * 2); ctx.fill()
      // 方向指示
      ctx.strokeStyle = `rgba(0,229,255,${0.8 * rp})`; ctx.lineWidth = 2; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(robot.x, robot.y)
      ctx.lineTo(robot.x + Math.cos(robot.angle) * 14, robot.y + Math.sin(robot.angle) * 14)
      ctx.stroke()

      // 感知-决策-行动 循环标签
      const labels = ['Perceive', 'Plan', 'Act']
      const labelColors = ['rgba(0,229,255,', 'rgba(180,130,255,', 'rgba(0,230,118,']
      labels.forEach((l, i) => {
        const la = (time * 0.03 + i * Math.PI * 2 / 3) % (Math.PI * 2)
        const lx = W - 40 + Math.cos(la) * 18
        const ly = 30 + Math.sin(la) * 18
        const active = Math.floor((time / 40) % 3) === i
        ctx.fillStyle = `${labelColors[i]}${active ? 0.8 : 0.3})`
        ctx.font = `${active ? 'bold ' : ''}7px monospace`
        ctx.fillText(l, lx - 14, ly + 3)
      })

      // 信息
      ctx.fillStyle = 'rgba(0,229,255,0.4)'; ctx.font = '8px monospace'
      ctx.fillText(`Step: ${step}  Sensors: ${numRays}`, 8, H - 6)

      animationIds[7] = requestAnimationFrame(frame)
    }
    frame()
  }

  // ====== 9. Neuro-Symbolic Learning ======
  function startNeuroSym(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0

    // 左侧：神经网络 3 层
    const layers = [
      Array.from({ length: 4 }, (_, i) => ({ x: 42, y: 35 + i * 40 })),
      Array.from({ length: 4 }, (_, i) => ({ x: 88, y: 35 + i * 40 })),
      Array.from({ length: 3 }, (_, i) => ({ x: 134, y: 50 + i * 40 })),
    ]

    // 右侧：逻辑符号
    const symbols = [
      { x: 192, y: 42, s: '∀', hue: 270 },
      { x: 228, y: 42, s: '∃', hue: 270 },
      { x: 192, y: 82, s: '→', hue: 290 },
      { x: 228, y: 82, s: '∧', hue: 290 },
      { x: 192, y: 122, s: '¬', hue: 310 },
      { x: 228, y: 122, s: '∨', hue: 310 },
      { x: 210, y: 158, s: '⊢', hue: 250 },
    ]
    const symEdges = [[0,2],[1,3],[2,4],[3,5],[4,6],[5,6]]
    const bridges = [[0,0],[0,2],[1,3],[1,4],[2,5],[2,6]]
    let sparks = []

    function frame() {
      time++; ctx.clearRect(0, 0, W, H)

      ctx.fillStyle = 'rgba(0,229,255,0.35)'; ctx.font = 'bold 7px monospace'; ctx.fillText('Neural', 48, 20)
      ctx.fillStyle = 'rgba(180,130,255,0.35)'; ctx.fillText('Symbolic', 192, 20)

      // 分隔虚线
      ctx.strokeStyle = 'rgba(0,229,255,0.08)'; ctx.lineWidth = 1; ctx.setLineDash([3,4])
      ctx.beginPath(); ctx.moveTo(162, 25); ctx.lineTo(162, H - 8); ctx.stroke(); ctx.setLineDash([])

      // 神经网络连线 + 节点
      for (let l = 0; l < layers.length - 1; l++) {
        layers[l].forEach(a => { layers[l+1].forEach(b => {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(0,229,255,${0.05 + Math.sin(time*0.04+a.y+b.y)*0.03})`; ctx.lineWidth = 0.5; ctx.stroke()
        })})
      }
      layers.forEach((layer, l) => layer.forEach((n, i) => {
        const p = 0.5 + Math.sin(time*0.06+l*2+i)*0.25
        const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,14)
        g.addColorStop(0, `rgba(0,229,255,${0.15*p})`); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x,n.y,14,0,Math.PI*2); ctx.fill()
        ctx.fillStyle = `rgba(0,229,255,${0.6*p})`; ctx.beginPath(); ctx.arc(n.x,n.y,4.5,0,Math.PI*2); ctx.fill()
      }))

      // 桥接连线
      const last = layers[2]
      bridges.forEach(([ni,si]) => {
        ctx.beginPath(); ctx.moveTo(last[ni].x,last[ni].y); ctx.lineTo(symbols[si].x,symbols[si].y)
        ctx.strokeStyle = `rgba(124,77,255,${0.07+Math.sin(time*0.03+ni+si)*0.04})`; ctx.lineWidth = 0.6; ctx.stroke()
      })

      // 桥接脉冲
      if (time % 28 === 0) { const b = bridges[Math.floor(Math.random()*bridges.length)]; sparks.push({ n:b[0], s:b[1], t:0 }) }
      sparks = sparks.filter(sp => {
        sp.t += 0.03; if (sp.t > 1) return false
        const a = last[sp.n], b = symbols[sp.s]
        const px = a.x+(b.x-a.x)*sp.t, py = a.y+(b.y-a.y)*sp.t
        const g = ctx.createRadialGradient(px,py,0,px,py,6)
        g.addColorStop(0, `rgba(124,77,255,${0.8*(1-sp.t)})`); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill()
        return true
      })

      // 逻辑连线
      symEdges.forEach(([a,b]) => {
        ctx.beginPath(); ctx.moveTo(symbols[a].x,symbols[a].y); ctx.lineTo(symbols[b].x,symbols[b].y)
        ctx.strokeStyle = `rgba(180,130,255,${0.05+Math.sin(time*0.035+a)*0.03})`; ctx.lineWidth = 0.5; ctx.stroke()
      })

      // 逻辑符号节点
      symbols.forEach((ln,i) => {
        const p = 0.5 + Math.sin(time*0.05+i*1.3)*0.25
        const g = ctx.createRadialGradient(ln.x,ln.y,0,ln.x,ln.y,14)
        g.addColorStop(0, `hsla(${ln.hue},80%,70%,${0.12*p})`); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ln.x,ln.y,14,0,Math.PI*2); ctx.fill()
        ctx.strokeStyle = `hsla(${ln.hue},70%,65%,${0.25*p})`; ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(ln.x,ln.y,9,0,Math.PI*2); ctx.stroke()
        ctx.fillStyle = `hsla(${ln.hue},80%,75%,${0.75*p})`; ctx.font = 'bold 10px serif'
        ctx.fillText(ln.s, ln.x-ctx.measureText(ln.s).width/2, ln.y+4)
      })

      // 底部推理
      const ip = 0.4 + Math.sin(time*0.06)*0.3
      ctx.fillStyle = `rgba(0,230,118,${0.4*ip})`; ctx.font = '7px monospace'
      ctx.fillText('Infer: P(x) → Q(x)', 158, H - 6)

      animationIds[8] = requestAnimationFrame(frame)
    }
    frame()
  }

  // ====== 10. LSTM ======
  function startLSTM(cvs) {
    const ctx = initCanvas(cvs)
    let time = 0

    // 4 个时间步展开
    const cells = Array.from({ length: 4 }, (_, i) => ({
      x: 38 + i * 62, y: H / 2, w: 48, h: 60,
    }))

    const gateLabels = ['f', 'i', 'o']
    const gateColors = ['rgba(255,100,100,', 'rgba(0,229,255,', 'rgba(0,230,118,']

    let flowParticles = []
    let cellStateParticles = []

    function frame() {
      time++; ctx.clearRect(0, 0, W, H)
      const cellY = H / 2

      // Cell State 线
      const stateY = cellY - 38
      ctx.strokeStyle = `rgba(255,180,0,${0.15 + Math.sin(time * 0.04) * 0.05})`
      ctx.lineWidth = 2; ctx.beginPath()
      ctx.moveTo(cells[0].x - 10, stateY)
      ctx.lineTo(cells[cells.length - 1].x + cells[0].w + 10, stateY)
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,180,0,0.3)'; ctx.font = '6px monospace'
      ctx.fillText('Cell State (C_t)', cells[0].x, stateY - 6)

      // Hidden State 线
      const hiddenY = cellY + 38
      ctx.strokeStyle = `rgba(0,229,255,${0.1 + Math.sin(time * 0.035) * 0.04})`
      ctx.lineWidth = 1.5; ctx.beginPath()
      ctx.moveTo(cells[0].x - 10, hiddenY)
      ctx.lineTo(cells[cells.length - 1].x + cells[0].w + 10, hiddenY)
      ctx.stroke()
      ctx.fillStyle = 'rgba(0,229,255,0.25)'; ctx.fillText('Hidden (h_t)', cells[0].x, hiddenY + 12)

      // 每个 LSTM 单元
      cells.forEach((cell, ci) => {
        const cx = cell.x, cy = cell.y
        const pulse = 0.5 + Math.sin(time * 0.05 + ci * 1.5) * 0.2

        ctx.strokeStyle = `rgba(0,229,255,${0.15 * pulse})`; ctx.lineWidth = 1
        ctx.strokeRect(cx, cy - 24, cell.w, cell.h - 12)

        gateLabels.forEach((g, gi) => {
          const gx = cx + 6 + gi * 16, gy = cy - 8
          const gateActive = Math.sin(time * 0.07 + ci * 2 + gi * 1.3) > 0
          const gAlpha = gateActive ? 0.6 * pulse : 0.15

          ctx.fillStyle = `${gateColors[gi]}${gAlpha})`
          ctx.beginPath(); ctx.arc(gx + 5, gy + 5, 5, 0, Math.PI * 2); ctx.fill()

          ctx.fillStyle = `${gateColors[gi]}${gAlpha + 0.1})`
          ctx.font = 'bold 7px serif'; ctx.fillText('σ', gx + 2, gy + 8)

          ctx.fillStyle = `${gateColors[gi]}0.35)`
          ctx.font = '5px monospace'; ctx.fillText(g, gx + 4, gy + 18)
        })

        ctx.fillStyle = `rgba(180,130,255,${0.4 * pulse})`; ctx.font = '7px monospace'
        ctx.fillText(`t${ci}`, cx + cell.w / 2 - 4, cy + cell.h - 26)
      })

      // Cell State 流粒子
      if (time % 12 === 0) cellStateParticles.push({ x: cells[0].x - 10, y: stateY, speed: 1.2 + Math.random() * 0.5 })
      cellStateParticles = cellStateParticles.filter(p => {
        p.x += p.speed; if (p.x > cells[cells.length - 1].x + cells[0].w + 20) return false
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5)
        g.addColorStop(0, 'rgba(255,180,0,0.6)'); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill()
        return true
      })

      // Hidden State 流粒子
      if (time % 18 === 0) flowParticles.push({ x: cells[0].x - 10, y: hiddenY, speed: 0.9 + Math.random() * 0.4 })
      flowParticles = flowParticles.filter(p => {
        p.x += p.speed; if (p.x > cells[cells.length - 1].x + cells[0].w + 20) return false
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 4)
        g.addColorStop(0, 'rgba(0,229,255,0.5)'); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill()
        return true
      })

      // 门控连接线
      cells.forEach((cell, ci) => {
        ctx.strokeStyle = `rgba(255,100,100,${0.06 + Math.sin(time * 0.06 + ci) * 0.04})`; ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(cell.x + 11, cell.y - 3); ctx.lineTo(cell.x + 11, stateY); ctx.stroke()
        ctx.strokeStyle = `rgba(0,229,255,${0.06 + Math.sin(time * 0.06 + ci + 1) * 0.04})`
        ctx.beginPath(); ctx.moveTo(cell.x + 27, cell.y - 3); ctx.lineTo(cell.x + 27, stateY); ctx.stroke()
        ctx.strokeStyle = `rgba(0,230,118,${0.06 + Math.sin(time * 0.06 + ci + 2) * 0.04})`
        ctx.beginPath(); ctx.moveTo(cell.x + 43, cell.y + 13); ctx.lineTo(cell.x + 43, hiddenY); ctx.stroke()
      })

      // 输入标签
      ctx.fillStyle = 'rgba(180,130,255,0.3)'; ctx.font = '7px monospace'
      cells.forEach((cell, ci) => {
        ctx.fillText(`x${ci}`, cell.x + cell.w / 2 - 4, cell.y + cell.h - 12)
      })

      animationIds[9] = requestAnimationFrame(frame)
    }
    frame()
  }

  // 启动所有动画
  const starters = [startLLM, startDiffusion, startCV, startRL, startGAN, startKG, startMultimodal, startEmbodied, startNeuroSym, startLSTM]
  setTimeout(() => {
    const refs = canvasRefs.value
    starters.forEach((fn, i) => { if (refs[i]) fn(refs[i]) })
  }, 100)
})

onUnmounted(() => {
  animationIds.forEach(id => cancelAnimationFrame(id))
})
</script>

<style scoped>
.tech-showcase {
  max-width: 1200px;
  margin: 1rem auto 3rem;
  padding: 0 1.5rem;
}

.tech-showcase-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: title-in 0.8s ease-out 0.5s both;
}

@keyframes title-in {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.tech-title-text {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(0, 229, 255, 0.6);
  white-space: nowrap;
  animation: title-text-glow 4s ease-in-out infinite;
}

@keyframes title-text-glow {
  0%, 100% { text-shadow: 0 0 0 transparent; }
  50% { text-shadow: 0 0 12px rgba(0, 229, 255, 0.3); }
}

.tech-title-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.3), transparent);
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(265px, 1fr));
  gap: 1.2rem;
}

.tech-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 229, 255, 0.1);
  background: rgba(10, 15, 30, 0.4);
  backdrop-filter: blur(12px);
  transition: all 0.4s ease;
  animation: card-in 0.7s ease-out both;
}

.tech-card:nth-child(1) { animation-delay: 0.6s; }
.tech-card:nth-child(2) { animation-delay: 0.72s; }
.tech-card:nth-child(3) { animation-delay: 0.84s; }
.tech-card:nth-child(4) { animation-delay: 0.96s; }
.tech-card:nth-child(5) { animation-delay: 1.08s; }
.tech-card:nth-child(6) { animation-delay: 1.2s; }
.tech-card:nth-child(7) { animation-delay: 1.32s; }
.tech-card:nth-child(8) { animation-delay: 1.44s; }
.tech-card:nth-child(9) { animation-delay: 1.56s; }
.tech-card:nth-child(10) { animation-delay: 1.68s; }

@keyframes card-in {
  from { opacity: 0; transform: translateY(30px) scale(0.95); filter: blur(6px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

.tech-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.4), rgba(124, 77, 255, 0.4), transparent);
  background-size: 200% 100%;
  animation: scan-border 3s linear infinite;
}

@keyframes scan-border {
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}

.tech-card:hover {
  border-color: rgba(0, 229, 255, 0.25);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.08), 0 15px 30px -10px rgba(0, 0, 0, 0.3);
  transform: translateY(-4px);
}

.tech-canvas { width: 100%; display: block; }

.tech-info {
  padding: 0.8rem 1rem;
  border-top: 1px solid rgba(0, 229, 255, 0.06);
}

.tech-name {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: rgba(0, 229, 255, 0.8);
  margin-bottom: 0.2rem;
  animation: name-glow 5s ease-in-out infinite;
}

.tech-card:nth-child(1) .tech-name { animation-delay: 0s; }
.tech-card:nth-child(2) .tech-name { animation-delay: 0.6s; }
.tech-card:nth-child(3) .tech-name { animation-delay: 1.2s; }
.tech-card:nth-child(4) .tech-name { animation-delay: 1.8s; }
.tech-card:nth-child(5) .tech-name { animation-delay: 2.4s; }
.tech-card:nth-child(6) .tech-name { animation-delay: 3.0s; }
.tech-card:nth-child(7) .tech-name { animation-delay: 3.6s; }
.tech-card:nth-child(8) .tech-name { animation-delay: 4.2s; }
.tech-card:nth-child(9) .tech-name { animation-delay: 4.8s; }
.tech-card:nth-child(10) .tech-name { animation-delay: 5.4s; }

@keyframes name-glow {
  0%, 100% { text-shadow: 0 0 0 transparent; }
  50% { text-shadow: 0 0 8px rgba(0, 229, 255, 0.4); }
}

.tech-desc {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
}

:root:not(.dark) .tech-card {
  background: rgba(240, 245, 255, 0.6);
  border-color: rgba(0, 140, 200, 0.12);
}

@media (max-width: 640px) {
  .tech-grid { grid-template-columns: 1fr; }
}
</style>
