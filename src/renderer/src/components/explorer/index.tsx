// components/explorer/index.tsx
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Explorer } from './explorer'

interface ExplorerContainerProps {
  onFileSelect: (filePath: string) => void
}

export function ExplorerContainer({ onFileSelect }: ExplorerContainerProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full">
        <Explorer onFileSelect={onFileSelect} />
      </div>
    </DndProvider>
  )
}

/*
ExplorerContainer: Wraps with DnD provider

Explorer: Main state management

FileList: Top-level rendering container

TreeNode: Recursive node renderer
*/
