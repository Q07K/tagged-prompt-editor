import { marked } from 'marked'

marked.use({
  gfm: true,
  breaks: true,
})

export function renderMarkdown(source: string): string {
  return marked.parse(source ?? ' ') as string
}
