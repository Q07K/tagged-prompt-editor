import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { parsePrompt, cloneNodes } from '@/composables/usePromptParser'
import {
  buildCopyableText,
  buildRawTextHtml,
} from '@/composables/usePromptBuilder'
import {
  getOpenTags,
  shouldTriggerAutoComplete,
} from '@/composables/useTagAutoComplete'
import { escapeHtml } from '@/utils/htmlEscape'
import { INITIAL_PROMPT } from '@/utils/constants'
import type { PromptNode } from '@/utils/tagHelpers'
import { isElementNode, isTextNode } from '@/utils/tagHelpers'

interface SuggestionAnchor {
  top: number
  left: number
  height: number
}

const defaultAnchor: SuggestionAnchor = { top: 0, left: 0, height: 0 }

export const usePromptEditorStore = defineStore('promptEditor', () => {
  const rawText = ref(INITIAL_PROMPT)
  const parsedNodes = ref<PromptNode[]>([])
  const suggestions = ref<string[]>([])
  const activeSuggestionIndex = ref(-1)
  const suggestionAnchor = ref<SuggestionAnchor>({ ...defaultAnchor })
  const nextId = ref(0)

  const generateId = () => nextId.value++

  function parseAndSet(text: string) {
    nextId.value = 0
    parsedNodes.value = parsePrompt(text, { idFactory: generateId })
  }

  parseAndSet(rawText.value)

  const rawTextHtml = computed(() => {
    if (!parsedNodes.value.length) {
      return rawText.value ? escapeHtml(rawText.value) : ''
    }
    return parsedNodes.value.map((node) => buildRawTextHtml(node)).join('')
  })

  const copyableText = computed(() => buildCopyableText(parsedNodes.value))
  const isSuggestionVisible = computed(() => suggestions.value.length > 0)

  function updateFromUserInput(value: string, caret: number) {
    // 텍스트가 변경되지 않았다면 파싱하지 않음 (드래그 등의 경우)
    if (rawText.value === value) {
      updateSuggestions(value, caret)
      return
    }

    rawText.value = value
    parseAndSet(value)
    updateSuggestions(value, caret)
  }

  function updateSuggestions(value: string, caret: number) {
    if (!shouldTriggerAutoComplete({ value, position: caret })) {
      hideSuggestions()
      return
    }

    const tags = getOpenTags(value, caret - 2)
    if (tags.length === 0) {
      hideSuggestions()
      return
    }

    suggestions.value = tags
    activeSuggestionIndex.value = 0
  }

  function setSuggestionAnchor(anchor: SuggestionAnchor) {
    suggestionAnchor.value = { ...anchor }
  }

  function hideSuggestions() {
    suggestions.value = []
    activeSuggestionIndex.value = -1
    suggestionAnchor.value = { ...defaultAnchor }
  }

  function moveSuggestion(delta: number) {
    if (!suggestions.value.length) return
    const length = suggestions.value.length
    activeSuggestionIndex.value =
      (activeSuggestionIndex.value + delta + length) % length
  }

  function getActiveSuggestion(): string | null {
    if (activeSuggestionIndex.value < 0) return null
    return suggestions.value[activeSuggestionIndex.value] ?? null
  }

  function refreshNodes() {
    parsedNodes.value = cloneNodes(parsedNodes.value)
  }

  /**
   * 태그 블록에서 변경이 발생할 시 사용하는 함수
   *
   * @returns {void}
   */
  function rebuildTextFromNodes(): void {
    // 원본 텍스트의 구조를 최대한 보존하면서 재구성
    const newText = parsedNodes.value
      .map((node) => {
        if (isElementNode(node)) {
          // 엘리먼트 노드는 들여쓰기 없이 재구성
          return buildNodeStringFlat(node)
        } else {
          // 텍스트 노드는 원본 그대로 하되 앞뒤 공백 제거
          return node.content
        }
      })
      .join('')
    rawText.value = newText

    // 파싱된 노드들을 다시 파싱하여 구조를 최신 상태로 유지
    parseAndSet(newText)
  }

  /**
   * 노드를 들여쓰기 없이 평탄하게 문자열로 변환
   *
   * @param node - 변환할 PromptNode
   * @returns {string} 변환된 문자열
   */
  function buildNodeStringFlat(node: PromptNode): string {
    // 텍스트 노드인 경우 내용만 반환
    if (!isElementNode(node)) {
      return node.content.trim()
    }

    const tagName = node.tagName || 'div'

    if (node.children.length === 0) {
      return `<${tagName}></${tagName}>`
    }

    const singleTextChild =
      node.children.length === 1 ? node.children[0] : undefined

    if (
      singleTextChild &&
      isTextNode(singleTextChild) &&
      !singleTextChild.content.includes('\n')
    ) {
      // 자식이 하나이고 그것이 개행을 포함하지 않는 텍스트 노드인 경우
      const value = singleTextChild.content.trim()
      return `<${tagName}>${value}</${tagName}>`
    }

    // 여러 자식이 있는 경우 또는 자식이 개행을 포함하는 경우
    const children = node.children
      .map((child) => {
        if (isTextNode(child)) {
          // 텍스트 노드인 경우 내용만 반환
          return child.content
        } else {
          // 엘리먼트 노드인 경우 재귀적으로 처리
          return buildNodeStringFlat(child)
        }
      })
      .filter(Boolean)

    // 모든 자식을 합쳐서 반환
    const body = children.join('')
    return `<${tagName}>${body}</${tagName}>`
  }

  function findNodeById(
    id: number,
    nodes: PromptNode[] = parsedNodes.value,
  ): PromptNode | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (isElementNode(node)) {
        const candidate = findNodeById(id, node.children)
        if (candidate) return candidate
      }
    }
    return null
  }

  function updateTagName(id: number, tagName: string) {
    const target = findNodeById(id)
    if (!target || !isElementNode(target)) return
    target.tagName = tagName.trim() || 'div'
    refreshNodes()
    rebuildTextFromNodes() // 태그명 변경 시에만 텍스트 재구성
  }

  function setNodeEnabled(id: number, enabled: boolean) {
    const target = findNodeById(id)
    if (!target) return
    target.enabled = enabled
    refreshNodes()
    // enabled 상태 변경은 텍스트에 반영하지 않음
  }

  function updateTextContent(id: number, content: string) {
    const target = findNodeById(id)
    if (!target || isElementNode(target)) return
    target.content = content
    refreshNodes()
    rebuildTextFromNodes() // 텍스트 내용 변경 시에만 텍스트 재구성
  }

  function appendChildTextNode(
    parentId: number,
    content: string,
  ): number | null {
    const parent = findNodeById(parentId)
    if (!parent || !isElementNode(parent)) return null
    const id = generateId()
    parent.children.push({
      id,
      type: 'text',
      content,
      enabled: true,
    })
    refreshNodes()
    rebuildTextFromNodes() // 새 노드 추가 시에만 텍스트 재구성
    return id
  }

  return {
    rawText,
    rawTextHtml,
    parsedNodes,
    suggestions,
    suggestionAnchor,
    isSuggestionVisible,
    activeSuggestionIndex,
    copyableText,
    updateFromUserInput,
    hideSuggestions,
    moveSuggestion,
    getActiveSuggestion,
    setSuggestionAnchor,
    updateTagName,
    setNodeEnabled,
    updateTextContent,
    appendChildTextNode,
    updateSuggestions,
  }
})
