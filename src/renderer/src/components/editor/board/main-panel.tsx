import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useRef, useState } from 'react'

interface EditorInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onForceRefresh: () => void
  onToggleSplitView: () => void
  onToggleHtmlView: () => void
  isSplitView: boolean
}

export function EditorInput({
  value,
  onChange,
  textareaRef,
  onForceRefresh,
  onToggleSplitView,
  onToggleHtmlView,
  isSplitView
}: EditorInputProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const scrollPosition = useRef({ top: 0, left: 0 })
  const selectionPosition = useRef({ start: 0, end: 0 })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Save current scroll and selection positions
    if (textareaRef.current) {
      scrollPosition.current = {
        top: textareaRef.current.scrollTop,
        left: textareaRef.current.scrollLeft
      }
      selectionPosition.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      }
    }

    onChange(e)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    onForceRefresh() // Trigger refresh
    setTimeout(() => setIsRefreshing(false), 300) // Visual feedback
  }
  // to preserve scroll position

  return (
    <div className="h-full flex flex-col relative">
      <textarea
        ref={textareaRef}
        className="flex-1 p-4 font-mono text-sm w-full focus:outline-none resize-none bg-white text-gray-800 dark:text-gray-100 dark:bg-gray-900 pr-10"
        value={value}
        onChange={handleChange}
        spellCheck="false"
      />
      <div className="absolute right-0 top-0 h-full w-8 flex flex-col items-start justify-start pt-2 group">
        <button
          className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Toggle fullscreen"
        >
          {isSplitView ? (
            <ArrowsPointingOutIcon onClick={onToggleSplitView} className="h-5 w-5" />
          ) : (
            <ArrowsPointingInIcon onClick={onToggleSplitView} className="h-5 w-5" />
          )}
        </button>
        <button
          className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Toggle HTML View"
        >
          {!isSplitView && <EyeIcon onClick={onToggleHtmlView} className="h-5 w-5" />}
        </button>
        <button
          className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Refresh Markdown View"
        >
          {isSplitView && (
            <ArrowPathIcon
              onClick={handleRefresh}
              className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          )}
        </button>
      </div>
    </div>
  )
}
