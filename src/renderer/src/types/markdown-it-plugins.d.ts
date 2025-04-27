declare module 'markdown-it-task-lists' {
  import MarkdownIt from 'markdown-it'
  const taskLists: (md: MarkdownIt) => void
  export = taskLists
}

declare module 'markdown-it-implicit-figures' {
  import MarkdownIt from 'markdown-it'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const implicitFigures: (md: MarkdownIt, options?: any) => void
  export = implicitFigures
}
