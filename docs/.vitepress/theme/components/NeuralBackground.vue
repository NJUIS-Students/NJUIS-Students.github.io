<template>
  <canvas ref="canvas" class="neural-bg" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let animationId = null
let mouse = { x: -9999, y: -9999 }

onMounted(() => {
  const cvs = canvas.value
  if (!cvs) return
  const ctx = cvs.getContext('2d')

  let width, height, particles, dpr

  const colors = [
    'rgba(0, 229, 255, ',    // cyan
    'rgba(130, 100, 255, ',   // purple
    'rgba(0, 180, 255, ',     // blue
    'rgba(180, 130, 255, ',   // lavender
    'rgba(0, 255, 200, ',     // mint
  ]

  function resize() {
    dpr = window.devicePixelRatio || 1
    width = window.innerWidth
    height = Math.min(window.innerHeight * 1.2, 900)
    cvs.width = width * dpr
    cvs.height = height * dpr
    cvs.style.width = width + 'px'
    cvs.style.height = height + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function createParticles() {
    const count = Math.floor((width * height) / 8000)
    particles = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      })
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)

    const connectionDist = 120
    const mouseDist = 200

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // Move
      p.x += p.vx
      p.y += p.vy
      p.pulse += p.pulseSpeed

      // Bounce at edges
      if (p.x < 0 || p.x > width) p.vx *= -1
      if (p.y < 0 || p.y > height) p.vy *= -1

      // Mouse interaction - attract gently
      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < mouseDist && dist > 0) {
        const force = (mouseDist - dist) / mouseDist * 0.008
        p.vx += dx * force
        p.vy += dy * force
      }

      // Damping
      p.vx *= 0.999
      p.vy *= 0.999

      // Pulsing glow
      const glowAlpha = 0.4 + Math.sin(p.pulse) * 0.25
      const glowR = p.r + Math.sin(p.pulse) * 1

      // Draw glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR * 4)
      gradient.addColorStop(0, p.color + (glowAlpha * 0.6) + ')')
      gradient.addColorStop(1, p.color + '0)')
      ctx.beginPath()
      ctx.arc(p.x, p.y, glowR * 4, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw core
      ctx.beginPath()
      ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2)
      ctx.fillStyle = p.color + glowAlpha + ')'
      ctx.fill()

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]
        const cdx = p.x - p2.x
        const cdy = p.y - p2.y
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy)

        if (cdist < connectionDist) {
          const alpha = (1 - cdist / connectionDist) * 0.2

          // Near mouse, connections glow brighter
          const midX = (p.x + p2.x) / 2
          const midY = (p.y + p2.y) / 2
          const mDist = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2)
          const boost = mDist < mouseDist ? (1 - mDist / mouseDist) * 0.3 : 0

          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(100, 180, 255, ${alpha + boost})`
          ctx.lineWidth = 0.6 + boost * 2
          ctx.stroke()
        }
      }
    }

    animationId = requestAnimationFrame(draw)
  }

  function onMouseMove(e) {
    const rect = cvs.getBoundingClientRect()
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
  }

  function onMouseLeave() {
    mouse.x = -9999
    mouse.y = -9999
  }

  resize()
  createParticles()
  draw()

  window.addEventListener('resize', () => {
    resize()
    createParticles()
  })
  cvs.addEventListener('mousemove', onMouseMove)
  cvs.addEventListener('mouseleave', onMouseLeave)

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resize)
    cvs.removeEventListener('mousemove', onMouseMove)
    cvs.removeEventListener('mouseleave', onMouseLeave)
  })
})
</script>

<style scoped>
.neural-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: auto;
  z-index: 0;
  opacity: 0.7;
  animation: neural-fade-in 2s ease-out;
}

@keyframes neural-fade-in {
  from { opacity: 0; }
  to { opacity: 0.7; }
}
</style>
