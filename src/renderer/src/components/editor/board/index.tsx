import { useEffect, useRef, useState } from 'react'
import { EditorPreview } from './preview-panel'
import EditorHeader from '../header/editor_header'
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { EditorInput } from './main-panel'
import { FullscreenHtmlView } from './full-screen'
import { EditorToggleButton } from './toggle-button'
import { SplitViewHandle } from './split-handler'
import { EditorProps } from '../types'

export function Editor({
  filePath,
  content: initialContent,
  onChange,
  isExplorerOpen,
  onToggleExplorer
}: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState(initialContent)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSplitView, setIsSplitView] = useState(true)
  const [isHtmlView, setIsHtmlView] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  const handleForceRefresh = () => {
    setRefreshKey((prev) => prev + 1) // This will force preview to remount
  }

  useEffect(() => {
    setValue(initialContent)
  }, [initialContent])

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleToggleSplitView = () => {
    setIsSplitView(!isSplitView)
  }

  const handleToggleHtmlView = () => {
    setIsHtmlView(!isHtmlView)
    if (!isHtmlView) {
      setIsSplitView(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange(newValue)
  }

  const handleInsertSnippet = (snippet: string) => {
    if (!textareaRef.current) return

    // Save current state
    const textarea = textareaRef.current
    const { scrollTop, scrollLeft, selectionStart, selectionEnd, value } = textarea

    // Determine if we need newlines (for code blocks, lists, etc.)
    const isBlockElement =
      snippet.includes('```') ||
      snippet.startsWith('- ') ||
      snippet.startsWith('1. ') ||
      snippet.startsWith('> ')

    // Calculate new value with proper spacing
    const before = value.substring(0, selectionStart)
    const after = value.substring(selectionEnd)

    const needsLeadingNewline = isBlockElement && selectionStart > 0 && !before.endsWith('\n')

    const needsTrailingNewline =
      isBlockElement && selectionEnd < value.length && !after.startsWith('\n')

    const formattedSnippet =
      (needsLeadingNewline ? '\n' : '') + snippet + (needsTrailingNewline ? '\n' : '')

    // Calculate new cursor position
    let newCursorPos = selectionStart + formattedSnippet.length

    // Special handling for code blocks
    if (snippet.includes('```')) {
      const firstNewlinePos = formattedSnippet.indexOf('\n')
      if (firstNewlinePos > -1) {
        newCursorPos = selectionStart + firstNewlinePos + 1
      }
    }

    // Create new value
    const newValue =
      value.substring(0, selectionStart) + formattedSnippet + value.substring(selectionEnd)

    // Update state
    setValue(newValue)
    onChange(newValue)

    // Restore UI state after React update
    setTimeout(() => {
      if (textareaRef.current) {
        // Restore focus and scroll position first
        textareaRef.current.focus()
        textareaRef.current.scrollTop = scrollTop
        textareaRef.current.scrollLeft = scrollLeft

        // Set cursor position
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a file to start editing
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col border-r relative">
      <EditorToggleButton isExplorerOpen={isExplorerOpen} onToggleExplorer={onToggleExplorer} />

      <EditorHeader
        filePath={filePath}
        onInsertSnippet={handleInsertSnippet}
        onExport={() => console.log('Export clicked')}
        onToggleTheme={handleToggleTheme}
        onToggleSplitView={handleToggleSplitView}
        isSplitView={isSplitView}
      />

      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={isSplitView ? 50 : 100}
          minSize={40}
          className={`relative transition-all duration-300 ease-in-out ${
            isSplitView ? '' : 'flex-grow'
          }`}
          order={1}
          id="editor-panel"
        >
          <EditorInput
            value={value}
            onChange={handleChange}
            textareaRef={textareaRef}
            onForceRefresh={handleForceRefresh}
            onToggleSplitView={handleToggleSplitView}
            onToggleHtmlView={handleToggleHtmlView}
            isSplitView={isSplitView}
          />
        </ResizablePanel>

        {isHtmlView && <FullscreenHtmlView content={value} onClose={handleToggleHtmlView} />}

        {isSplitView && (
          <>
            <SplitViewHandle />
            <ResizablePanel
              defaultSize={50}
              minSize={40}
              className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
              order={2}
              id="preview-panel"
            >
              <EditorPreview key={refreshKey} content={value} isHtmlView={isHtmlView} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
