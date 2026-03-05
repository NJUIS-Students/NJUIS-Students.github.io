<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <AIQuote />
    </template>
    <template #home-hero-before>
      <NeuralBackground />
      <TextAnimations />
    </template>
    <template #home-features-after>
      <TechShowcase />
    </template>
    <template #layout-bottom>
      <CoursePageAutoTemplate />
    </template>
    <template #doc-after>
      <Giscus />
    </template>
  </DefaultTheme.Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import AIQuote from './components/AIQuote.vue'
import NeuralBackground from './components/NeuralBackground.vue'
import TextAnimations from './components/TextAnimations.vue'
import TechShowcase from './components/TechShowcase.vue'
import CoursePageAutoTemplate from './components/CoursePageAutoTemplate.vue'
import Giscus from './components/Giscus.vue'
</script>
