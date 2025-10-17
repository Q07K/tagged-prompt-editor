<template>
  <BasePanel title="Visual Block Renderer" content-class="tag-panel__body">
    <template v-if="nodes.length">
      <template v-for="node in nodes" :key="node.id">
        <TagBlockElement v-if="node.type === 'element'" :node="node" />
        <TagBlockText v-else :node="node" :disabled="node.enabled === false" />
      </template>
    </template>
    <p v-else class="tag-panel__placeholder">
      왼쪽 텍스트 영역에 유효한 태그를 입력해 주세요. (예:
      &lt;tag&gt;내용&lt;/tag&gt;)
    </p>
  </BasePanel>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePromptEditorStore } from '@/stores/promptEditorStore'
import TagBlockElement from './TagBlockElement.vue'
import TagBlockText from './TagBlockText.vue'
import colors from '@/assets/theme/colors'
import BasePanel from '../common/BasePanel.vue'

const store = usePromptEditorStore()
const { parsedNodes: nodes } = storeToRefs(store)
</script>

<style scoped>
.tag-panel__body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
}

.tag-panel__placeholder {
  text-align: center;
  color: v-bind('colors["text-main-light"]');
  font-size: 0.9rem;
  margin: auto;
}
.dark .tag-panel__placeholder {
  color: v-bind('colors["text-main-dark"]');
}
</style>
