declare module 'markdown-it-katex' {
  import MarkdownIt from 'markdown-it'

  const mk: (
    md: MarkdownIt,
    options?: {
      throwOnError?: boolean
      errorColor?: string
      displayMode?: boolean
      delimiters?: Array<{ left: string; right: string; display: boolean }>
    }
  ) => void

  export = mk
}
