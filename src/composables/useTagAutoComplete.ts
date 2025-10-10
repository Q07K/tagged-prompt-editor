interface CaretContext {
  value: string
  position: number
}

export function shouldTriggerAutoComplete(context: CaretContext): boolean {
  const { value, position } = context
  if (position < 2) return false
  return value.substring(position - 2, position) === '</'
}

export function getOpenTags(value: string, cursorPosition: number): string[] {
  const content = value.substring(0, cursorPosition)
  const stack: string[] = []
  const pattern = /<\/?([^<>\s\/]+)[\s\S]*?>/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(content)) !== null) {
    const tagName = match[1]
    const token = match[0]

    if (!tagName) continue

    if (token.startsWith('</')) {
      if (stack.length && stack[stack.length - 1] === tagName) {
        stack.pop()
      }
    } else if (!token.endsWith('/>')) {
      stack.push(tagName)
    }
  }

  return stack.reverse()
}
