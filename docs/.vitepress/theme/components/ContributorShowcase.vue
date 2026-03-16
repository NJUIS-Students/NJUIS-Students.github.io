<template>
  <section class="contributor-showcase">
    <div class="contributor-showcase__grid">
      <article
        v-for="item in items"
        :key="item.name"
        class="contributor-card"
        :style="cardStyle(item)"
      >
        <div class="contributor-card__avatar-wrap">
          <img
            v-if="item.avatar"
            class="contributor-card__avatar"
            :src="item.avatar"
            :alt="`${item.name} avatar`"
          >
          <div v-else class="contributor-card__avatar contributor-card__avatar--fallback">
            <span>{{ displayInitials(item) }}</span>
          </div>
        </div>

        <div class="contributor-card__content">
          <h3 class="contributor-card__name">{{ item.name }}</h3>
          <p v-if="item.intro" class="contributor-card__intro">{{ item.intro }}</p>
          <div v-else class="contributor-card__intro-spacer" aria-hidden="true" />

          <ul v-if="item.tags?.length" class="contributor-card__tags" aria-label="贡献标签">
            <li
              v-for="tag in item.tags"
              :key="tag"
              class="contributor-card__tag"
              :style="tagStyle(tag)"
            >
              {{ tag }}
            </li>
          </ul>

          <div v-if="item.links?.length" class="contributor-card__links" aria-label="个人链接">
            <component
              :is="linkTag(link)"
              v-for="link in item.links"
              :key="`${item.name}-${link.label}`"
              class="contributor-card__link"
              :href="link.href || undefined"
              :type="link.value && !link.href ? 'button' : undefined"
              :target="isExternal(link.href) ? '_blank' : undefined"
              :rel="isExternal(link.href) ? 'noreferrer' : undefined"
              :aria-label="linkAriaLabel(link)"
              :title="linkTitle(link)"
              @click="handleLinkClick(item, link)"
            >
              <img
                v-if="link.icon"
                class="contributor-card__link-image"
                :src="link.icon"
                :alt="link.label"
              >
              <svg
                v-else
                class="contributor-card__link-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <template v-if="iconKind(link.type, link.href) === 'globe'">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3c3 3.6 3 14.4 0 18" />
                  <path d="M12 3c-3 3.6-3 14.4 0 18" />
                </template>
                <template v-else-if="iconKind(link.type, link.href) === 'code'">
                  <path d="M8 8 4 12l4 4" />
                  <path d="m16 8 4 4-4 4" />
                  <path d="m14 4-4 16" />
                </template>
                <template v-else-if="iconKind(link.type, link.href) === 'message'">
                  <path d="M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                </template>
                <template v-else-if="iconKind(link.type, link.href) === 'x'">
                  <path d="M5 5l14 14" />
                  <path d="M19 5 5 19" />
                </template>
                <template v-else-if="iconKind(link.type, link.href) === 'mail'">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="m4 8 8 6 8-6" />
                </template>
                <template v-else>
                  <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.7 5.22" />
                  <path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12a5 5 0 0 0 7.07 7.07l1.41-1.41" />
                </template>
              </svg>
              <span
                class="contributor-card__copy-pop"
                :class="{ 'is-visible': Boolean(copyNotice(item, link)) }"
                role="status"
                aria-live="polite"
              >
                {{ copyNotice(item, link) || '\u00A0' }}
              </span>
            </component>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

type ContributorLink = {
  label: string
  href?: string
  value?: string
  type?: string
  icon?: string
}

type ContributorItem = {
  name: string
  avatar?: string
  initials?: string
  intro?: string
  tags?: string[]
  links?: ContributorLink[]
  accent?: string
  accentSoft?: string
}

const { items } = defineProps<{
  items: ContributorItem[]
}>()

const copyNoticeByLink = ref<Record<string, string>>({})
const copyNoticeTimers = new Map<string, ReturnType<typeof setTimeout>>()

function cardStyle(item: ContributorItem) {
  return {
    '--card-accent': item.accent || '#0f766e',
    '--card-accent-soft': item.accentSoft || 'rgba(15, 118, 110, 0.16)'
  }
}

function displayInitials(item: ContributorItem) {
  if (item.initials) return item.initials

  const cleaned = item.name.trim()
  if (!cleaned) return '??'

  if (/[\u4e00-\u9fa5]/.test(cleaned)) {
    return cleaned.replace(/\s+/g, '').slice(0, 2)
  }

  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
}

function isExternal(href?: string) {
  return Boolean(href && /^(https?:)?\/\//.test(href))
}

function linkTag(link: ContributorLink) {
  if (link.href) return 'a'
  if (link.value) return 'button'
  return 'span'
}

function linkTitle(link: ContributorLink) {
  if (link.value && !link.href) {
    return `${link.label}: ${link.value}（点击复制）`
  }
  return link.label
}

function linkAriaLabel(link: ContributorLink) {
  if (link.value && !link.href) {
    return `${link.label}，点击复制账号`
  }
  return link.label
}

async function copyText(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }

  if (typeof document === 'undefined') return false
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

function copiedTargetLabel(link: ContributorLink) {
  const normalizedType = (link.type || '').toLowerCase()
  const normalizedLabel = link.label.toLowerCase()
  if (normalizedType.includes('qq') || normalizedLabel.includes('qq')) return 'QQ号'
  if (/(wechat|weixin)/.test(normalizedType) || link.label.includes('微信')) return '微信号'
  return link.label
}

function copyNoticeKey(item: ContributorItem, link: ContributorLink) {
  return `${item.name}::${link.label}::${link.value || ''}`
}

function copyNotice(item: ContributorItem, link: ContributorLink) {
  return copyNoticeByLink.value[copyNoticeKey(item, link)] || ''
}

function showCopyNotice(item: ContributorItem, link: ContributorLink, message: string) {
  const key = copyNoticeKey(item, link)
  copyNoticeByLink.value = {
    ...copyNoticeByLink.value,
    [key]: message
  }

  const existingTimer = copyNoticeTimers.get(key)
  if (existingTimer) clearTimeout(existingTimer)

  const timer = setTimeout(() => {
    const next = { ...copyNoticeByLink.value }
    delete next[key]
    copyNoticeByLink.value = next
    copyNoticeTimers.delete(key)
  }, 1200)

  copyNoticeTimers.set(key, timer)
}

async function handleLinkClick(item: ContributorItem, link: ContributorLink) {
  if (!link.value || link.href) return

  try {
    const copied = await copyText(link.value)
    if (copied) {
      showCopyNotice(item, link, `已复制${copiedTargetLabel(link)}`)
      return
    }
  } catch {
    // Ignore and show fallback message below.
  }

  showCopyNotice(item, link, '复制失败')
}

onBeforeUnmount(() => {
  copyNoticeTimers.forEach((timer) => clearTimeout(timer))
  copyNoticeTimers.clear()
})

function tagUnits(tag: string) {
  return Array.from(tag).reduce((total, ch) => {
    if (/\s/.test(ch)) return total + 0.35
    if (/[\u4e00-\u9fa5]/.test(ch)) return total + 1
    if (/[A-Z]/.test(ch)) return total + 0.72
    if (/[a-z0-9]/.test(ch)) return total + 0.62
    return total + 0.75
  }, 0)
}

function tagStyle(tag: string) {
  const units = Math.max(2, Math.ceil(tagUnits(tag) * 100) / 100)
  return {
    '--tag-units': String(units)
  }
}

function iconKind(type?: string, href?: string) {
  const normalizedType = (type || '').toLowerCase()
  const normalizedHref = (href || '').toLowerCase()

  if (/(home|site|blog|page|web|globe)/.test(normalizedType)) return 'globe'
  if (/(github|gitlab|code)/.test(normalizedType) || normalizedHref.includes('github.com')) return 'code'
  if (/(wechat|weixin|qq|contact|message|chat)/.test(normalizedType)) return 'message'
  if (/(mail|email)/.test(normalizedType) || normalizedHref.startsWith('mailto:')) return 'mail'
  if (normalizedType === 'x' || normalizedType === 'twitter' || normalizedHref.includes('x.com') || normalizedHref.includes('twitter.com')) return 'x'
  if (normalizedHref.startsWith('http://') || normalizedHref.startsWith('https://')) return 'globe'
  return 'link'
}
</script>

<style scoped>
.contributor-showcase {
  position: relative;
  margin: 2rem 0 1rem;
}

.contributor-showcase__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.contributor-card {
  --card-surface: rgba(251, 248, 242, 0.92);
  --card-surface-strong: rgba(255, 255, 255, 0.86);
  --card-border: rgba(15, 23, 42, 0.1);
  --card-text: #18212f;
  --card-muted: rgba(24, 33, 47, 0.72);
  --card-subtle: rgba(24, 33, 47, 0.4);
  --card-tag-bg: rgba(255, 255, 255, 0.72);
  --card-link-bg: rgba(255, 255, 255, 0.78);
  --card-shadow: 0 22px 56px -36px rgba(15, 23, 42, 0.3);

  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 232px;
  padding: 1.24rem 1rem 0.62rem;
  border: 1px solid var(--card-border);
  border-radius: 24px;
  background:
    radial-gradient(circle at top center, color-mix(in srgb, var(--card-accent-soft) 78%, transparent), transparent 62%),
    linear-gradient(180deg, var(--card-surface-strong), var(--card-surface));
  box-shadow: var(--card-shadow);
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease;
}

.dark .contributor-card {
  --card-surface: rgba(8, 16, 34, 0.92);
  --card-surface-strong: rgba(11, 21, 42, 0.94);
  --card-border: rgba(148, 163, 184, 0.16);
  --card-text: rgba(241, 245, 249, 0.96);
  --card-muted: rgba(226, 232, 240, 0.78);
  --card-subtle: rgba(203, 213, 225, 0.42);
  --card-tag-bg: rgba(15, 23, 42, 0.48);
  --card-link-bg: rgba(15, 23, 42, 0.54);
  --card-shadow: 0 28px 80px -42px rgba(2, 6, 23, 0.92);
  background:
    radial-gradient(
      circle at top center,
      color-mix(in srgb, var(--card-accent-soft) 48%, transparent),
      transparent 64%
    ),
    linear-gradient(180deg, var(--card-surface-strong), var(--card-surface));
}

.contributor-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--card-accent) 36%, var(--card-border));
  box-shadow:
    var(--card-shadow),
    0 0 0 1px color-mix(in srgb, var(--card-accent) 14%, transparent);
}

.contributor-card__avatar-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 0 auto;
  padding: 0.28rem;
  animation: contributor-avatar-breathe 5.8s ease-in-out infinite;
}

.contributor-card__avatar-wrap::before {
  content: "";
  position: absolute;
  inset: -8px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--card-accent) 22%, rgba(255, 255, 255, 0.12)) 0%,
    transparent 68%
  );
  opacity: 0.18;
  filter: blur(10px);
  animation: contributor-avatar-aura 5.8s ease-in-out infinite;
  pointer-events: none;
}

.contributor-card__avatar {
  position: relative;
  z-index: 1;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  object-fit: cover;
  border: 0;
  box-shadow: 0 8px 18px -14px rgba(15, 23, 42, 0.22);
  animation: contributor-avatar-focus 5.8s ease-in-out infinite;
}

@keyframes contributor-avatar-breathe {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-3px) scale(1.03);
  }
}

@keyframes contributor-avatar-aura {
  0%, 100% {
    opacity: 0.16;
    transform: scale(0.96);
  }
  50% {
    opacity: 0.28;
    transform: scale(1.06);
  }
}

@keyframes contributor-avatar-focus {
  0%, 100% {
    box-shadow: 0 8px 18px -14px rgba(15, 23, 42, 0.22);
  }
  50% {
    box-shadow:
      0 14px 24px -18px rgba(15, 23, 42, 0.32),
      0 0 18px -12px color-mix(in srgb, var(--card-accent) 36%, transparent);
  }
}

.contributor-card__avatar--fallback {
  display: grid;
  place-items: center;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--card-accent) 78%, white), color-mix(in srgb, var(--card-accent) 28%, #0f172a));
  color: white;
  font-family: "Avenir Next", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.contributor-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 0.88rem;
}

.contributor-card__name {
  margin: 0;
  color: var(--card-text);
  font-family: "Avenir Next", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.2;
}

.contributor-card__intro {
  width: 100%;
  margin: 0.52rem 0 0;
  min-height: 1.28rem;
  color: var(--card-muted);
  font-size: 0.81rem;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contributor-card__intro-spacer {
  min-height: 0.2rem;
}

.contributor-card__tags,
.contributor-card__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  margin: 0;
  padding: 0;
}

.contributor-card__tags {
  list-style: none;
  margin-top: 0.26rem;
  padding-top: 0.4rem;
  align-items: center;
}

.contributor-card__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: calc(var(--tag-units, 2) * 1em + 1.56rem);
  height: 1.86rem;
  margin: 0 !important;
  padding: 0 0.72rem;
  border: 1px solid color-mix(in srgb, var(--card-accent) 20%, transparent);
  border-radius: 999px;
  background: var(--card-tag-bg);
  color: var(--card-text);
  font-size: 0.78rem;
  line-height: 1;
  white-space: nowrap;
  box-sizing: border-box;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.contributor-card__tag + .contributor-card__tag {
  margin-top: 0 !important;
}

.contributor-card__links {
  flex-wrap: nowrap;
  gap: 0.56rem;
  padding-top: 0.42rem;
}

.contributor-card__link {
  position: relative;
  display: grid;
  place-items: center;
  align-items: center;
  width: 1.9rem;
  height: 1.8rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--card-muted);
  text-decoration: none;
  transition:
    transform 180ms ease,
    color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;
}

.contributor-card__copy-pop {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.34rem);
  transform: translateX(-50%) translateY(0.24rem);
  padding: 0.28rem 0.44rem;
  border: 1px solid rgba(148, 163, 184, 0.34);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.74);
  color: rgba(248, 250, 252, 0.95);
  font-size: 0.62rem;
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 140ms ease, transform 140ms ease;
  z-index: 4;
  backdrop-filter: blur(5px);
}

.contributor-card__copy-pop.is-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.contributor-card__link:hover {
  transform: translateY(-1px);
  color: var(--card-accent);
  background: color-mix(in srgb, var(--card-accent) 12%, transparent);
  box-shadow: 0 8px 18px -14px color-mix(in srgb, var(--card-accent) 70%, transparent);
}

.contributor-card__link-icon {
  flex: none;
  width: 1.12rem;
  height: 1.12rem;
}

.contributor-card__link-image {
  display: block;
  width: 1.12rem;
  height: 1.12rem;
  object-fit: contain;
}

.dark .contributor-card__avatar-wrap::before {
  opacity: 0.1;
}

.dark .contributor-card__avatar {
  box-shadow: 0 10px 18px -14px rgba(2, 6, 23, 0.34);
}

@media (max-width: 1100px) {
  .contributor-showcase__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .contributor-showcase__grid {
    grid-template-columns: 1fr;
  }

  .contributor-card {
    min-height: 0;
    padding: 1.02rem 0.9rem 0.64rem;
    border-radius: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contributor-card,
  .contributor-card__link,
  .contributor-card__avatar-wrap,
  .contributor-card__avatar,
  .contributor-card__avatar-wrap::before {
    transition: none;
    animation: none;
  }
}
</style>
