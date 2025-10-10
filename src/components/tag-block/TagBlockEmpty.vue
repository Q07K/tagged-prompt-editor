<template>
  <button type="button" class="tag-empty" :disabled="disabled" @click="$emit('create')">
    클릭하여 텍스트를 추가하세요...
  </button>
</template>

<script setup lang="ts">
defineProps<{ disabled?: boolean }>()
</script>

<style scoped>
.tag-empty {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px dashed rgba(148, 163, 184, 0.6);
  color: #9ca3af;
  background: rgba(30, 41, 59, 0.35);
  font-style: italic;
  font-size: 0.85rem;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.tag-empty:hover:enabled {
  border-color: rgba(14, 165, 233, 0.65);
  color: #e0f2fe;
  background: rgba(14, 165, 233, 0.15);
}

.tag-empty:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
