// components/MarkdownEditor.tsx
import { useEffect, useState } from 'react'
import { ExplorerContainer } from './explorer'
import { Editor } from './editor/board'
import { useStore } from '@/store'
import { useFileContent } from '@/hooks/useFileContent'
import { useContentStore } from '@/store/content-store'

export default function MdEditor() {
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isExplorerOpen, setIsExplorerOpen] = useState(true)

  const fileName = useStore((state) => state.currentFileName)
  const { data: content /*, isLoading, error*/ } = useFileContent(fileName)
  const { currentContent, actions } = useContentStore()

  // Initialize content store when file changes
  useEffect(() => {
    if (fileName && fileContent) {
      actions.setContent(fileContent)
      setActiveFile(fileName)
    }
  }, [fileName, fileContent, actions])

  const handleFileSelect = (filePath: string) => {
    setActiveFile(filePath)
    setFileContent(`${content}`)
  }

  const toggleExplorer = () => {
    setIsExplorerOpen(!isExplorerOpen)
  }

  return (
    <div className="flex h-screen">
      {/* Explorer Panel with Transition */}
      <div
        className={`${
          isExplorerOpen ? 'w-53' : 'w-0'
        } bg-white  border-r transition-all duration-300 ease-in-out overflow-hidden flex flex-col`}
      >
        {isExplorerOpen && <ExplorerContainer onFileSelect={handleFileSelect} />}
      </div>

      {/* Editor Area */}
      <div className={`flex-1 ${!isExplorerOpen ? 'ml-0' : ''}`}>
        <Editor
          filePath={activeFile}
          content={currentContent || 'start writing here...'}
          onChange={setFileContent}
          isExplorerOpen={isExplorerOpen}
          onToggleExplorer={toggleExplorer}
        />
      </div>
    </div>
  )
}
