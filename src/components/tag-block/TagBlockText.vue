<template>
  <div
    v-if="node.content.trim() !== '' || isEditing"
    class="tag-text"
    :class="{ 'tag-text--disabled': disabled }"
  >
    <div
      v-if="!isEditing"
      class="tag-text__preview"
      v-html="previewHtml"
      @click="startEditing"
    />
    <textarea
      v-else
      ref="editor"
      class="tag-text__editor"
      v-model="draft"
      @blur="commit"
      @keydown.exact.enter.prevent="commit"
      @input="autoResize"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { renderMarkdown } from '@/composables/useMarkdown'
import { usePromptEditorStore } from '@/stores/promptEditorStore'
import type { PromptTextNode } from '@/utils/tagHelpers'
import colors from '@/assets/theme/colors'

const props = defineProps<{
  node: PromptTextNode
  disabled?: boolean
  autofocus?: boolean
}>()

const store = usePromptEditorStore()
const isEditing = ref(false)
const draft = ref(props.node.content)
const editor = ref<HTMLTextAreaElement | null>(null)

const previewHtml = computed(() => renderMarkdown(props.node.content || ' '))

watch(
  () => props.node.content,
  (value) => {
    if (!isEditing.value) {
      draft.value = value
    }
  },
)

watch(
  () => props.autofocus,
  (value) => {
    if (value) {
      startEditing()
    }
  },
  { immediate: true },
)

function startEditing() {
  if (props.disabled) return
  isEditing.value = true
  draft.value = props.node.content
  nextTick(() => {
    if (!editor.value) return
    editor.value.focus()
    autoResize()
  })
}

function commit() {
  isEditing.value = false
  store.updateTextContent(props.node.id, draft.value)
}

function autoResize() {
  if (!editor.value) return
  editor.value.style.height = 'auto'
  editor.value.style.height = `${editor.value.scrollHeight}px`
}
</script>

<style scoped>
.tag-text {
  background-color: v-bind('colors["surface-light"]');
  border: 2px solid v-bind('colors["border-light"] + "aa"');
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: border-color 0.2s ease;
  position: relative;
  z-index: 1;
}
.dark .tag-text {
  background-color: v-bind('colors["surface-dark"]');
  border-color: v-bind('colors["border-dark"] + "aa"');
}

.tag-text__preview {
  font-size: 0.92rem;
  line-height: 1.5;
  cursor: pointer;
}

.tag-text__editor {
  width: 100%;
  min-height: 6rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(34, 211, 238, 0.5);
  background: v-bind('colors["primary"] + "10"');
  color: v-bind('colors["text-main-light"]');
  font-size: 0.92rem;
  padding: 0.75rem;
  resize: none;
  outline: none;
}
.dark .tag-text__editor {
  color: v-bind('colors["text-main-dark"]');
}

.tag-text--disabled {
  opacity: 0.6;
  pointer-events: none;
}

:deep(p) {
  margin: 0 0 0.5rem;
}

:deep(p:last-child) {
  margin-bottom: 0;
}

/* 인라인 코드 스타일 - 오른쪽 렌더링 영역에만 적용 */
:deep(code) {
  background-color: #374151;
  color: #fbbf24;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family:
    'Fira Code', ui-monospace, SFMono-Regular, 'SF Mono', Consolas,
    'Liberation Mono', Menlo, monospace;
  font-size: 0.875em;
  font-weight: 500;
}

/* 코드 블록 스타일 */
:deep(pre) {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

:deep(pre code) {
  background-color: transparent;
  color: #e5e7eb;
  padding: 0;
  border-radius: 0;
}

/* 리스트 스타일 */
:deep(ul) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

:deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  list-style-type: decimal;
}

:deep(li) {
  margin: 0.25rem 0;
  line-height: 1.5;
}

:deep(li::marker) {
  color: v-bind('colors["primary"]');
}
</style>
