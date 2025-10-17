<script setup lang="ts">
import ThemeToggle from '../common/ThemeToggle.vue'
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import logoLight from '@/assets/icons/logo_light.svg'
import logoDark from '@/assets/icons/logo_dark.svg'
import colors from '@/assets/theme/colors'

const { isDark } = useTheme()

const logoSrc = computed(() => {
  return isDark.value ? logoDark : logoLight
})
</script>
<template>
  <header class="main-header shadow-md">
    <div class="flex flex-row items-start gap-2">
      <img :src="logoSrc" alt="Tagged Prompt Editor logo" class="h-14 mb-2" />
      <div class="flex flex-row items-center gap-auto w-full">
        <div class="flex flex-col">
          <h1 class="text-4xl font-bold text-primary">Tagged Prompt Editor</h1>
          <p class="main-description text-sm mt-1">
            LLM 프롬프트를 태그로 구성하고 실시간으로 편집 및 시각화하고
            관리하세요.
          </p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  </header>
</template>

<style scoped>
.main-header {
  background-color: v-bind('colors["surface-light"]');
  border-bottom: 1px solid v-bind('colors["border-light"]');
  padding: 1rem;
}
.main-description {
  color: v-bind('colors["text-main-light"]');
  margin-top: 0.25rem;
}

.dark .main-header {
  background-color: v-bind('colors["surface-dark"]');
  border-bottom: v-bind('colors["border-dark"]');
}
.dark .main-description {
  color: v-bind('colors["text-main-dark"]');
}
</style>
