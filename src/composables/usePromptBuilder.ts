import { escapeHtml } from '@/utils/htmlEscape'
import type { PromptNode } from '@/utils/tagHelpers'
import { isElementNode, isTextNode } from '@/utils/tagHelpers'

export function buildNodeString(node: PromptNode, indent = 0, useOriginalIndent = false): string {
  if (useOriginalIndent) {
    // 원본 인덴테이션을 최대한 보존
    return buildNodeStringPreservingIndent(node, indent)
  }

  const indentStr = ' '.repeat(indent * 4)

  if (!isElementNode(node)) {
    const value = node.content.trim()
    return value ? `${indentStr}${value}` : ''
  }

  const tagName = node.tagName || 'div'
  if (node.children.length === 0) {
    return `${indentStr}<${tagName}></${tagName}>`
  }

  const singleTextChild = node.children.length === 1 ? node.children[0] : undefined

  if (singleTextChild && isTextNode(singleTextChild) && !singleTextChild.content.includes('\n')) {
    const value = singleTextChild.content.trim()
    return `${indentStr}<${tagName}>${value}</${tagName}>`
  }

  const children = node.children
    .map((child) => buildNodeString(child, indent + 1, useOriginalIndent))
    .filter(Boolean)
  const body = children.join('\n')
  return `${indentStr}<${tagName}>\n${body}\n${indentStr}</${tagName}>`
}

function buildNodeStringPreservingIndent(node: PromptNode, baseIndent = 0): string {
  if (!isElementNode(node)) {
    // 텍스트 노드의 경우 원본 내용을 그대로 유지하되, 빈 라인은 제거
    return node.content.replace(/^\s*\n|\n\s*$/g, '') // 시작과 끝의 빈 라인만 제거
  }

  const tagName = node.tagName || 'div'
  const baseIndentStr = ' '.repeat(baseIndent * 4)

  if (node.children.length === 0) {
    return `${baseIndentStr}<${tagName}></${tagName}>`
  }

  const singleTextChild = node.children.length === 1 ? node.children[0] : undefined

  if (singleTextChild && isTextNode(singleTextChild) && !singleTextChild.content.includes('\n')) {
    return `${baseIndentStr}<${tagName}>${singleTextChild.content.trim()}</${tagName}>`
  }

  // 여러 자식이 있는 경우, 각 자식의 원본 형태를 최대한 보존
  const children = node.children
    .map((child) => {
      if (isTextNode(child)) {
        // 텍스트 노드는 원본 그대로 but 빈 텍스트는 필터링
        return child.content.trim() ? child.content : null
      } else {
        // 엘리먼트 노드는 재귀적으로 처리
        return buildNodeStringPreservingIndent(child, baseIndent + 1)
      }
    })
    .filter(Boolean)

  const body = children.join('\n')
  return `${baseIndentStr}<${tagName}>\n${body}\n${baseIndentStr}</${tagName}>`
}

export function buildRawTextHtml(node: PromptNode, indent = 0, parentDisabled = false): string {
  const isDisabled = parentDisabled || node.enabled === false

  if (!isElementNode(node)) {
    // 텍스트 노드의 경우 원본 내용을 완전히 보존 (들여쓰기, 줄바꿈, 공백 모두 포함)
    const content = node.content
    if (content === '') return '' // 완전히 빈 문자열만 제외

    // 텍스트 노드의 경우 자체 enabled 상태 확인
    const textDisabled = parentDisabled || node.enabled === false
    const textSpanClass = textDisabled ? 'raw-text-disabled' : ''

    // 공백만 있는 경우와 내용이 있는 경우 모두 처리
    if (!content.trim()) {
      // 공백, 줄바꿈, 들여쓰기만 있는 경우 span 없이 그대로 보존
      return escapeHtml(content)
    } else {
      // 실제 내용이 있는 경우 span으로 감싸서 스타일 적용
      return `<span class="${textSpanClass}">${escapeHtml(content)}</span>`
    }
  }

  const tagName = node.tagName || 'div'
  const spanClass = isDisabled ? 'raw-text-disabled' : ''

  if (node.children.length === 0) {
    return `<span class="tag-highlight ${spanClass}">${escapeHtml(`<${tagName}></${tagName}>`)}</span>`
  }

  const singleTextChild = node.children.length === 1 ? node.children[0] : undefined

  if (singleTextChild && isTextNode(singleTextChild) && !singleTextChild.content.includes('\n')) {
    const value = singleTextChild.content.trim()
    // 태그와 텍스트를 분리해서 처리
    const openTag = `<span class="tag-highlight ${spanClass}">${escapeHtml(`<${tagName}>`)}</span>`
    const closeTag = `<span class="tag-highlight ${spanClass}">${escapeHtml(`</${tagName}>`)}</span>`

    // 텍스트 부분은 자식 노드의 enabled 상태에 따라 처리
    const textDisabled = isDisabled || singleTextChild.enabled === false
    const textSpanClass = textDisabled ? 'raw-text-disabled' : ''
    const textContent = `<span class="${textSpanClass}">${escapeHtml(value)}</span>`

    return `${openTag}${textContent}${closeTag}`
  }

  // 자식 노드들을 처리하되 원본 구조 완전 보존
  const parts = node.children.map((child) => buildRawTextHtml(child, indent + 1, isDisabled))

  const open = `<span class="tag-highlight ${spanClass}">${escapeHtml(`<${tagName}>`)}</span>`
  const close = `<span class="tag-highlight ${spanClass}">${escapeHtml(`</${tagName}>`)}</span>`

  // 자식 노드들 사이의 모든 구조를 그대로 유지
  return `${open}${parts.join('')}${close}`
}

export function buildCopyableText(nodes: PromptNode[]): string {
  return nodes
    .filter((node) => node.enabled !== false)
    .map((node) => buildNodeString(node))
    .filter(Boolean)
    .join('\n\n')
}
