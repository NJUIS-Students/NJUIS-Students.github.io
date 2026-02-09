<template>
  <div class="ai-viz-section">
    <canvas ref="canvas" class="ai-canvas" />
    <!-- 浮动标签 -->
    <div class="ai-labels">
      <span class="ai-label label-input" style="left: 8%; top: 45%;">Input</span>
      <span class="ai-label label-hidden" style="left: 30%; top: 18%;">Encoder</span>
      <span class="ai-label label-attn" style="left: 50%; top: 12%;">Attention</span>
      <span class="ai-label label-hidden2" style="left: 70%; top: 18%;">Decoder</span>
      <span class="ai-label label-output" style="left: 90%; top: 45%;">Output</span>
    </div>
    <!-- 底部指标 -->
    <div class="ai-metrics">
      <div class="ai-metric">
        <span class="ai-metric-value" data-metric="params">175B</span>
        <span class="ai-metric-label">Parameters</span>
      </div>
      <div class="ai-metric">
        <span class="ai-metric-value" data-metric="layers">96</span>
        <span class="ai-metric-label">Layers</span>
      </div>
      <div class="ai-metric">
        <span class="ai-metric-value" data-metric="heads">96</span>
        <span class="ai-metric-label">Attention Heads</span>
      </div>
      <div class="ai-metric">
        <span class="ai-metric-value" data-metric="tokens">2048</span>
        <span class="ai-metric-label">Max Tokens</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let animationId = null

onMounted(() => {
  const cvs = canvas.value
  if (!cvs) return
  const ctx = cvs.getContext('2d')

  let width, height, dpr
  let time = 0

  // 网络结构定义：每层节点数
  const layers = [4, 8, 12, 16, 12, 8, 4]
  let nodes = []
  let connections = []
  let particles = []

  function resize() {
    dpr = window.devicePixelRatio || 1
    const rect = cvs.parentElement.getBoundingClientRect()
    width = rect.width
    height = Math.min(420, window.innerHeight * 0.45)
    cvs.width = width * dpr
    cvs.height = height * dpr
    cvs.style.width = width + 'px'
    cvs.style.height = height + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    buildNetwork()
  }

  function buildNetwork() {
    nodes = []
    connections = []

    const marginX = width * 0.1
    const usableW = width - marginX * 2
    const layerSpacing = usableW / (layers.length - 1)

    // 创建节点
    layers.forEach((count, li) => {
      const x = marginX + li * layerSpacing
      const totalH = height * 0.7
      const startY = (height - totalH) / 2
      const spacing = count > 1 ? totalH / (count - 1) : 0

      for (let ni = 0; ni < count; ni++) {
        const y = count > 1 ? startY + ni * spacing : height / 2
        nodes.push({
          x, y,
          layer: li,
          r: 3 + (li === 3 ? 2 : 0), // Attention 层节点更大
          baseAlpha: 0.4 + Math.random() * 0.3,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.015,
        })
      }
    })

    // 创建连接（相邻层之间）
    for (let li = 0; li < layers.length - 1; li++) {
      const curLayer = nodes.filter(n => n.layer === li)
      const nextLayer = nodes.filter(n => n.layer === li + 1)

      curLayer.forEach(from => {
        // 每个节点连接到下一层的部分节点（不全连接，更美观）
        const connectCount = Math.min(nextLayer.length, Math.ceil(nextLayer.length * 0.5))
        const shuffled = [...nextLayer].sort(() => Math.random() - 0.5)
        for (let i = 0; i < connectCount; i++) {
          connections.push({
            from, to: shuffled[i],
            alpha: 0.04 + Math.random() * 0.04,
          })
        }
      })
    }
  }

  function spawnParticle() {
    if (connections.length === 0) return
    // 随机选一条连接，生成粒子
    const conn = connections[Math.floor(Math.random() * connections.length)]
    particles.push({
      conn,
      t: 0, // 0 到 1 的进度
      speed: 0.008 + Math.random() * 0.012,
      size: 1.5 + Math.random() * 2,
      color: Math.random() > 0.5 ? 'cyan' : 'purple',
    })
  }

  function draw() {
    time++
    ctx.clearRect(0, 0, width, height)

    // 每帧生成若干粒子
    if (time % 2 === 0) {
      for (let i = 0; i < 3; i++) spawnParticle()
    }

    // 绘制连接线
    connections.forEach(c => {
      ctx.beginPath()
      ctx.moveTo(c.from.x, c.from.y)
      ctx.lineTo(c.to.x, c.to.y)
      ctx.strokeStyle = `rgba(0, 229, 255, ${c.alpha})`
      ctx.lineWidth = 0.5
      ctx.stroke()
    })

    // 绘制节点
    nodes.forEach(n => {
      n.pulse += n.pulseSpeed
      const glow = n.baseAlpha + Math.sin(n.pulse) * 0.15
      const isAttention = n.layer === 3

      // 外发光
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6)
      if (isAttention) {
        grad.addColorStop(0, `rgba(124, 77, 255, ${glow * 0.5})`)
        grad.addColorStop(1, `rgba(124, 77, 255, 0)`)
      } else {
        grad.addColorStop(0, `rgba(0, 229, 255, ${glow * 0.4})`)
        grad.addColorStop(1, `rgba(0, 229, 255, 0)`)
      }
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // 核心点
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fillStyle = isAttention
        ? `rgba(180, 130, 255, ${glow})`
        : `rgba(0, 229, 255, ${glow})`
      ctx.fill()
    })

    // 绘制&更新粒子
    particles = particles.filter(p => {
      p.t += p.speed
      if (p.t > 1) return false

      const x = p.conn.from.x + (p.conn.to.x - p.conn.from.x) * p.t
      const y = p.conn.from.y + (p.conn.to.y - p.conn.from.y) * p.t

      // 粒子拖尾
      const tailLen = 0.08
      const tx = p.conn.from.x + (p.conn.to.x - p.conn.from.x) * Math.max(0, p.t - tailLen)
      const ty = p.conn.from.y + (p.conn.to.y - p.conn.from.y) * Math.max(0, p.t - tailLen)

      const grad = ctx.createLinearGradient(tx, ty, x, y)
      if (p.color === 'cyan') {
        grad.addColorStop(0, 'rgba(0, 229, 255, 0)')
        grad.addColorStop(1, 'rgba(0, 229, 255, 0.8)')
      } else {
        grad.addColorStop(0, 'rgba(180, 130, 255, 0)')
        grad.addColorStop(1, 'rgba(180, 130, 255, 0.8)')
      }

      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(x, y)
      ctx.strokeStyle = grad
      ctx.lineWidth = p.size
      ctx.lineCap = 'round'
      ctx.stroke()

      // 粒子头部辉光
      const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4)
      if (p.color === 'cyan') {
        glow.addColorStop(0, 'rgba(0, 229, 255, 0.6)')
        glow.addColorStop(1, 'rgba(0, 229, 255, 0)')
      } else {
        glow.addColorStop(0, 'rgba(180, 130, 255, 0.6)')
        glow.addColorStop(1, 'rgba(180, 130, 255, 0)')
      }
      ctx.beginPath()
      ctx.arc(x, y, p.size * 4, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      return true
    })

    // Attention 层中心光环
    const attnNodes = nodes.filter(n => n.layer === 3)
    if (attnNodes.length > 0) {
      const cx = attnNodes[0].x
      const cy = height / 2
      const pulse = Math.sin(time * 0.02) * 0.5 + 0.5
      const ringR = height * 0.38

      ctx.beginPath()
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(124, 77, 255, ${0.03 + pulse * 0.05})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 内环
      ctx.beginPath()
      ctx.arc(cx, cy, ringR * 0.7, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.02 + pulse * 0.04})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    animationId = requestAnimationFrame(draw)
  }

  // 指标数字滚动动画
  function animateMetrics() {
    const metrics = {
      params: { target: 175, suffix: 'B', duration: 2000 },
      layers: { target: 96, suffix: '', duration: 1800 },
      heads: { target: 96, suffix: '', duration: 1800 },
      tokens: { target: 2048, suffix: '', duration: 2200 },
    }

    Object.entries(metrics).forEach(([key, config]) => {
      const el = document.querySelector(`[data-metric="${key}"]`)
      if (!el) return

      const start = 0
      const startTime = performance.now()

      function update(now) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / config.duration, 1)
        // easeOutExpo
        const ease = 1 - Math.pow(2, -10 * progress)
        const current = Math.floor(start + (config.target - start) * ease)
        el.textContent = current + config.suffix
        if (progress < 1) requestAnimationFrame(update)
      }

      setTimeout(() => requestAnimationFrame(update), 500)
    })
  }

  resize()
  draw()
  animateMetrics()

  window.addEventListener('resize', resize)

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resize)
  })
})
</script>

<style scoped>
.ai-viz-section {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: -2rem auto 2rem;
  padding: 0 1.5rem;
}

.ai-canvas {
  width: 100%;
  display: block;
}

.ai-labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ai-label {
  position: absolute;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  transform: translateX(-50%);
  animation: label-pulse 4s ease-in-out infinite;
  white-space: nowrap;
}

.label-input {
  color: rgba(0, 229, 255, 0.7);
  background: rgba(0, 229, 255, 0.06);
  border: 1px solid rgba(0, 229, 255, 0.15);
  animation-delay: 0s;
}

.label-hidden {
  color: rgba(0, 229, 255, 0.6);
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.12);
  animation-delay: 0.8s;
}

.label-attn {
  color: rgba(180, 130, 255, 0.8);
  background: rgba(124, 77, 255, 0.08);
  border: 1px solid rgba(124, 77, 255, 0.2);
  font-size: 0.8rem;
  animation-delay: 1.6s;
}

.label-hidden2 {
  color: rgba(0, 229, 255, 0.6);
  background: rgba(0, 229, 255, 0.05);
  border: 1px solid rgba(0, 229, 255, 0.12);
  animation-delay: 2.4s;
}

.label-output {
  color: rgba(0, 229, 255, 0.7);
  background: rgba(0, 229, 255, 0.06);
  border: 1px solid rgba(0, 229, 255, 0.15);
  animation-delay: 3.2s;
}

@keyframes label-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* 底部指标 */
.ai-metrics {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.ai-metric {
  text-align: center;
  animation: metric-fade-in 0.8s ease-out both;
}

.ai-metric:nth-child(1) { animation-delay: 0.5s; }
.ai-metric:nth-child(2) { animation-delay: 0.7s; }
.ai-metric:nth-child(3) { animation-delay: 0.9s; }
.ai-metric:nth-child(4) { animation-delay: 1.1s; }

@keyframes metric-fade-in {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-metric-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  background: linear-gradient(135deg, #00e5ff, #b388ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: value-glow 3s ease-in-out infinite;
}

.ai-metric:nth-child(1) .ai-metric-value { animation-delay: 0s; }
.ai-metric:nth-child(2) .ai-metric-value { animation-delay: 0.75s; }
.ai-metric:nth-child(3) .ai-metric-value { animation-delay: 1.5s; }
.ai-metric:nth-child(4) .ai-metric-value { animation-delay: 2.25s; }

@keyframes value-glow {
  0%, 100% {
    filter: drop-shadow(0 0 0 transparent);
  }
  50% {
    filter: drop-shadow(0 0 10px rgba(0, 229, 255, 0.4));
  }
}

.ai-metric-label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-top: 0.25rem;
  animation: label-breathe 4s ease-in-out infinite;
}

@keyframes label-breathe {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

@media (max-width: 640px) {
  .ai-metrics {
    gap: 1.5rem;
  }
  .ai-metric-value {
    font-size: 1.3rem;
  }
  .ai-label {
    font-size: 0.55rem;
  }
}
</style>
