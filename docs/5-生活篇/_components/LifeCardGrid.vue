<template>
  <div class="life-card-wrap" :class="toneClass">
  <div v-if="hasFilters" class="life-filters" aria-label="生活篇筛选">
    <div
      v-for="filter in normalizedFilters"
      :key="filter.key"
      class="filter-section"
      :class="filter.type === 'range' ? 'range-section' : 'choice-section'"
    >
      <div class="filter-section-header">
        <span class="filter-label">{{ filter.label }}</span>
        <span v-if="filter.type === 'range'" class="range-current">
          {{ formatRangeValue(filter, getRangeValue(filter).min) }}
          <span class="range-current__dash">—</span>
          {{ formatRangeValue(filter, getRangeValue(filter).max) }}
        </span>
      </div>

      <div v-if="filter.type === 'range'" class="life-filter-range">
        <div class="range-control">
          <div
            class="life-range-slider"
            :style="rangeSliderStyle(filter)"
          >
            <div class="life-range-slider__track">
              <div class="life-range-slider__progress"></div>
            </div>
            <input
              class="life-range-slider__input life-range-slider__input--min"
              type="range"
              :min="filter.min"
              :max="filter.max"
              :step="filter.step"
              :value="getRangeValue(filter).min"
              :aria-label="`${filter.label}最低值`"
              @input="setRangeMin(filter, $event.target.value)"
            >
            <input
              class="life-range-slider__input life-range-slider__input--max"
              type="range"
              :min="filter.min"
              :max="filter.max"
              :step="filter.step"
              :value="getRangeValue(filter).max"
              :aria-label="`${filter.label}最高值`"
              @input="setRangeMax(filter, $event.target.value)"
            >
          </div>
        </div>

        <div class="range-number-row">
          <label class="range-number-field">
            <span>最低价</span>
            <input
              type="number"
              :min="filter.min"
              :max="filter.max"
              :step="filter.step"
              :value="getRangeValue(filter).min"
              @input="setRangeMin(filter, $event.target.value)"
            >
          </label>
          <label class="range-number-field">
            <span>最高价</span>
            <input
              type="number"
              :min="filter.min"
              :max="filter.max"
              :step="filter.step"
              :value="getRangeValue(filter).max"
              @input="setRangeMax(filter, $event.target.value)"
            >
          </label>
          <span v-if="filter.maxLabel" class="range-help">
            {{ formatRangeValue(filter, filter.max) }} 表示及以上
          </span>
        </div>
      </div>

      <div v-else class="filter-chip-row">
        <button
          type="button"
          class="filter-chip"
          :class="{ 'is-active': !selectedFilters[filter.key] }"
          @click="setFilter(filter.key, '')"
        >
          全部
        </button>
        <button
          v-for="option in filter.options"
          :key="`${filter.key}-${option}`"
          type="button"
          class="filter-chip"
          :class="{ 'is-active': selectedFilters[filter.key] === option }"
          @click="setFilter(filter.key, option)"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <div class="filter-footer">
      <span>当前显示 {{ filteredItems.length }} / {{ safeItems.length }} 条</span>
      <button type="button" class="filter-clear" @click="clearFilters">
        清空筛选
      </button>
    </div>
  </div>

  <p v-if="!filteredItems.length" class="life-card-empty">
    暂无符合条件的条目。
  </p>

  <div v-else class="life-card-grid">
    <details
      v-for="(item, index) in filteredItems"
      :key="item.id || `${itemTitle(item)}-${index}`"
      class="life-card"
    >
      <summary class="life-card__summary">
        <div class="life-card__cover">
          <img
            v-if="getCover(item)"
            :src="getCover(item)"
            :alt="itemTitle(item)"
            loading="lazy"
          >
          <span v-else>暂无图片</span>
        </div>

        <div class="life-card__main">
          <p v-if="cleanText(item.category)" class="life-card__category">
            {{ item.category }}
          </p>
          <h2 class="life-card__title">{{ itemTitle(item) }}</h2>

          <dl class="life-card__meta">
            <div v-if="cleanText(item.location)">
              <dt>位置</dt>
              <dd>{{ item.location }}</dd>
            </div>
            <div v-if="cleanText(item.price)">
              <dt>价格</dt>
              <dd>{{ item.price }}</dd>
            </div>
          </dl>

          <p v-if="cleanText(item.summary)" class="life-card__summary-text">
            {{ item.summary }}
          </p>

          <ul v-if="getTags(item).length" class="life-card__tags">
            <li v-for="tag in getTags(item)" :key="tag">{{ tag }}</li>
          </ul>
        </div>

        <span class="life-card__toggle">展开</span>
      </summary>

      <div class="life-card__details">
        <dl v-if="getFields(item).length" class="life-card__fields">
          <div v-for="field in getFields(item)" :key="field.label || field.value">
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value }}</dd>
          </div>
        </dl>

        <p v-if="cleanText(item.updated)" class="life-card__updated">
          信息更新时间：{{ item.updated }}
        </p>

        <div v-if="getImages(item).length" class="life-card__gallery">
          <img
            v-for="image in getImages(item)"
            :key="image"
            :src="image"
            :alt="itemTitle(item)"
            loading="lazy"
          >
        </div>
      </div>
    </details>
  </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Array,
    default: () => []
  },
  tone: {
    type: String,
    default: 'default'
  }
})

const imageModules = import.meta.glob('../_assets/**/*.{webp,jpg,jpeg,png}', {
  query: '?url',
  import: 'default'
})

const imageLoaders = Object.fromEntries(
  Object.entries(imageModules).map(([path, loader]) => [
    path.replace('../_assets/', ''),
    loader
  ])
)

const safeItems = computed(() => (Array.isArray(props.items) ? props.items : []))
const selectedFilters = reactive({})
const selectedRanges = reactive({})
const loadedImages = ref({})
const toneClass = computed(() => (cleanText(props.tone) === 'drink' ? 'is-drink' : ''))

function cleanText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function uniqueValues(values) {
  return Array.from(new Set(values.map((value) => cleanText(value)).filter(Boolean)))
}

function toNumber(value, fallback) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function toFilterNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

const normalizedFilters = computed(() => {
  if (!Array.isArray(props.filters)) return []

  return props.filters
    .map((filter) => {
      const key = cleanText(filter?.key)
      if (!key) return null

      const type = cleanText(filter?.type) === 'range' ? 'range' : 'choice'

      if (type === 'range') {
        const min = toNumber(filter?.min, 0)
        const max = toNumber(filter?.max, 100)
        const normalizedMin = Math.min(min, max)
        const normalizedMax = Math.max(min, max)
        const step = Math.max(toNumber(filter?.step, 1), 1)

        return {
          type,
          key,
          label: cleanText(filter?.label) || key,
          min: normalizedMin,
          max: normalizedMax,
          step,
          unit: cleanText(filter?.unit),
          maxLabel: cleanText(filter?.maxLabel)
        }
      }

      const configuredOptions = Array.isArray(filter?.options) ? filter.options : []
      const autoOptions = filter?.auto
        ? safeItems.value.map((item) => item?.[key])
        : []

      return {
        type,
        key,
        label: cleanText(filter?.label) || key,
        options: uniqueValues([...configuredOptions, ...autoOptions])
      }
    })
    .filter((filter) => filter && (filter.type === 'range' || filter.options.length))
})

const hasFilters = computed(() => normalizedFilters.value.length > 0)

const filteredItems = computed(() => {
  if (!hasFilters.value) return safeItems.value

  return safeItems.value.filter((item) =>
    normalizedFilters.value.every((filter) => {
      if (filter.type === 'range') {
        const range = getRangeValue(filter)
        const isRangeActive = range.min !== filter.min || range.max !== filter.max
        if (!isRangeActive) return true

        const value = toFilterNumber(item?.[filter.key])
        if (value === null) return false

        const effectiveMax = range.max === filter.max ? Infinity : range.max
        return value >= range.min && value <= effectiveMax
      }

      const selectedValue = selectedFilters[filter.key]
      if (!selectedValue) return true
      return cleanText(item?.[filter.key]) === selectedValue
    })
  )
})

const referencedImageKeys = computed(() => {
  const keys = []

  safeItems.value.forEach((item) => {
    const cover = cleanText(item?.cover)
    if (cover) keys.push(cover)

    if (Array.isArray(item?.images)) {
      item.images.forEach((image) => {
        const key = cleanText(image)
        if (key) keys.push(key)
      })
    }
  })

  return uniqueValues(keys)
})

watchEffect(() => {
  normalizedFilters.value.forEach((filter) => {
    if (filter.type !== 'range') return

    const current = selectedRanges[filter.key]
    if (!current) {
      selectedRanges[filter.key] = {
        min: filter.min,
        max: filter.max
      }
      return
    }

    const min = clamp(toNumber(current.min, filter.min), filter.min, filter.max)
    const max = clamp(toNumber(current.max, filter.max), filter.min, filter.max)
    const nextRange = {
      min: Math.min(min, max),
      max: Math.max(min, max)
    }

    if (current.min !== nextRange.min || current.max !== nextRange.max) {
      selectedRanges[filter.key] = nextRange
    }
  })
})

watchEffect(() => {
  referencedImageKeys.value.forEach((key) => {
    if (loadedImages.value[key] || !imageLoaders[key]) return

    imageLoaders[key]()
      .then((url) => {
        loadedImages.value = {
          ...loadedImages.value,
          [key]: url
        }
      })
      .catch(() => {})
  })
})

function setFilter(key, value) {
  if (!value) {
    delete selectedFilters[key]
    return
  }

  selectedFilters[key] = value
}

function getRangeValue(filter) {
  return selectedRanges[filter.key] || {
    min: filter.min,
    max: filter.max
  }
}

function setRangeMin(filter, value) {
  const current = getRangeValue(filter)
  const nextMin = clamp(toNumber(value, current.min), filter.min, filter.max)

  selectedRanges[filter.key] = {
    min: Math.min(nextMin, current.max),
    max: current.max
  }
}

function setRangeMax(filter, value) {
  const current = getRangeValue(filter)
  const nextMax = clamp(toNumber(value, current.max), filter.min, filter.max)

  selectedRanges[filter.key] = {
    min: current.min,
    max: Math.max(nextMax, current.min)
  }
}

function formatRangeValue(filter, value) {
  const displayValue = value === filter.max && filter.maxLabel ? filter.maxLabel : String(value)
  return filter.unit ? `${filter.unit}${displayValue}` : displayValue
}

function getRangePercent(value, filter) {
  const span = filter.max - filter.min || 1
  return ((value - filter.min) / span) * 100
}

function rangeSliderStyle(filter) {
  const range = getRangeValue(filter)

  return {
    '--min-percent': String(getRangePercent(range.min, filter)),
    '--max-percent': String(getRangePercent(range.max, filter))
  }
}

function clearFilters() {
  Object.keys(selectedFilters).forEach((key) => {
    delete selectedFilters[key]
  })

  normalizedFilters.value.forEach((filter) => {
    if (filter.type !== 'range') return
    selectedRanges[filter.key] = {
      min: filter.min,
      max: filter.max
    }
  })
}

function itemTitle(item) {
  return cleanText(item?.name) || cleanText(item?.location) || 'TODO：名称待补充'
}

function getTags(item) {
  return Array.isArray(item?.tags)
    ? item.tags.map((tag) => cleanText(tag)).filter(Boolean)
    : []
}

function getFields(item) {
  if (!Array.isArray(item?.fields)) return []

  return item.fields
    .map((field) => ({
      label: cleanText(field?.label),
      value: cleanText(field?.value)
    }))
    .filter((field) => field.label || field.value)
}

function resolveImage(key) {
  const normalized = cleanText(key)
  return normalized && loadedImages.value[normalized] ? loadedImages.value[normalized] : ''
}

function getCover(item) {
  return resolveImage(item?.cover)
}

function getImages(item) {
  return Array.isArray(item?.images)
    ? item.images.map((image) => resolveImage(image)).filter(Boolean)
    : []
}
</script>

<style scoped>
.life-card-wrap {
  --life-accent: var(--vp-c-brand-1);
  --life-accent-soft: var(--vp-c-brand-soft);
}

.life-card-wrap.is-drink {
  --life-accent: #b7791f;
  --life-accent-soft: rgba(183, 121, 31, 0.14);
}

.life-filters {
  margin: 24px 0;
  padding: 20px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-section + .filter-section {
  margin-top: 20px;
}

.filter-section-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-label {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.range-current {
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 600;
}

.range-current__dash {
  color: var(--vp-c-text-3);
  margin: 0 0.18rem;
}

.life-filter-range {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.range-control {
  width: 100%;
  max-width: 760px;
}

.life-range-slider {
  --thumb-size: 18px;
  --min-percent: 0;
  --max-percent: 100;
  position: relative;
  height: 36px;
}

.life-range-slider__track {
  position: absolute;
  left: calc(var(--thumb-size) / 2);
  right: calc(var(--thumb-size) / 2);
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: var(--vp-c-divider);
}

.life-range-slider__progress {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--min-percent) * 1%);
  right: calc((100 - var(--max-percent)) * 1%);
  border-radius: 999px;
  background: var(--life-accent);
}

.life-range-slider__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 36px;
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.life-range-slider__input--min {
  z-index: 2;
}

.life-range-slider__input--max {
  z-index: 3;
}

.life-range-slider__input::-webkit-slider-thumb {
  width: var(--thumb-size);
  height: var(--thumb-size);
  appearance: none;
  border: 2px solid var(--life-accent);
  border-radius: 50%;
  background: var(--vp-c-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
  cursor: pointer;
  pointer-events: auto;
}

.life-range-slider__input::-moz-range-thumb {
  width: calc(var(--thumb-size) - 2px);
  height: calc(var(--thumb-size) - 2px);
  border: 2px solid var(--life-accent);
  border-radius: 50%;
  background: var(--vp-c-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
  cursor: pointer;
  pointer-events: auto;
}

.life-range-slider__input::-webkit-slider-runnable-track {
  height: 36px;
  background: transparent;
}

.life-range-slider__input::-moz-range-track {
  height: 36px;
  background: transparent;
}

.range-number-row {
  display: flex;
  align-items: end;
  gap: 16px;
  flex-wrap: wrap;
}

.range-number-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.range-number-field input {
  width: 120px;
  max-width: 140px;
  height: 36px;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 0.95rem;
}

.range-number-field input:focus {
  border-color: var(--life-accent);
  outline: none;
}

.range-help {
  padding-bottom: 8px;
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}

.filter-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
}

.filter-chip,
.filter-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font: inherit;
  line-height: 1;
  transition: border-color 0.16s ease, color 0.16s ease, background-color 0.16s ease;
}

.filter-chip {
  padding: 6px 14px;
  font-size: 0.9rem;
}

.filter-chip:hover,
.filter-clear:hover {
  border-color: var(--life-accent);
  color: var(--life-accent);
}

.filter-chip.is-active {
  border-color: var(--life-accent);
  background: var(--life-accent-soft);
  color: var(--life-accent);
  font-weight: 650;
}

.filter-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-footer span {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.filter-clear {
  padding: 7px 14px;
  font-size: 0.88rem;
}

.life-card-empty {
  margin: 1.5rem 0 2rem;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.2rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.life-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0 2rem;
}

.life-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.life-card[open] {
  border-color: color-mix(in srgb, var(--life-accent) 42%, var(--vp-c-divider));
}

.life-card__summary {
  display: grid;
  grid-template-columns: minmax(0, 116px) minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  cursor: pointer;
  list-style: none;
}

.life-card__summary::-webkit-details-marker {
  display: none;
}

.life-card__cover {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
  overflow: hidden;
}

.life-card__cover img,
.life-card__gallery img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.life-card__main {
  min-width: 0;
}

.life-card__category {
  margin: 0 0 0.25rem;
  color: var(--life-accent);
  font-size: 0.82rem;
  font-weight: 600;
}

.life-card__title {
  margin: 0;
  border: 0;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 1.18rem;
  line-height: 1.35;
}

.life-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 0.9rem;
  margin: 0.65rem 0 0;
}

.life-card__meta div {
  min-width: 0;
}

.life-card__meta dt {
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}

.life-card__meta dd {
  margin: 0.08rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.life-card__summary-text {
  margin: 0.7rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
  line-height: 1.65;
}

.life-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
}

.life-card__tags li {
  margin: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  font-size: 0.78rem;
}

.life-card__toggle {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
  white-space: nowrap;
}

.life-card[open] .life-card__toggle {
  color: var(--life-accent);
}

.life-card__details {
  border-top: 1px solid var(--vp-c-divider);
  padding: 1rem;
}

.life-card__fields {
  display: grid;
  gap: 0.75rem;
  margin: 0;
}

.life-card__fields div {
  display: grid;
  gap: 0.18rem;
}

.life-card__fields dt {
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.life-card__fields dd {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.68;
}

.life-card__updated {
  margin: 1rem 0 0;
  color: var(--vp-c-text-3);
  font-size: 0.86rem;
}

.life-card__gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.life-card__gallery img {
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  background: var(--vp-c-bg);
}

@media (max-width: 640px) {
  .life-filters {
    padding: 16px;
  }

  .range-control {
    max-width: none;
  }

  .range-number-row {
    align-items: stretch;
  }

  .range-number-field {
    flex: 1 1 120px;
  }

  .range-number-field input {
    width: 100%;
  }

  .filter-footer {
    align-items: stretch;
  }

  .filter-clear {
    width: 100%;
  }

  .life-card__summary {
    grid-template-columns: 1fr;
  }

  .life-card__toggle {
    justify-self: start;
  }
}
</style>
