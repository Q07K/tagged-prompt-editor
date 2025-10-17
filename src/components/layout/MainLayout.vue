<template>
  <div class="main min-h-screen flex flex-col">
    <MainHeader />
    <main class="flex-grow flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
      <slot name="prompt-text" />
      <slot name="tag-block" />
    </main>
  </div>
</template>

<script setup lang="ts">
import MainHeader from './MainHeader.vue'
import colors from '@/assets/theme/colors'
</script>

<style scoped>
main {
  background-color: v-bind('colors["background-light"]');
  color: v-bind('colors["text-main-light"]');
}
.dark main {
  background-color: v-bind('colors["background-dark"]');
  color: v-bind('colors["text-main-dark"]');
}
</style>
