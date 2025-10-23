<template>
  <button
    type="button"
    class="tag-empty"
    :disabled="disabled"
    @click="$emit('create')"
  >
    클릭하여 텍스트를 추가하세요.
  </button>
</template>

<script setup lang="ts">
import colors from '@/assets/theme/colors'

defineProps<{ disabled?: boolean }>()
</script>

<style scoped>
.tag-empty {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 2px dashed v-bind('colors["border-light"] + "aa"');
  background-color: v-bind('colors["surface-light"]');
  color: v-bind('colors["text-subtle-light"]');
  font-style: italic;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.dark .tag-empty {
  border-color: v-bind('colors["border-dark"] + "aa"');
  background-color: v-bind('colors["surface-dark"]');
  color: v-bind('colors["text-subtle-dark"]');
}

.tag-empty:hover:enabled {
  border-color: v-bind('colors.primary + "80"');
  background: v-bind('colors.primary + "80"');
}

.tag-empty:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
