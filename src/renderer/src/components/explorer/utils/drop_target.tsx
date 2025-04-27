import { useDrop } from 'react-dnd'
import { useRef } from 'react'
import { ItemTypes } from './types'

interface DraggedItem {
  path: string[]
  name: string
  isFolder: boolean
}

interface DropTargetProps {
  path: string[]
  onDropItem: (item: DraggedItem, targetPath: string[]) => void
  children: React.ReactNode
}

export const DropTarget: React.FC<DropTargetProps> = ({ path, onDropItem, children }) => {
  const dropRef = useRef<HTMLDivElement>(null)
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.FILE, ItemTypes.FOLDER],
    drop: (item: DraggedItem) => {
      if (canDropItem(item.path, path)) {
        onDropItem(item, path)
      }
    },
    canDrop: (item: DraggedItem) => canDropItem(item.path, path),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  }))

  drop(dropRef)

  return (
    <div
      ref={dropRef}
      className={`${isOver && canDrop ? 'bg-blue-100' : ''} ${
        isOver && !canDrop ? 'bg-red-100 opacity-50' : ''
      }`}
    >
      {children}
    </div>
  )
}

function canDropItem(itemPath: string[], targetPath: string[]): boolean {
  const itemPathStr = itemPath.join('/')
  const targetPathStr = targetPath.join('/')

  return itemPathStr !== targetPathStr && !targetPathStr.startsWith(itemPathStr + '/')
}
