<template>
  <header class="panel-header">
    <h2 class="text-2xl font-bold">
      {{ title }}
    </h2>
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import colors from '@/assets/theme/colors'

interface Props {
  title: string
}

defineProps<Props>()
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid v-bind('colors["border-light"]');
  background-color: v-bind('colors["surface-light"]');
  color: v-bind('colors["text-main-light"]');
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  min-height: 60px;
}
.dark .panel-header {
  border-bottom-color: v-bind('colors["border-dark"]');
  background-color: v-bind('colors["surface-dark"]');
  color: v-bind('colors["text-main-dark"]');
}
</style>
