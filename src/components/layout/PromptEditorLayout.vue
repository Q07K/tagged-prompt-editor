<template>
  <div
    class="bg-gray-900 text-gray-200 font-sans antialiased min-h-screen flex flex-col"
  >
    <EditorHeader />
    <main class="flex-grow flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
      <slot name="prompt-text" />
      <slot name="tag-block" />
    </main>
  </div>
</template>

<script setup lang="ts">
import EditorHeader from './EditorHeader.vue'
</script>
