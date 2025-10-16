<template>
  <section class="tag-panel">
    <header class="tag-panel__header">
      <h2 class="tag-panel__title">Visual Block Renderer</h2>
    </header>
    <div class="tag-panel__body">
      <template v-if="nodes.length">
        <template v-for="node in nodes" :key="node.id">
          <TagBlockElement v-if="node.type === 'element'" :node="node" />
          <TagBlockText
            v-else
            :node="node"
            :disabled="node.enabled === false"
          />
        </template>
      </template>
      <p v-else class="tag-panel__placeholder">
        왼쪽 텍스트 영역에 유효한 태그를 입력해 주세요. (예:
        &lt;tag&gt;내용&lt;/tag&gt;)
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePromptEditorStore } from '@/stores/promptEditorStore'
import TagBlockElement from './TagBlockElement.vue'
import TagBlockText from './TagBlockText.vue'

const store = usePromptEditorStore()
const { parsedNodes: nodes } = storeToRefs(store)
</script>

<style scoped>
.tag-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.35);
}

.tag-panel__header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #4b5563;
  background-color: rgba(55, 65, 81, 0.6);
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}

.tag-panel__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #d1d5db;
}

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
  color: #9ca3af;
  font-size: 0.9rem;
  margin: auto;
}
</style>
