// components/editor/types.ts
export interface EditorProps {
  filePath: string | null
  content: string
  onChange: (content: string) => void
  isExplorerOpen: boolean
  onToggleExplorer: () => void
}

export interface EditorHeaderProps {
  filePath: string
  isSplitView: boolean
  isDarkMode: boolean
  onInsertSnippet: (snippet: string) => void
  onSave: () => void
  onExport: () => void
  onToggleTheme: () => void
  onToggleSplitView: () => void
}
