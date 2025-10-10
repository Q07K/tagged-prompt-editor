export type PromptNode = PromptElementNode | PromptTextNode

export interface PromptBaseNode {
  id: number
  enabled: boolean
}

export interface PromptTextNode extends PromptBaseNode {
  type: 'text'
  content: string
}

export interface PromptElementNode extends PromptBaseNode {
  type: 'element'
  tagName: string
  children: PromptNode[]
}

export function isElementNode(node: PromptNode): node is PromptElementNode {
  return node.type === 'element'
}

export function isTextNode(node: PromptNode): node is PromptTextNode {
  return node.type === 'text'
}
