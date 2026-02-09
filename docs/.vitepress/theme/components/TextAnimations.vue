<template>
  <div />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
let observer = null

// Matrix/decode 字符集
const glitchChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*<>{}[]!?/\\|~^αβγδεζηθλμπσφψω∑∏∫∂∇∞≈≠±×÷√'

/**
 * 文字解码动画：随机字符逐步解析为真实文字
 */
function scrambleDecode(el, finalText, duration = 1800) {
  const len = finalText.length
  const steps = 30
  const interval = duration / steps
  let step = 0

  el.style.visibility = 'visible'

  const timer = setInterval(() => {
    step++
    const progress = step / steps
    let result = ''

    for (let i = 0; i < len; i++) {
      if (finalText[i] === ' ') {
        result += ' '
      } else if (i < len * progress) {
        // 已解码的字符
        result += finalText[i]
      } else {
        // 还在乱码的字符
        result += glitchChars[Math.floor(Math.random() * glitchChars.length)]
      }
    }

    el.textContent = result

    if (step >= steps) {
      clearInterval(timer)
      el.textContent = finalText
      el.classList.add('text-alive')
    }
  }, interval)
}

/**
 * 打字机效果，完成后文字持续辉光
 */
function typewriter(el, text, speed = 50, startDelay = 0) {
  el.textContent = ''
  el.style.visibility = 'visible'

  // 添加闪烁光标
  el.classList.add('typewriter-active')

  setTimeout(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i]
        i++
      } else {
        clearInterval(timer)
        // 光标闪烁一会后消失，切换为持续辉光动画
        setTimeout(() => {
          el.classList.remove('typewriter-active')
          el.classList.add('typewriter-done')
          el.classList.add('text-alive')
        }, 2000)
      }
    }, speed)
  }, startDelay)
}

/**
 * 逐字淡入动画，完成后每个字持续微弱浮动
 */
function fadeInByChar(el, text, delay = 30, startDelay = 0) {
  el.innerHTML = ''
  el.style.visibility = 'visible'

  const totalDuration = startDelay + text.length * delay + 500
  const chars = text.split('')
  chars.forEach((char, i) => {
    const span = document.createElement('span')
    span.textContent = char === ' ' ? '\u00A0' : char
    span.style.cssText = `
      opacity: 0;
      display: inline-block;
      animation: char-fade-in 0.5s ease forwards;
      animation-delay: ${startDelay + i * delay}ms;
    `
    el.appendChild(span)
  })

  // 入场动画结束后，给每个字加上持续浮动效果
  setTimeout(() => {
    const spans = el.querySelectorAll('span')
    spans.forEach((span, i) => {
      span.style.animation = `char-alive 3s ease-in-out ${(i * 0.15) % 3}s infinite`
      span.style.opacity = '1'
    })
  }, totalDuration)
}

function applyAnimations() {
  // 等待 DOM 渲染完成
  requestAnimationFrame(() => {
    setTimeout(() => {
      // 副标题 - 先解码再拆字做波浪
      const heroText = document.querySelector('.VPHero .text')
      if (heroText && !heroText.dataset.animated) {
        const originalText = heroText.textContent.trim()
        heroText.dataset.animated = 'true'

        // 解码动画
        scrambleDecode(heroText, originalText, 1500)

        // 解码完成后拆成逐字 span 做颜色波浪
        setTimeout(() => {
          const finalText = originalText
          heroText.innerHTML = ''
          finalText.split('').forEach((ch, i) => {
            const span = document.createElement('span')
            span.textContent = ch === ' ' ? '\u00A0' : ch
            span.className = 'char-wave'
            span.style.animationDelay = `${i * 0.07}s`
            heroText.appendChild(span)
          })
        }, 1700)
      }

      // Tagline - 打字机效果
      const tagline = document.querySelector('.VPHero .tagline')
      if (tagline && !tagline.dataset.animated) {
        const originalText = tagline.textContent.trim()
        tagline.dataset.animated = 'true'
        tagline.style.visibility = 'hidden'
        typewriter(tagline, originalText, 55, 800)
      }

      // AI 指标数字持续闪烁
      const metricValues = document.querySelectorAll('.ai-metric-value')
      metricValues.forEach(el => {
        if (!el.dataset.animated) {
          el.dataset.animated = 'true'
        }
      })
    }, 200)
  })
}

onMounted(() => {
  // 只在首页应用
  if (route.path === '/' || route.path === '/index.html') {
    applyAnimations()
  }

  // 监听路由变化（SPA 导航）
  observer = new MutationObserver(() => {
    if (route.path === '/' || route.path === '/index.html') {
      const heroText = document.querySelector('.VPHero .text')
      if (heroText && !heroText.dataset.animated) {
        applyAnimations()
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>
