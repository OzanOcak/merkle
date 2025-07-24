import 'mermaid'

declare global {
  interface Window {
    mermaid: typeof import('mermaid')
  }
}
export interface Todo {
  id: number
  title: string
  completed: number // 0 or 1
  createdAt?: string
  // Add any other fields you need
}
