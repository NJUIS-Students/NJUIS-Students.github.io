<template>
  <div class="course-auto-template" aria-hidden="true"></div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

const PANEL_TITLE_KEYS = new Set([
  '课程定位评价',
  '难度评价',
  '作业反馈',
  'Lab 反馈',
  '考试情报',
  '高分策略',
  '学习建议',
  '项目经验',
  '项目反馈',
  '上机考核反馈',
  '课程项目反馈',
  '期末项目反馈',
  '拿高分策略',
  '建议'
])

function decodePath(path: string): string {
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

function isCourseGuidePath(path: string): boolean {
  const decoded = decodePath(path)
  return decoded.includes('/2-学习篇/2-课程攻略/')
}

function cleanText(text: string | null | undefined): string {
  return (text || '').replace(/\s+/g, ' ').trim()
}

function getSectionTag(path: string): string {
  const decoded = decodePath(path)
  const segments = decoded.split('/').filter(Boolean)
  const section = segments.find((part) => /^(1|2|3)-/.test(part) && part.includes('修')) || segments[2] || ''
  return section.replace(/^\d+-/, '') || '课程攻略'
}

function isMetaListNode(node: Element): boolean {
  if (node.tagName !== 'UL') return false
  const items = Array.from(node.querySelectorAll(':scope > li')).map((li) => cleanText(li.textContent))
  if (!items.length) return false
  const keys = ['课程类型', '学分', '考核方式']
  return keys.every((key) => items.some((item) => item.includes(key)))
}

type TextLine = {
  text: string
  inBlock: boolean
}

function collectTextLines(nodes: Element[]): TextLine[] {
  const lines: TextLine[] = []
  const seen = new Set<string>()

  const push = (text: string, inBlock: boolean) => {
    const value = cleanText(text)
    if (!value || seen.has(`${value}|${inBlock ? 1 : 0}`)) return
    seen.add(`${value}|${inBlock ? 1 : 0}`)
    lines.push({ text: value, inBlock })
  }

  for (const node of nodes) {
    const inBlock = Boolean(node.closest('.custom-block'))
    if (node.tagName === 'P' || node.tagName === 'LI') {
      push(node.textContent || '', inBlock)
    }

    for (const el of Array.from(node.querySelectorAll('p, li'))) {
      const childInBlock = Boolean((el as Element).closest('.custom-block'))
      push(el.textContent || '', childInBlock)
    }
  }

  return lines
}

function captureMetaValue(text: string, label: '课程类型' | '学分' | '考核方式'): string {
  const nextLabels = label === '课程类型' ? '(?=学分[：:]|考核方式[：:]|$)' : label === '学分' ? '(?=课程类型[：:]|考核方式[：:]|$)' : '$'
  const re = new RegExp(`${label}[：:]\\s*([\\s\\S]*?)${nextLabels}`)
  const match = text.match(re)
  if (!match) return ''
  return match[1].replace(/^[,，;；\\s]+|[,，;；\\s]+$/g, '').trim()
}

function extractMeta(nodes: Element[]): { type: string; credits: string; assessment: string } {
  const lines = collectTextLines(nodes).map((item) => item.text)
  let type = ''
  let credits = ''
  let assessment = ''

  for (const line of lines) {
    if (!type) type = captureMetaValue(line, '课程类型')
    if (!credits) credits = captureMetaValue(line, '学分')
    if (!assessment) assessment = captureMetaValue(line, '考核方式')
    if (type && credits && assessment) break
  }

  return {
    type: type || '待补充',
    credits: credits || '待补充',
    assessment: assessment || '待补充'
  }
}

function firstSentence(text: string): string {
  const value = cleanText(text)
  const match = value.match(/^(.+?[。！？!?；;])/)
  if (match) return match[1]
  if (value.length <= 80) return value
  return `${value.slice(0, 80)}…`
}

function extractSummary(nodes: Element[]): string {
  const lines = collectTextLines(nodes)

  const intro = lines.find((item) => /^课程介绍[：:]/.test(item.text))
  if (intro) return firstSentence(intro.text.replace(/^课程介绍[：:]/, '').trim())

  const preferred = lines.find(
    (item) =>
      !item.inBlock &&
      item.text.length > 20 &&
      !/^课程名称[：:]/.test(item.text) &&
      !/^课程画像[：:]?/.test(item.text) &&
      !/^课程类型[：:]/.test(item.text) &&
      !/^学分[：:]/.test(item.text) &&
      !/^考核方式[：:]/.test(item.text) &&
      !/^提示$/.test(item.text)
  )
  if (preferred) return firstSentence(preferred.text)

  const fallback = lines.find((item) => item.text.length > 20)
  if (fallback) return firstSentence(fallback.text)

  return '课程核心信息与学习经验如下。'
}

function normalizeRepoText(text: string): string {
  return cleanText(text).replace(/\s*[：:，,]?\s*repo\s*$/i, '').trim()
}

function extractRepo(nodes: Element[]): { url: string; text: string; consumedNodes: Set<Element> } {
  const consumedNodes = new Set<Element>()
  const indexedAnchors = nodes
    .map((node, index) => {
      const anchor = Array.from(node.querySelectorAll('a[href]')).find((a) =>
        Boolean((a as HTMLAnchorElement).href)
      ) as HTMLAnchorElement | undefined
      return { node, index, anchor }
    })
    .filter((item) => item.anchor)

  const first = indexedAnchors[0]
  if (!first || !first.anchor) {
    return { url: '', text: '课程资料入口', consumedNodes }
  }

  const sourceNode = first.node
  const sourceText = cleanText(sourceNode.textContent)
  let textCandidate = normalizeRepoText(sourceText)
  consumedNodes.add(sourceNode)

  // Handle markdown line-break style:
  // "课程资料库（...）：  " + next line "[repo](...)"
  if ((!textCandidate || /^repo$/i.test(textCandidate)) && first.index > 0) {
    const prevNode = nodes[first.index - 1]
    const prevText = cleanText(prevNode.textContent)
    if (
      prevText &&
      /(课程资料库|资料库|slides|课件|往年卷|复习资料)/i.test(prevText) &&
      /[：:]$/.test(prevText)
    ) {
      textCandidate = normalizeRepoText(prevText)
      consumedNodes.add(prevNode)
    }
  }

  if (!textCandidate || /^repo$/i.test(textCandidate)) {
    textCandidate =
      nodes
        .map((node) => cleanText(node.textContent))
        .map((line) => normalizeRepoText(line))
        .find((line) => line && (line.includes('课程资料库') || line.toLowerCase().includes('slides'))) ||
      '课程资料入口'
  }

  return {
    url: first.anchor.href || '',
    text: textCandidate,
    consumedNodes
  }
}

function shouldDropFromIntro(node: Element): boolean {
  const text = cleanText(node.textContent)
  if (!text) return true
  if (node.tagName === 'H2' && text.includes('基本信息')) return true
  if (isMetaListNode(node)) return true
  if (/^课程名称[：:]/.test(text)) return true
  if (/^课程画像[：:]?$/.test(text)) return true
  if (/^课程介绍[：:]/.test(text)) return true
  if (/^(课程类型|学分|考核方式)[：:]/.test(text)) return true
  return false
}

function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (className) el.className = className
  if (typeof text === 'string') el.textContent = text
  return el
}

function splitExperiencePanels(nodes: Element[]): Array<{ title: string; nodes: Element[] }> {
  const panels: Array<{ title: string; nodes: Element[] }> = []
  let current: { title: string; nodes: Element[] } | null = null

  const openPanel = (title: string) => {
    current = { title, nodes: [] }
    panels.push(current)
  }

  for (const node of nodes) {
    const nodeText = cleanText(node.textContent)

    if (/^H[3-6]$/.test(node.tagName)) {
      openPanel(nodeText || '经验分享')
      continue
    }

    if (node.tagName === 'P') {
      const solo = nodeText.match(/^([^：:]{2,24})[：:]$/)
      if (solo && PANEL_TITLE_KEYS.has(solo[1])) {
        openPanel(solo[1])
        continue
      }

      const inline = nodeText.match(/^([^：:]{2,24})[：:]\s*(.+)$/)
      if (inline && PANEL_TITLE_KEYS.has(inline[1])) {
        openPanel(inline[1])
        const p = createEl('p', 'course-card__text course-card__text--compact', inline[2])
        current?.nodes.push(p)
        continue
      }
    }

    if (!current) openPanel('经验分享')
    current.nodes.push(node)
  }

  if (!panels.length) {
    return [{ title: '经验分享', nodes }]
  }

  return panels
    .map((panel) => ({
      title: panel.title,
      nodes: panel.nodes.filter((node) => cleanText(node.textContent).length > 0)
    }))
    .filter((panel) => panel.nodes.length > 0)
}

function normalizeSectionLabel(label: string): string {
  return cleanText(label)
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim()
}

function isMaterialLabel(label: string): boolean {
  const normalized = normalizeSectionLabel(label)
  return /^(教材|参考资料|参考书|书目|推荐阅读|作业参考|课后作业参考|实验参考|实验项目参考|课程任务量参考|任务量参考|课程任务量|项目参考|课程项目参考)$/.test(normalized)
}

function formatMaterialHeading(label: string, suffix?: string): string {
  const base = cleanText(label).replace(/[：:]$/, '').trim()
  const extra = cleanText(suffix)
  if (extra && /^[（(].*[）)]$/.test(extra)) {
    return `${base} ${extra}`
  }
  return base
}

function decorateList(listEl: Element, depth = 0): void {
  listEl.classList.add(depth === 0 ? 'course-card__list' : 'course-card__sublist')
  const subLists = Array.from(listEl.querySelectorAll(':scope > li > ul, :scope > li > ol'))
  subLists.forEach((sub) => decorateList(sub, depth + 1))
}

function normalizeMaterialsNodes(nodes: Element[]): Element[] {
  const normalized: Element[] = []

  for (const node of nodes) {
    const text = cleanText(node.textContent)

    if (node.tagName === 'P') {
      const solo = text.match(/^([^：:]{1,48})[：:]$/)
      if (solo && isMaterialLabel(solo[1])) {
        normalized.push(createEl('p', 'course-card__subsection', formatMaterialHeading(solo[1])))
        continue
      }

      const inline = text.match(/^([^：:]{1,48})[：:]\s*(.+)$/)
      if (inline && isMaterialLabel(inline[1])) {
        const inlineTail = cleanText(inline[2])
        normalized.push(createEl('p', 'course-card__subsection', formatMaterialHeading(inline[1], inlineTail)))

        if (inlineTail && !/^[（(].*[）)]$/.test(inlineTail)) {
          const list = createEl('ul', 'course-card__list')
          const item = createEl('li')
          item.textContent = inlineTail
          list.appendChild(item)
          normalized.push(list)
        }
        continue
      }
    }

    if (node.tagName === 'UL' || node.tagName === 'OL') {
      decorateList(node, 0)
      normalized.push(node)
      continue
    }

    normalized.push(node)
  }

  return normalized
}

function getDocRoot(): HTMLElement | null {
  const docs = Array.from(document.querySelectorAll('.vp-doc')) as HTMLElement[]
  if (!docs.length) return null

  const best = docs.find((el) => el.querySelector('h1'))
  return best || docs[0]
}

function getMarkdownRoot(doc: HTMLElement): HTMLElement {
  const first = doc.firstElementChild as HTMLElement | null
  if (first && first.tagName === 'DIV') return first
  return doc
}

function applyCourseTemplate(): boolean {
  if (!isCourseGuidePath(route.path)) return true

  const doc = getDocRoot()
  if (!doc) return false

  const pathKey = decodePath(route.path)

  if (doc.dataset.courseTemplatePath === pathKey) return true

  // Already a hand-crafted component page (e.g. OSCourseCard)
  if (doc.querySelector('.course-card-page') && !doc.querySelector('.course-card-page--auto')) {
    doc.dataset.courseTemplatePath = pathKey
    return true
  }

  const markdownRoot = getMarkdownRoot(doc)
  const children = Array.from(markdownRoot.children) as Element[]
  const h1Index = children.findIndex((el) => el.tagName === 'H1')
  if (h1Index < 0) return false

  const materialsIndex = children.findIndex(
    (el) => el.tagName === 'H2' && cleanText(el.textContent).includes('课程资料区')
  )
  const experienceIndex = children.findIndex(
    (el) => el.tagName === 'H2' && cleanText(el.textContent).includes('经验分享区')
  )

  if (materialsIndex < 0 || experienceIndex < 0 || materialsIndex >= experienceIndex) return false

  const titleEl = children[h1Index] as HTMLHeadingElement
  const title = cleanText(titleEl.textContent)
  const sectionTag = getSectionTag(route.path)

  const introNodesRaw = children.slice(h1Index + 1, materialsIndex)
  const materialsNodes = children.slice(materialsIndex + 1, experienceIndex)
  const experienceNodes = children.slice(experienceIndex + 1)

  const meta = extractMeta(introNodesRaw)
  const summary = extractSummary(introNodesRaw)
  const repo = extractRepo(materialsNodes)
  const introNodes = introNodesRaw.filter((node) => !shouldDropFromIntro(node))
  const panels = splitExperiencePanels(experienceNodes)

  const page = createEl('div', 'course-card-page course-card-page--auto')
  page.setAttribute('data-course-path', pathKey)

  const hiddenAnchors = createEl('div', 'course-card__sr-anchor')
  hiddenAnchors.appendChild(titleEl)
  hiddenAnchors.appendChild(children[materialsIndex])
  hiddenAnchors.appendChild(children[experienceIndex])
  page.appendChild(hiddenAnchors)

  const primary = createEl('section', 'course-card course-card--primary')
  const primaryShell = createEl('div', 'course-card__shell')

  const metaRow = createEl('div', 'course-card__meta-row')
  metaRow.appendChild(createEl('span', 'course-card__pill', sectionTag))
  metaRow.appendChild(createEl('span', 'course-card__pill course-card__pill--soft', meta.type))
  primaryShell.appendChild(metaRow)

  primaryShell.appendChild(createEl('p', 'course-card__section-label', '基本信息'))
  primaryShell.appendChild(createEl('p', 'course-card__headline', title))
  primaryShell.appendChild(createEl('p', 'course-card__text', summary))

  const stats = createEl('ul', 'course-card__stats')
  const stat1 = createEl('li')
  stat1.appendChild(createEl('span', 'label', '课程类型'))
  stat1.appendChild(createEl('span', 'value', meta.type))

  const stat2 = createEl('li')
  stat2.appendChild(createEl('span', 'label', '学分'))
  stat2.appendChild(createEl('span', 'value', meta.credits))

  const stat3 = createEl('li', 'course-card__stats-item--wide')
  stat3.appendChild(createEl('span', 'label', '考核方式'))
  stat3.appendChild(createEl('span', 'value', meta.assessment))

  stats.append(stat1, stat2, stat3)
  primaryShell.appendChild(stats)

  if (introNodes.length) {
    const introBlock = createEl('div', 'course-card__content-block course-card__content-block--auto-intro')
    introNodes.forEach((node) => introBlock.appendChild(node))
    primaryShell.appendChild(introBlock)
  }

  primary.appendChild(primaryShell)
  page.appendChild(primary)

  const materials = createEl('section', 'course-card')
  const materialsShell = createEl('div', 'course-card__shell')
  materialsShell.appendChild(createEl('p', 'course-card__section-label', '课程资料区'))

  if (repo.url) {
    const row = createEl('div', 'course-card__resource-row')
    row.appendChild(createEl('p', 'course-card__resource-text', repo.text))

    const button = createEl('a', 'course-card__button course-card__button--repo', '打开 repo') as HTMLAnchorElement
    button.href = repo.url
    button.target = '_blank'
    button.rel = 'noreferrer'
    row.appendChild(button)
    materialsShell.appendChild(row)
  }

  const materialsBody = createEl('div', 'course-card__raw')
  const materialsBodyNodes = normalizeMaterialsNodes(
    materialsNodes
    .filter((node) => !repo.consumedNodes.has(node))
  )
  materialsBodyNodes.forEach((node) => materialsBody.appendChild(node))
  materialsShell.appendChild(materialsBody)
  materials.appendChild(materialsShell)
  page.appendChild(materials)

  const experience = createEl('section', 'course-card')
  const experienceShell = createEl('div', 'course-card__shell')
  experienceShell.appendChild(createEl('p', 'course-card__section-label', '经验分享区'))

  const grid = createEl('div', 'course-card__experience-grid')
  for (const panel of panels) {
    const article = createEl('article', 'course-card__panel')
    article.appendChild(createEl('p', 'course-card__subsection', panel.title))

    const panelBody = createEl('div', 'course-card__panel-body')
    panel.nodes.forEach((node) => panelBody.appendChild(node))
    article.appendChild(panelBody)
    grid.appendChild(article)
  }

  experienceShell.appendChild(grid)
  experience.appendChild(experienceShell)
  page.appendChild(experience)

  while (markdownRoot.firstChild) {
    markdownRoot.removeChild(markdownRoot.firstChild)
  }
  markdownRoot.appendChild(page)
  doc.classList.add('course-auto-templated')
  doc.dataset.courseTemplatePath = pathKey
  return true
}

function run() {
  const doc = getDocRoot()
  if (doc && !isCourseGuidePath(route.path)) {
    delete doc.dataset.courseTemplatePath
  }

  const delays = [0, 50, 140, 320, 560]
  let attemptIndex = 0

  const attempt = () => {
    const done = applyCourseTemplate()
    if (done) return
    if (attemptIndex >= delays.length - 1) return
    attemptIndex += 1
    window.setTimeout(attempt, delays[attemptIndex])
  }

  nextTick(() => attempt())
}

onMounted(run)
watch(
  () => route.path,
  () => run()
)
</script>
