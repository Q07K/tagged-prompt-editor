<template>
  <transition name="fade">
    <div
      v-if="visible && suggestions.length"
      class="autocomplete"
      :style="positionStyle"
      role="listbox"
    >
      <button
        v-for="(suggestion, index) in suggestions"
        :key="suggestion + index"
        type="button"
        class="autocomplete__item"
        :class="{ 'autocomplete__item--active': index === activeIndex }"
        @mousedown.prevent="() => handleSelect(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  suggestions: string[]
  activeIndex: number
  visible: boolean
  anchor: {
    top: number
    left: number
    height: number
  }
}>()

const emit = defineEmits<{
  (event: 'select', value: string): void
}>()

const positionStyle = computed(() => ({
  top: `${props.anchor.top + props.anchor.height}px`,
  left: `${props.anchor.left}px`,
}))

function handleSelect(value: string) {
  emit('select', value)
}
</script>

<style scoped>
.autocomplete {
  position: absolute;
  z-index: 9999;
  min-width: 10rem;
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.375rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.4);
  padding: 0.25rem 0;
}

.autocomplete__item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  text-align: left;
  background: transparent;
  color: #7c0000;
  font-size: 0.85rem;
  font-weight: 500;
  border: 0;
  cursor: pointer;
}

.autocomplete__item--active,
.autocomplete__item:hover {
  background-color: #4b5563;
  color: #e5e7eb;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
