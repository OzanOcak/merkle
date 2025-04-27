import { useState, useRef, useEffect } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'

import { useStore } from '@/store'
import { useContentStore } from '@/store/content-store'
import { exportAsMarkdown } from './utils/markdown'
import { exportAsDocx } from './utils/docx'
import { /* createMarkdownItInstance, */ exportAsHtml } from './utils/html'
import { exportAsPdf } from './utils/pdf'

export const ExportDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileName = useStore((state) => state.currentFileName)
  const content = useContentStore((state) => state.currentContent)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (type: 'markdown' | 'pdf' | 'docx' | 'html') => {
    if (!fileName || !content) return

    try {
      switch (type) {
        case 'markdown':
          exportAsMarkdown(content, fileName)
          break
        case 'pdf': {
          // const md = createMarkdownItInstance() // Create MarkdownIt instance
          // const processedHtml = md.render(content) // Render Markdown to HTML
          // await exportAsPdf(processedHtml, `${fileName}.pdf`) // Pass HTML to exportAsPdf
          exportAsPdf(content, fileName)
          break
        }
        case 'docx':
          await exportAsDocx(content, fileName)
          break
        case 'html':
          exportAsHtml(content, fileName)
          break
      }
    } catch (error) {
      console.error(`Export failed (${type}):`, error)
      // Add toast/alert here if needed
    } finally {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-2 py-1.5 text-xs rounded-md bg-white dark:bg-gray-800
         text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border
       border-gray-300 dark:border-gray-600 transition-colors duration-200 ease-in-out"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <ArrowUpTrayIcon className="w-4 h-4 mr-2 transition-transform duration-200" />
        Export
        <svg
          className={`ml-1 w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-20 mt-2 w-46 origin-top-right rounded-md bg-white
         dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
          transition-all duration-200 ease-in-out transform-gpu"
        >
          <div className="py-1 transition-opacity duration-200 ease-in-out">
            <button
              onClick={() => handleExport('markdown')}
              className="flex items-center w-full px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700  transition-colors duration-150 ease-in-out"
            >
              <span className="mr-2  transition-transform duration-150 hover:scale-110">📄</span>
              <span>Markdown (.md)</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center w-full px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="mr-2">📊</span>
              <span>PDF (.pdf)</span>
            </button>
            {/*   <button
              onClick={() => handleExport('docx')}
              className="flex items-center w-full px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="mr-2">📝</span>
              <span>Word (.docx)</span>
            </button>*/}
            <button
              onClick={() => handleExport('html')}
              className="flex items-center w-full px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
            >
              <span className="mr-2  transition-transform duration-150 hover:scale-110">🌐</span>
              <span>HTML (.html)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
