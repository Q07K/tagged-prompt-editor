import type { PromptNode } from '@/utils/tagHelpers'
import { isElementNode } from '@/utils/tagHelpers'

interface ParseOptions {
  idFactory: () => number
}

export function parsePrompt(source: string, options: ParseOptions): PromptNode[] {
  const { idFactory } = options

  function walk(text: string): PromptNode[] {
    const nodes: PromptNode[] = []
    const pattern = /<([^<>\s\/]+)[\s\S]*?>([\s\S]*?)<\/\1>/g
    let match: RegExpExecArray | null
    let lastIndex = 0

    while ((match = pattern.exec(text)) !== null) {
      const preceding = text.substring(lastIndex, match.index)
      if (preceding.length > 0) {
        // trim() 조건 제거하여 들여쓰기와 줄바꿈 보존
        nodes.push(createTextNode(preceding))
      }

      const tagName = match[1]
      if (!tagName) continue

      const body = match[2] ?? ''
      const elementNode = createElementNode(tagName, walk(body))
      nodes.push(elementNode)
      lastIndex = pattern.lastIndex
    }

    const trailing = text.substring(lastIndex)
    if (trailing.length > 0) {
      // trim() 조건 제거하여 들여쓰기와 줄바꿈 보존
      nodes.push(createTextNode(trailing))
    }

    if (nodes.length === 0 && text.length > 0) {
      // trim() 조건 제거
      return [createTextNode(text)]
    }

    return nodes
  }

  const createTextNode = (content: string) => ({
    id: idFactory(),
    type: 'text' as const,
    content,
    enabled: true,
  })

  const createElementNode = (tagName: string, children: PromptNode[]) => ({
    id: idFactory(),
    type: 'element' as const,
    tagName,
    children,
    enabled: true,
  })

  return walk(source)
}

export function cloneNodes(nodes: PromptNode[]): PromptNode[] {
  return nodes.map((node) => {
    if (isElementNode(node)) {
      return {
        ...node,
        children: cloneNodes(node.children),
      }
    }
    return { ...node }
  })
}
