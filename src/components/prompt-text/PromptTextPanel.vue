<template>
  <section class="prompt-panel">
    <header class="prompt-panel__header">
      <h2 class="prompt-panel__title">Tagged Prompt</h2>
      <button type="button" class="prompt-panel__copy" @click="handleCopy">{{ copyLabel }}</button>
    </header>

    <div ref="editorRef" class="prompt-panel__editor">
      <PromptTextDisplay
        :text="rawText"
        :scroll-top="scrollState.scrollTop"
        :scroll-left="scrollState.scrollLeft"
      />
      <PromptTextArea
        ref="areaRef"
        :model-value="rawText"
        :placeholder="placeholder"
        @input="handleInput"
        @keydown="handleKeydown"
        @scroll="handleScroll"
      />
      <PromptTextAutoComplete
        :anchor="suggestionAnchor"
        :suggestions="suggestions"
        :visible="isSuggestionVisible"
        :active-index="activeSuggestionIndex"
        @select="handleSuggestionSelect"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import PromptTextArea from './PromptTextArea.vue'
import PromptTextDisplay from './PromptTextDisplay.vue'
import PromptTextAutoComplete from './PromptTextAutoComplete.vue'
import { usePromptEditorStore } from '@/stores/promptEditorStore'
import { getCaretMetrics } from '@/composables/useCaretPosition'
import { storeToRefs } from 'pinia'

const placeholder = '<instruction>여기에 지시사항을 입력하세요...</instruction>'

const store = usePromptEditorStore()
const editorRef = ref<HTMLElement | null>(null)
const areaRef = ref<{ textarea: HTMLTextAreaElement | null } | null>(null)

const scrollState = reactive({
  scrollTop: 0,
  scrollLeft: 0,
})

const copyLabel = ref<'Copy' | 'Copied!' | 'Error'>('Copy')

// 히스토리 관리를 위한 상태
const history = ref<Array<{ text: string; position: number }>>([])
const historyIndex = ref(-1)
const maxHistorySize = 100

// 마크다운 토글을 위한 상태 추적
const lastMarkdownAction = ref<{
  prefix: string
  suffix: string
  start: number
  end: number
  originalText: string
} | null>(null)

const {
  rawText,
  rawTextHtml,
  suggestions,
  isSuggestionVisible,
  activeSuggestionIndex,
  suggestionAnchor,
  copyableText,
} = storeToRefs(store)

const {
  updateFromUserInput,
  hideSuggestions,
  moveSuggestion,
  getActiveSuggestion,
  setSuggestionAnchor,
} = store

watch(rawTextHtml, () => {
  void nextTick(() => {
    syncScrollPosition()
  })
})

function syncScrollPosition() {
  if (!areaRef.value?.textarea) return
  const textarea = areaRef.value.textarea
  // 스크롤 상태 값을 textarea에 적용
  if (textarea.scrollTop !== scrollState.scrollTop) {
    textarea.scrollTop = scrollState.scrollTop
  }
  if (textarea.scrollLeft !== scrollState.scrollLeft) {
    textarea.scrollLeft = scrollState.scrollLeft
  }
}

function updateAnchor(position: number) {
  const textarea = areaRef.value?.textarea
  const container = editorRef.value
  if (!textarea || !container) return
  const metrics = getCaretMetrics(textarea, position)
  const areaRect = textarea.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  setSuggestionAnchor({
    top: metrics.top + areaRect.top - containerRect.top,
    left: metrics.left + areaRect.left - containerRect.left,
    height: metrics.height,
  })
}

function handleInput(payload: { value: string; selectionStart: number }) {
  // 히스토리에 현재 상태 저장 (입력 전 상태)
  saveToHistory(rawText.value, payload.selectionStart)

  updateFromUserInput(payload.value, payload.selectionStart)

  // 입력 중에는 스크롤 위치를 즉시 동기화
  void nextTick(() => {
    syncScrollPosition()
  })

  if (isSuggestionVisible.value) {
    updateAnchor(payload.selectionStart)
  }
}

function handleScroll(payload: { scrollTop: number; scrollLeft: number }) {
  // 스크롤 상태를 즉시 업데이트
  scrollState.scrollTop = payload.scrollTop
  scrollState.scrollLeft = payload.scrollLeft
}

function handleKeydown(event: KeyboardEvent) {
  // 자동완성이 표시된 상태에서의 단축키 처리
  if (isSuggestionVisible.value) {
    const textarea = areaRef.value?.textarea
    if (!textarea) return

    const isAutoCompleteKey =
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === 'Escape' ||
      (event.key === 'Tab' && !event.metaKey && !event.ctrlKey)

    if (!isAutoCompleteKey) return

    event.preventDefault()

    if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
      moveSuggestion(1)
      updateAnchor(textarea.selectionStart ?? 0)
    } else if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      moveSuggestion(-1)
      updateAnchor(textarea.selectionStart ?? 0)
    } else if (event.key === 'Enter') {
      const active = getActiveSuggestion()
      if (active) {
        handleSuggestionSelect(active)
      }
    } else if (event.key === 'Escape') {
      hideSuggestions()
    }
    return
  }

  // 일반 상태에서의 단축키 처리
  handleGeneralShortcuts(event)
}

function handleGeneralShortcuts(event: KeyboardEvent) {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  // Ctrl+A: 전체 선택
  if (event.ctrlKey && event.key === 'a') {
    event.preventDefault()
    textarea.select()
    return
  }

  // Ctrl+Z: 실행 취소
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    handleUndo()
    return
  }

  // Ctrl+Y 또는 Ctrl+Shift+Z: 다시 실행
  if (
    (event.ctrlKey && event.key === 'y') ||
    (event.ctrlKey && event.shiftKey && event.key === 'Z')
  ) {
    event.preventDefault()
    handleRedo()
    return
  }

  // Ctrl+C: 복사 (브라우저 기본 동작)
  if (event.ctrlKey && event.key === 'c') {
    // 브라우저 기본 복사 동작 사용 (들여쓰기 포함)
    return
  }

  // Ctrl+X: 잘라내기
  if (event.ctrlKey && event.key === 'x') {
    // 기본 동작 허용하되, 잘라낸 후 업데이트
    setTimeout(() => {
      const value = textarea.value
      const position = textarea.selectionStart ?? 0
      updateFromUserInput(value, position)
    }, 0)
    return
  }

  // Ctrl+V: 붙여넣기
  if (event.ctrlKey && event.key === 'v') {
    // 기본 동작 허용하되, 붙여넣은 후 업데이트
    setTimeout(() => {
      const value = textarea.value
      const position = textarea.selectionStart ?? 0
      updateFromUserInput(value, position)
    }, 0)
    return
  }

  // Ctrl+D: 현재 줄 복제
  if (event.ctrlKey && event.key === 'd') {
    event.preventDefault()
    handleDuplicateLine()
    return
  }

  // Ctrl+/: 주석 토글
  if (event.ctrlKey && event.key === '/') {
    event.preventDefault()
    handleToggleComment()
    return
  }

  // Ctrl+]: 들여쓰기
  if (event.ctrlKey && event.key === ']') {
    event.preventDefault()
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? start
    handleIndent(textarea.value, start, end)
    return
  }

  // Ctrl+[: 내어쓰기
  if (event.ctrlKey && event.key === '[') {
    event.preventDefault()
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? start
    handleUnindent(textarea.value, start, end)
    return
  }

  // Ctrl+Enter: 새 줄 추가 (아래)
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    handleNewLineBelow()
    return
  }

  // Ctrl+Shift+Enter: 새 줄 추가 (위)
  if (event.ctrlKey && event.shiftKey && event.key === 'Enter') {
    event.preventDefault()
    handleNewLineAbove()
    return
  }

  // Ctrl+B: 볼드 처리
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault()
    handleMarkdownFormat('**', '**')
    return
  }

  // Ctrl+I: 이탤릭 처리
  if (event.ctrlKey && event.key === 'i') {
    event.preventDefault()
    handleMarkdownFormat('*', '*')
    return
  }

  // Ctrl+E: 인라인 코드 처리
  if (event.ctrlKey && event.key === 'e') {
    event.preventDefault()
    handleMarkdownFormat('`', '`')
    return
  }

  // Ctrl+Shift+E: 코드 블록 처리
  if (event.ctrlKey && event.shiftKey && event.key === 'E') {
    event.preventDefault()
    handleMarkdownFormat('```\n', '\n```')
    return
  }

  // Ctrl+K: 링크 처리
  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault()
    handleMarkdownLink()
    return
  }

  // Escape: 자동완성 숨기기 (이미 위에서 처리됨)
  if (event.key === 'Escape') {
    hideSuggestions()
    return
  }

  // Tab: 들여쓰기 처리
  if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? start
    const value = textarea.value

    if (event.shiftKey) {
      // Shift+Tab: 내어쓰기
      handleUnindent(value, start, end)
    } else {
      // Tab: 들여쓰기
      handleIndent(value, start, end)
    }
    return
  }
}

function handleIndent(value: string, start: number, end: number) {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  const lines = value.split('\n')
  const startLineIndex = value.substring(0, start).split('\n').length - 1
  const endLineIndex = value.substring(0, end).split('\n').length - 1

  let newValue = value

  // 여러 줄이 선택된 경우
  if (startLineIndex !== endLineIndex) {
    for (let i = startLineIndex; i <= endLineIndex; i++) {
      if (lines[i] !== undefined) {
        lines[i] = '    ' + lines[i] // 4칸 들여쓰기
      }
    }
    newValue = lines.join('\n')
    const newStart = start + 4
    const newEnd = end + (endLineIndex - startLineIndex + 1) * 4

    updateFromUserInput(newValue, newStart)
    setTimeout(() => {
      textarea.setSelectionRange(newStart, newEnd)
    }, 0)
  } else {
    // 단일 줄의 경우 커서 위치에 4칸 삽입
    const before = value.substring(0, start)
    const after = value.substring(end)
    newValue = before + '    ' + after
    const newPosition = start + 4

    updateFromUserInput(newValue, newPosition)
    setTimeout(() => {
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }
}

function handleUnindent(value: string, start: number, end: number) {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  const lines = value.split('\n')
  const startLineIndex = value.substring(0, start).split('\n').length - 1
  const endLineIndex = value.substring(0, end).split('\n').length - 1

  let newValue = value
  let totalRemoved = 0

  // 여러 줄이 선택된 경우
  if (startLineIndex !== endLineIndex) {
    for (let i = startLineIndex; i <= endLineIndex; i++) {
      const line = lines[i]
      if (line !== undefined) {
        if (line.startsWith('    ')) {
          lines[i] = line.substring(4)
          totalRemoved += 4
        } else if (line.startsWith('\t')) {
          lines[i] = line.substring(1)
          totalRemoved += 1
        } else if (line.match(/^ {1,3}/)) {
          const spaces = line.match(/^ +/)?.[0] || ''
          lines[i] = line.substring(spaces.length)
          totalRemoved += spaces.length
        }
      }
    }
    newValue = lines.join('\n')
    const newStart = Math.max(
      0,
      start - Math.min(4, totalRemoved / (endLineIndex - startLineIndex + 1)),
    )
    const newEnd = Math.max(0, end - totalRemoved)

    updateFromUserInput(newValue, newStart)
    setTimeout(() => {
      textarea.setSelectionRange(newStart, newEnd)
    }, 0)
  } else {
    // 단일 줄의 경우 해당 줄의 앞쪽 공백 제거
    const currentLine = lines[startLineIndex]
    let removed = 0
    if (currentLine !== undefined) {
      if (currentLine.startsWith('    ')) {
        lines[startLineIndex] = currentLine.substring(4)
        removed = 4
      } else if (currentLine.startsWith('\t')) {
        lines[startLineIndex] = currentLine.substring(1)
        removed = 1
      } else if (currentLine.match(/^ {1,3}/)) {
        const spaces = currentLine.match(/^ +/)?.[0] || ''
        lines[startLineIndex] = currentLine.substring(spaces.length)
        removed = spaces.length
      }
    }

    if (removed > 0) {
      newValue = lines.join('\n')
      const newPosition = Math.max(0, start - removed)

      updateFromUserInput(newValue, newPosition)
      setTimeout(() => {
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
    }
  }
}

function handleDuplicateLine() {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  const value = textarea.value
  const start = textarea.selectionStart ?? 0
  const end = textarea.selectionEnd ?? start

  const lines = value.split('\n')
  const startLineIndex = value.substring(0, start).split('\n').length - 1
  const endLineIndex = value.substring(0, end).split('\n').length - 1

  const linesToDuplicate = lines.slice(startLineIndex, endLineIndex + 1)
  const duplicatedLines = [...linesToDuplicate]

  // 선택된 줄들을 복제해서 아래에 삽입
  lines.splice(endLineIndex + 1, 0, ...duplicatedLines)
  const newValue = lines.join('\n')

  // 복제된 줄들의 시작 위치로 커서 이동
  const newLineStart = lines.slice(0, endLineIndex + 1).join('\n').length + 1
  const newLineEnd = newLineStart + duplicatedLines.join('\n').length

  updateFromUserInput(newValue, newLineStart)
  setTimeout(() => {
    textarea.setSelectionRange(newLineStart, newLineEnd)
  }, 0)
}

function handleToggleComment() {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  const value = textarea.value
  const start = textarea.selectionStart ?? 0
  const end = textarea.selectionEnd ?? start

  const lines = value.split('\n')
  const startLineIndex = value.substring(0, start).split('\n').length - 1
  const endLineIndex = value.substring(0, end).split('\n').length - 1

  let allCommented = true
  for (let i = startLineIndex; i <= endLineIndex; i++) {
    const line = lines[i]
    if (line !== undefined && line.trim() && !line.trim().startsWith('<!-- ')) {
      allCommented = false
      break
    }
  }

  let offset = 0
  for (let i = startLineIndex; i <= endLineIndex; i++) {
    const line = lines[i]
    if (line !== undefined) {
      if (allCommented) {
        // 주석 제거
        if (line.trim().startsWith('<!-- ') && line.trim().endsWith(' -->')) {
          const uncommented = line.replace(/^(\s*)<!-- (.*) -->(\s*)$/, '$1$2$3')
          lines[i] = uncommented
          offset -= 9 // '<!-- ' + ' -->' = 9 characters
        }
      } else {
        // 주석 추가
        if (line.trim()) {
          const indent = line.match(/^(\s*)/)?.[0] || ''
          const content = line.substring(indent.length)
          lines[i] = `${indent}<!-- ${content} -->`
          offset += 9
        }
      }
    }
  }

  const newValue = lines.join('\n')
  const newStart = start + (startLineIndex === 0 ? 0 : offset / (endLineIndex - startLineIndex + 1))
  const newEnd = end + offset

  updateFromUserInput(newValue, Math.max(0, newStart))
  setTimeout(() => {
    textarea.setSelectionRange(Math.max(0, newStart), Math.max(0, newEnd))
  }, 0)
}

function handleNewLineBelow() {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  const value = textarea.value
  const start = textarea.selectionStart ?? 0

  // 현재 줄의 끝을 찾기
  const lines = value.split('\n')
  const currentLineIndex = value.substring(0, start).split('\n').length - 1
  const currentLine = lines[currentLineIndex] || ''

  // 현재 줄의 들여쓰기 확인
  const indent = currentLine.match(/^(\s*)/)?.[0] || ''

  // 현재 줄 끝 위치 계산
  const lineStart =
    lines.slice(0, currentLineIndex).join('\n').length + (currentLineIndex > 0 ? 1 : 0)
  const lineEnd = lineStart + currentLine.length

  // 새 줄 삽입
  const before = value.substring(0, lineEnd)
  const after = value.substring(lineEnd)
  const newValue = before + '\n' + indent + after
  const newPosition = lineEnd + 1 + indent.length

  updateFromUserInput(newValue, newPosition)
  setTimeout(() => {
    textarea.setSelectionRange(newPosition, newPosition)
  }, 0)
}

function handleNewLineAbove() {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  const value = textarea.value
  const start = textarea.selectionStart ?? 0

  // 현재 줄의 시작을 찾기
  const lines = value.split('\n')
  const currentLineIndex = value.substring(0, start).split('\n').length - 1
  const currentLine = lines[currentLineIndex] || ''

  // 현재 줄의 들여쓰기 확인
  const indent = currentLine.match(/^(\s*)/)?.[0] || ''

  // 현재 줄 시작 위치 계산
  const lineStart =
    lines.slice(0, currentLineIndex).join('\n').length + (currentLineIndex > 0 ? 1 : 0)

  // 새 줄 삽입
  const before = value.substring(0, lineStart)
  const after = value.substring(lineStart)
  const newValue = before + indent + '\n' + after
  const newPosition = lineStart + indent.length

  updateFromUserInput(newValue, newPosition)
  setTimeout(() => {
    textarea.setSelectionRange(newPosition, newPosition)
  }, 0)
}

async function handleSuggestionSelect(tag: string) {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  const start = textarea.selectionStart ?? 0
  const end = textarea.selectionEnd ?? start
  if (start < 2) return
  const currentValue = textarea.value
  const textToInsert = `</${tag}>`
  const prefix = currentValue.substring(0, start - 2)
  const suffix = currentValue.substring(end)
  const updatedValue = `${prefix}${textToInsert}${suffix}`
  const newCaret = prefix.length + textToInsert.length

  hideSuggestions()
  updateFromUserInput(updatedValue, newCaret)

  await nextTick()
  const target = areaRef.value?.textarea
  if (!target) return
  target.focus()
  target.setSelectionRange(newCaret, newCaret)
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(copyableText.value)
    copyLabel.value = 'Copied!'
  } catch (error) {
    console.error('Failed to copy clipboard value', error)
    copyLabel.value = 'Error'
  } finally {
    setTimeout(() => {
      copyLabel.value = 'Copy'
    }, 1500)
  }
}

function handleDocumentClick(event: MouseEvent) {
  if (!editorRef.value) return
  if (editorRef.value.contains(event.target as Node)) return
  hideSuggestions()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  // 초기 상태를 히스토리에 저장
  saveToHistory(rawText.value, 0)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

function handleMarkdownFormat(prefix: string, suffix: string) {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  const value = textarea.value
  const start = textarea.selectionStart ?? 0
  const end = textarea.selectionEnd ?? start
  const selectedText = value.substring(start, end)

  // 코드 블록인 경우 특별 처리
  const isCodeBlock = prefix === '```\n' && suffix === '\n```'

  let isAlreadyFormatted = false
  if (isCodeBlock) {
    // 코드 블록의 경우: 현재 위치 앞뒤로 ``` 패턴 확인
    const beforeLines = value.substring(0, start).split('\n')
    const afterLines = value.substring(end).split('\n')
    const beforeLastLine = beforeLines[beforeLines.length - 1] || ''
    const afterFirstLine = afterLines[0] || ''

    // 바로 위 줄이 ```이고 아래에 ```가 있는지 확인
    isAlreadyFormatted = beforeLastLine.trim() === '```' && afterFirstLine.trim() === '```'
  } else {
    // 일반 마크다운의 경우
    const beforeText = value.substring(Math.max(0, start - prefix.length), start)
    const afterText = value.substring(end, end + suffix.length)
    isAlreadyFormatted = beforeText === prefix && afterText === suffix
  }

  // 현재 상태를 히스토리에 저장
  saveToHistory(value, start)

  if (isAlreadyFormatted) {
    // 이미 포맷팅되어 있으면 제거 (토글)
    if (isCodeBlock) {
      // 코드 블록 제거
      const lines = value.split('\n')
      const currentLineIndex = value.substring(0, start).split('\n').length - 1

      // ```이 있는 줄들 찾기
      let startIndex = -1
      let endIndex = -1

      for (let i = currentLineIndex; i >= 0; i--) {
        if (lines[i]?.trim() === '```') {
          startIndex = i
          break
        }
      }

      for (let i = currentLineIndex; i < lines.length; i++) {
        if (lines[i]?.trim() === '```') {
          endIndex = i
          break
        }
      }

      if (startIndex !== -1 && endIndex !== -1) {
        lines.splice(endIndex, 1) // 뒤쪽 ``` 먼저 제거
        lines.splice(startIndex, 1) // 앞쪽 ``` 제거
        const newText = lines.join('\n')
        const newPosition = Math.max(0, start - 4) // ``` + \n
        updateFromUserInput(newText, newPosition)
        setTimeout(() => {
          textarea.setSelectionRange(newPosition, newPosition + selectedText.length)
        }, 0)
      }
    } else {
      // 일반 마크다운 제거
      const newText =
        value.substring(0, start - prefix.length) +
        selectedText +
        value.substring(end + suffix.length)
      const newPosition = start - prefix.length
      updateFromUserInput(newText, newPosition)
      setTimeout(() => {
        textarea.setSelectionRange(newPosition, newPosition + selectedText.length)
      }, 0)
    }
    lastMarkdownAction.value = null
    return
  }

  // 새로운 마크다운 적용
  let newText: string
  let newStart: number
  let newEnd: number

  if (selectedText) {
    // 선택된 텍스트가 있는 경우: 감싸기
    newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end)
    newStart = start + prefix.length
    newEnd = newStart + selectedText.length
  } else {
    // 선택된 텍스트가 없는 경우: 빈 포맷 삽입
    newText = value.substring(0, start) + prefix + suffix + value.substring(end)
    newStart = start + prefix.length
    newEnd = newStart
  }

  // 마크다운 액션 정보 저장
  lastMarkdownAction.value = {
    prefix,
    suffix,
    start: newStart,
    end: newEnd,
    originalText: value,
  }

  updateFromUserInput(newText, newStart)
  setTimeout(() => {
    textarea.setSelectionRange(newStart, newEnd)
  }, 0)
}

function handleMarkdownLink() {
  const textarea = areaRef.value?.textarea
  if (!textarea) return

  const value = textarea.value
  const start = textarea.selectionStart ?? 0
  const end = textarea.selectionEnd ?? start
  const selectedText = value.substring(start, end)

  // 현재 상태를 히스토리에 저장
  saveToHistory(value, start)

  let newText: string
  let newStart: number
  let newEnd: number

  if (selectedText) {
    // 선택된 텍스트가 있는 경우: 링크 텍스트로 사용
    newText = value.substring(0, start) + `[${selectedText}](url)` + value.substring(end)
    newStart = start + selectedText.length + 3 // '](' 이후 위치
    newEnd = newStart + 3 // 'url' 길이
  } else {
    // 선택된 텍스트가 없는 경우: 빈 링크 삽입
    newText = value.substring(0, start) + '[text](url)' + value.substring(end)
    newStart = start + 1 // '[' 이후 위치
    newEnd = newStart + 4 // 'text' 길이
  }

  updateFromUserInput(newText, newStart)
  setTimeout(() => {
    textarea.setSelectionRange(newStart, newEnd)
  }, 0)
}

// 히스토리 관리 함수들
function saveToHistory(text: string, position: number) {
  // 중복 저장 방지 (동일한 텍스트는 저장하지 않음)
  const lastItem = history.value[history.value.length - 1]
  if (history.value.length > 0 && lastItem && lastItem.text === text) {
    return
  }

  // 현재 위치 이후의 히스토리 제거 (새로운 분기 생성)
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }

  // 새로운 상태 추가
  history.value.push({ text, position })
  historyIndex.value = history.value.length - 1

  // 최대 크기 제한
  if (history.value.length > maxHistorySize) {
    history.value.shift()
    historyIndex.value--
  }
}

function handleUndo() {
  const textarea = areaRef.value?.textarea
  if (!textarea || historyIndex.value <= 0) return

  historyIndex.value--
  const historyItem = history.value[historyIndex.value]
  if (historyItem) {
    updateFromUserInput(historyItem.text, historyItem.position)
    setTimeout(() => {
      textarea.setSelectionRange(historyItem.position, historyItem.position)
    }, 0)
  }

  // 마크다운 토글 상태 초기화
  lastMarkdownAction.value = null
}

function handleRedo() {
  const textarea = areaRef.value?.textarea
  if (!textarea || historyIndex.value >= history.value.length - 1) return

  historyIndex.value++
  const historyItem = history.value[historyIndex.value]
  if (historyItem) {
    updateFromUserInput(historyItem.text, historyItem.position)
    setTimeout(() => {
      textarea.setSelectionRange(historyItem.position, historyItem.position)
    }, 0)
  }

  // 마크다운 토글 상태 초기화
  lastMarkdownAction.value = null
}
</script>

<style scoped>
.prompt-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.35);
}

.prompt-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #4b5563;
  background-color: rgba(55, 65, 81, 0.6);
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}

.prompt-panel__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #d1d5db;
}

.prompt-panel__copy {
  padding: 0.3rem 0.9rem;
  border-radius: 0.5rem;
  border: 0;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  background-image: linear-gradient(120deg, #0891b2, #2563eb);
  color: #fff;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.prompt-panel__copy:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(8, 145, 178, 0.35);
}

.prompt-panel__editor {
  position: relative;
  flex: 1;
  min-height: 16rem;
  overflow: hidden;
}
</style>
