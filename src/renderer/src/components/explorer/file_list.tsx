// components/explorer/body.tsx
import { deleteItemAtPath } from './tree/tree_queries'
import { useDrop } from 'react-dnd'
import { TreeNode } from './tree_node'
import { DragItem, FolderType } from './utils/types'
import { useStore } from '@/store'

interface FileListProps {
  folders: FolderType[]
  collapsedFolders: Set<string>
  setCollapsedFolders: React.Dispatch<React.SetStateAction<Set<string>>>
  onFolderSelect: (path: string[]) => void
  onFileSelect?: (path: string[]) => void
  selectedPath: string[]
  handleContextMenu: (e: React.MouseEvent, folderPath: string[]) => void
  renamingFolder: { path: string[] } | null
  renamingFile: { path: string[] } | null
  setFolders: React.Dispatch<React.SetStateAction<FolderType[]>>
}

// Use the interface for the component props
export const FileList = ({
  folders,
  collapsedFolders,
  setCollapsedFolders,
  onFolderSelect,
  onFileSelect,
  selectedPath,
  handleContextMenu,
  renamingFolder,
  renamingFile,
  setFolders
}: FileListProps) => {
  const actions = useStore((state) => state.actions)

  // { isOver }, drop
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['FOLDER', 'FILE'],
    drop: (item: DragItem, monitor) => {
      // Get the drop result (null if dropped outside valid targets)
      const didDrop = monitor.didDrop()

      // If dropped outside any valid target or in same root location
      if (!didDrop) {
        console.log('Item dropped outside valid targets - keeping in place')
        return
      }

      actions.deleteItemAtPath(item.path) // update local storage

      setFolders((prev) => {
        // Simply remove from old location - don't add to root
        return deleteItemAtPath([...prev], item.path)
      })
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }))

  const handleBackgroundRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    handleContextMenu(e, []) // Empty path for root
  }
  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className=" py-2"
      onContextMenu={handleBackgroundRightClick}
    >
      {isOver && <div className="text-sky-500">Drop here!</div>}
      <ul className="pl-1 ">
        {folders.map((folder) => (
          <TreeNode
            folder={folder}
            key={folder.name}
            currentPath={[folder.name]} // Initialize currentPath with the folder name
            collapsedFolders={collapsedFolders}
            setCollapsedFolders={setCollapsedFolders}
            onFolderSelect={onFolderSelect}
            onFileSelect={onFileSelect}
            selectedPath={selectedPath}
            handleContextMenu={handleContextMenu}
            renamingFolder={renamingFolder}
            renamingFile={renamingFile}
            setFolders={setFolders}
          />
        ))}
      </ul>
    </div>
  )
}
