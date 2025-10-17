<script setup lang="ts">
import ThemeToggle from '../common/ThemeToggle.vue'
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import logoLight from '@/assets/icons/logo_light.svg'
import logoDark from '@/assets/icons/logo_dark.svg'

const { isDark } = useTheme()

const logoSrc = computed(() => {
  return isDark.value ? logoDark : logoLight
})
</script>
<template>
  <header
    class="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark p-4 shadow-md"
  >
    <div class="flex flex-row items-center gap-2">
      <img :src="logoSrc" alt="Tagged Prompt Editor logo" class="h-10 mb-2" />
      <h1 class="text-xl font-bold text-primary">Tagged Prompt Editor</h1>
    </div>
    <div class="flex flex-row items-center justify-between gap-2">
      <p class="text-sm text-text-main-light dark:text-text-main-dark mt-1">
        왼쪽에 프롬프트를 입력/수정하면 오른쪽 블록이 실시간으로 업데이트됩니다.
      </p>
      <ThemeToggle />
    </div>
  </header>
</template>
