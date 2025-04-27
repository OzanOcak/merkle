import { ArrowsPointingInIcon } from '@heroicons/react/24/outline'
import { MarkdownRenderer } from '../markdown_renderer'

interface FullscreenHtmlViewProps {
  content: string
  onClose: () => void
}

export function FullscreenHtmlView({ content, onClose }: FullscreenHtmlViewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 full-screen">
      <div className="h-full py-8 px-64 overflow-auto prose max-w-none dark:prose-invert">
        <MarkdownRenderer content={content} />
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-md bg-gray-200 dark:bg-gray-700"
        title="Exit fullscreen"
      >
        <ArrowsPointingInIcon className="h-5 w-5" />
      </button>
    </div>
  )
}
