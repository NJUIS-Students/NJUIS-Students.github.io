<script setup>
import { onMounted, watch } from 'vue'
import { useRoute, useData } from 'vitepress'

const route = useRoute()
const { frontmatter, isDark } = useData()

function loadGiscus() {
  // 通过 frontmatter comment: false 可以在单页面禁用评论
  if (frontmatter.value.comment === false) return

  const container = document.getElementById('giscus-container')
  if (!container) return
  container.innerHTML = ''

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'

  // ─── 仓库信息（repo-id 已自动获取，category-id 需你填写）───
  script.setAttribute('data-repo', 'NJUIS-Students/NJUIS-Students.github.io')
  script.setAttribute('data-repo-id', 'R_kgDOQ_A7LA')
  script.setAttribute('data-category', 'General')
  script.setAttribute('data-category-id', 'DIC_kwDOQ_A7LM4C3vRJ') // 👈 安装 giscus App 后从 giscus.app 获取
  // ─────────────────────────────────────────────────────────────

  script.setAttribute('data-mapping', 'pathname')
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'top')
  script.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('loading', 'lazy')
  script.crossOrigin = 'anonymous'
  script.async = true

  container.appendChild(script)
}

function updateTheme() {
  const iframe = document.querySelector('iframe.giscus-frame')
  if (!iframe) return
  iframe.contentWindow?.postMessage(
    { giscus: { setConfig: { theme: isDark.value ? 'dark' : 'light' } } },
    'https://giscus.app'
  )
}

onMounted(loadGiscus)

// 切换页面时重新加载评论
watch(() => route.path, () => setTimeout(loadGiscus, 300))

// 切换深色/浅色模式时更新主题（无需重载）
watch(isDark, updateTheme)
</script>

<template>
  <div id="giscus-container" class="giscus-wrapper" />
</template>

<style scoped>
.giscus-wrapper {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}
</style>
