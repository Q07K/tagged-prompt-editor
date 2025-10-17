<template>
  <div class="bg-gray-900 text-gray-200 min-h-screen flex flex-col">
    <MainHeader />
    <main class="flex-grow flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
      <slot name="prompt-text" />
      <slot name="tag-block" />
    </main>
  </div>
</template>

<script setup lang="ts">
import MainHeader from './MainHeader.vue'
</script>
