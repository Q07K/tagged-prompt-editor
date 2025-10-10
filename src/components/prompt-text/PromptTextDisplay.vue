<template>
  <div ref="displayContainer" class="prompt-text-display">
    <pre class="prompt-text-display__content" v-html="highlightedText || '&nbsp;'" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePromptEditorStore } from '@/stores/promptEditorStore'

const props = defineProps<{
  text: string
  scrollTop: number
  scrollLeft: number
}>()

const store = usePromptEditorStore()
const { rawTextHtml } = storeToRefs(store)

const displayContainer = ref<HTMLElement | null>(null)

// rawTextHtml을 그대로 사용 (이미 하이라이팅이 포함됨)
const highlightedText = computed(() => {
  return rawTextHtml.value || ''
})

// 스크롤 위치 동기화
watch(
  [() => props.scrollTop, () => props.scrollLeft],
  ([newScrollTop, newScrollLeft]) => {
    if (!displayContainer.value) return
    displayContainer.value.scrollTop = newScrollTop
    displayContainer.value.scrollLeft = newScrollLeft
  },
  { immediate: true },
)

// 텍스트 변경 시 스크롤 위치 복원
watch(
  () => props.text,
  () => {
    nextTick(() => {
      if (!displayContainer.value) return
      displayContainer.value.scrollTop = props.scrollTop
      displayContainer.value.scrollLeft = props.scrollLeft
    })
  },
)
</script>

<style scoped>
.prompt-text-display {
  position: absolute;
  inset: 0;
  padding: 1rem;
  pointer-events: none;
  overflow: auto;
  user-select: none;
  z-index: 10; /* textarea 위에 표시 */
  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.prompt-text-display::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.prompt-text-display__content {
  margin: 0;
  font-family:
    'Fira Code', ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  letter-spacing: 0;
  color: #d1d5db;
  white-space: pre;
  overflow-wrap: normal;
  tab-size: 4;
  -moz-tab-size: 4;
  min-height: 100%;
  width: max-content;
  min-width: 100%;
  /* 텍스트 선택 시 겹침 방지 */
  -webkit-user-select: text;
  -moz-user-select: text;
  user-select: text;
  /* textarea와 완전히 동일한 렌더링 */
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  text-rendering: optimizeSpeed;
}
</style>

<style>
/* 글로벌 스타일 - 하이라이팅 */
.tag-highlight {
  color: #22d3ee !important;
}

.raw-text-disabled {
  color: #6b7280 !important;
}

.raw-text-disabled.tag-highlight {
  color: #6b7280 !important;
}
</style>
