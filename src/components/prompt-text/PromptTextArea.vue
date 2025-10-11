<template>
  <textarea
    ref="textarea"
    class="prompt-text-area"
    :value="modelValue"
    :placeholder="placeholder"
    wrap="off"
    @input="handleInput"
    @keydown="handleKeydown"
    @scroll="handleScroll"
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder: string
}>()

const emit = defineEmits<{
  (event: 'input', payload: { value: string; selectionStart: number }): void
  (event: 'keydown', payload: KeyboardEvent): void
  (event: 'scroll', payload: { scrollTop: number; scrollLeft: number }): void
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
let scrollRequestId: number | null = null

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('input', {
    value: target.value,
    selectionStart: target.selectionStart ?? target.value.length,
  })
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event)
}

function handleScroll(event: Event) {
  // 스크롤 이벤트 최적화를 위해 requestAnimationFrame 사용
  if (scrollRequestId) {
    cancelAnimationFrame(scrollRequestId)
  }

  scrollRequestId = requestAnimationFrame(() => {
    const target = event.target as HTMLTextAreaElement
    emit('scroll', {
      scrollTop: target.scrollTop,
      scrollLeft: target.scrollLeft,
    })
    scrollRequestId = null
  })
}

watch(
  () => props.modelValue,
  (value) => {
    if (!textarea.value) return
    if (textarea.value.value === value) return

    const currentPosition = textarea.value.selectionStart ?? 0
    const currentEnd = textarea.value.selectionEnd ?? currentPosition

    textarea.value.value = value

    // 커서 위치를 보존하되, 텍스트 길이를 초과하지 않도록 조정
    const newPosition = Math.min(currentPosition, value.length)
    const newEnd = Math.min(currentEnd, value.length)

    try {
      textarea.value.setSelectionRange(newPosition, newEnd)
    } catch {
      // 커서 설정에 실패하면 텍스트 끝으로 이동
      textarea.value.setSelectionRange(value.length, value.length)
    }
  },
)

onMounted(() => {
  if (textarea.value) {
    textarea.value.value = props.modelValue
  }
})

onUnmounted(() => {
  if (scrollRequestId) {
    cancelAnimationFrame(scrollRequestId)
    scrollRequestId = null
  }
})

defineExpose({ textarea })
</script>

<style scoped>
.prompt-text-area {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  padding: 1rem;
  resize: none;
  border: 0;
  font-family:
    'Fira Code', ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  letter-spacing: 0;
  color: transparent;
  caret-color: #fff;
  white-space: pre;
  overflow-wrap: normal;
  outline: none;
  tab-size: 4;
  -moz-tab-size: 4;
  /* 스크롤 부드럽게 */
  scroll-behavior: auto;
  overflow: auto;
  /* 동일한 텍스트 렌더링 */
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  text-rendering: optimizeSpeed;
}

/* 텍스트 선택 시 겹침 방지 */
.prompt-text-area::selection {
  background-color: #3b82f6;
  color: #ffffff;
  text-shadow: none;
  line-height: 1.5;
}

.prompt-text-area::-moz-selection {
  background-color: #3b82f6;
  color: #ffffff;
  text-shadow: none;
  line-height: 1.5;
}

.prompt-text-area::placeholder {
  color: #4b5563;
}
</style>
