<template>
  <DefaultTheme.Layout>
    <template #home-hero-before>
      <NeuralBackground />
      <TextAnimations />
    </template>
    <template #home-features-after>
      <TechShowcase />
    </template>
  </DefaultTheme.Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import NeuralBackground from './components/NeuralBackground.vue'
import TextAnimations from './components/TextAnimations.vue'

import TechShowcase from './components/TechShowcase.vue'
</script>
