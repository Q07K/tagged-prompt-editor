<template>
  <div class="tag-header">
    <input
      :value="tagName"
      :disabled="disabled"
      class="tag-header__tag"
      @input="onTagInput"
    />
    <label class="tag-header__switch">
      <input
        type="checkbox"
        class="tag-header__checkbox"
        :checked="enabled"
        @change="onToggle"
      />
      <span class="tag-header__indicator" />
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tagName: string
  enabled: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  (event: 'update:tag', value: string): void
  (event: 'toggle', value: boolean): void
}>()

function onTagInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:tag', value)
}

function onToggle(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  emit('toggle', checked)
}
</script>

<style scoped>
.tag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.tag-header__tag {
  flex: 1;
  background-color: rgba(8, 145, 178, 0.35);
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 0.375rem;
  color: #22d3ee;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.35rem 0.5rem;
}

.tag-header__tag:focus {
  outline: 2px solid rgba(34, 211, 238, 0.75);
}

.tag-header__tag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tag-header__switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.tag-header__checkbox {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.tag-header__indicator {
  width: 38px;
  height: 20px;
  background-color: #4b5563;
  border-radius: 9999px;
  position: relative;
  transition: background-color 0.2s ease;
}

.tag-header__indicator::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background-color: #fff;
  transition: transform 0.2s ease;
}

.tag-header__checkbox:checked + .tag-header__indicator {
  background-color: #0ea5e9;
}

.tag-header__checkbox:checked + .tag-header__indicator::after {
  transform: translateX(18px);
}
</style>
