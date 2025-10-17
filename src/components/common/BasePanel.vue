<template>
  <section class="base-panel" :class="panelClass">
    <PanelHeader :title="title">
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
    </PanelHeader>

    <div class="base-panel__content" :class="contentClass" ref="contentEl">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PanelHeader from './PanelHeader.vue'
import colors from '@/assets/theme/colors'

const contentEl = ref<HTMLElement | null>(null)
defineExpose({ contentEl })
interface Props {
  title: string
  panelClass?: string
  contentClass?: string
}

withDefaults(defineProps<Props>(), {
  panelClass: '',
  contentClass: '',
})
</script>

<style scoped>
.base-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-color: v-bind('colors["background-light"]');
  border: 2px solid v-bind('colors["border-light"]');
  border-radius: 0.75rem;
}
.dark .base-panel {
  background-color: v-bind('colors["background-dark"]');
  border-color: v-bind('colors["border-dark"]');
}

.base-panel__content {
  flex: 1;
  min-height: 0;
  position: relative;
}
</style>
