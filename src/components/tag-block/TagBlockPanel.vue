<template>
  <section class="tag-panel">
    <PanelHeader title="Visual Block Renderer" />
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
import PanelHeader from '../common/PanelHeader.vue'
import colors from '@/assets/theme/colors'

const store = usePromptEditorStore()
const { parsedNodes: nodes } = storeToRefs(store)
</script>

<style scoped>
.tag-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-color: v-bind('colors["background-light"]');
  border: 1px solid v-bind('colors["border-light"]');
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.35);
}

.dark .tag-panel {
  background-color: v-bind('colors["background-dark"]');
  border-color: v-bind('colors["border-dark"]');
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
  color: v-bind('colors["text-main-light"]');
  font-size: 0.9rem;
  margin: auto;
}
.dark .tag-panel__placeholder {
  color: v-bind('colors["text-main-dark"]');
}
</style>
