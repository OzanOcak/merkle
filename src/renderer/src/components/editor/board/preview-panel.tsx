import { useStore } from '@/store'
import { MarkdownRenderer } from '../markdown_renderer'
import LatexMathGuide from './latex-guide'

interface EditorPreviewProps {
  content: string
  isHtmlView: boolean
}

export function EditorPreview({ content, isHtmlView }: EditorPreviewProps) {
  const latex = useStore((state) => state.latex)
  return (
    <div className={`h-full flex flex-col ${isHtmlView ? 'flex-grow' : ''}`}>
      <div className="flex-1 overflow-auto p-8 prose max-w-none dark:prose-invert">
        {latex ? (
          <LatexMathGuide />
        ) : (
          <MarkdownRenderer content={content} className="p-4 overflow-auto" />
        )}
      </div>
    </div>
  )
}
