<script setup lang="ts">
import { onMounted } from 'vue'
import MainView from './views/MainView.vue'
import { useTheme } from '@/composables/useTheme'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 dark:bg-gray-950">
    <MainView />
  </div>
</template>
