// components/explorer/tree_nodes.tsx
import { FolderIcon, DocumentIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { addFileToPath, addItemToPath, deleteItemAtPath, findFolder } from './tree/tree_queries'
import { useDrag, useDrop } from 'react-dnd'
import { DragItem, ItemTypes, TreeNodeProps } from './utils/types'
import { useStore } from '@/store'

interface DropResult {
  path: string[]
}

export function TreeNode({
  folder,
  currentPath = [],
  collapsedFolders,
  setCollapsedFolders,
  onFolderSelect,
  onFileSelect,
  selectedPath,
  handleContextMenu,
  renamingFolder,
  renamingFile,
  setFolders
}: TreeNodeProps & { renamingFolder: { path: string[] } | null }) {
  const isFolder = !!folder.folders
  const pathKey = currentPath.join('/')
  const selectedPathKey = selectedPath.join('/')

  // Only highlight if this is the exact selected folder
  const isSelected = selectedPathKey === pathKey
  const isCollapsed = collapsedFolders.has(pathKey)

  const actions = useStore((state) => state.actions)

  const isRenaming =
    renamingFolder?.path.join('/') === currentPath.join('/') ||
    renamingFile?.path.join('/') === currentPath.join('/')

  const isFile = !folder.folders

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: isFolder ? ItemTypes.FOLDER : ItemTypes.FILE,
      item: isFolder
        ? {
            type: ItemTypes.FOLDER,
            path: currentPath,
            folder: folder, // For folders we pass the full folder object
            originalPath: currentPath
          }
        : {
            type: ItemTypes.FILE,
            path: currentPath,
            name: folder.name, // For files we just need the name
            originalPath: currentPath
          },
      canDrag: !isRenaming,
      end: (_item, monitor) => {
        if (!monitor.didDrop()) {
          // Handle cancel if needed
        }
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging()
      })
    }),
    [isFolder, currentPath, folder, isRenaming]
  )

  const [{ isOver }, drop] = useDrop<DragItem, DropResult, { isOver: boolean }>(
    () => ({
      accept: [ItemTypes.FILE, ItemTypes.FOLDER],
      drop: (item: DragItem, monitor) => {
        if (!monitor.isOver({ shallow: true })) return undefined

        const dropResult = { path: currentPath }

        // Check if dropped in same location
        if (JSON.stringify(item.path) === JSON.stringify(currentPath)) {
          console.log('Dropped in same location - ignoring')
          return dropResult
        }

        // Check if dropping into child
        if (currentPath.join('/').startsWith(item.path.join('/') + '/')) {
          console.log('Cannot drop into child')
          return dropResult
        }

        if (!isFolder) return dropResult

        // Update Zustand store first
        try {
          if (item.type === ItemTypes.FOLDER) {
            actions.addFolderToPath(currentPath, item.folder.name)
            actions.deleteItemAtPath(item.path)
          } else {
            actions.addFileToPath(currentPath, item.name)
            actions.deleteItemAtPath(item.path)
          }
        } catch (error) {
          console.error('Error updating Zustand store:', error)
          return dropResult
        }

        setFolders((prev) => {
          const itemExists = !!findFolder(prev, item.path)
          if (!itemExists) {
            console.warn('Item no longer exists at source path')
            return prev
          }

          const prevCopy = JSON.parse(JSON.stringify(prev))
          const withoutItem = deleteItemAtPath(prevCopy, item.path)

          return item.type === ItemTypes.FOLDER
            ? addItemToPath(withoutItem, currentPath, item.folder)
            : addFileToPath(withoutItem, currentPath, item.name)
        })

        return dropResult
      },
      canDrop: (item: DragItem) => {
        return (
          isFolder &&
          item.path.join('/') !== currentPath.join('/') &&
          !currentPath.join('/').startsWith(item.path.join('/') + '/')
        )
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }) && monitor.canDrop()
      })
    }),
    [currentPath, setFolders, isFolder, actions]
  )

  if (isRenaming) {
    return null // The renaming input is handled at the Explorer level
  }

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isFolder) {
      onFolderSelect(currentPath) // Select the folder
      handleContextMenu(e, [...currentPath, folder.name])
    } else if (isFile) {
      onFileSelect?.(currentPath)
      handleContextMenu(e, currentPath)
    }
  }

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCollapsedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(pathKey)) {
        newSet.delete(pathKey)
      } else {
        newSet.add(pathKey)
      }
      return newSet
    })
  }

  const handleClick = (e: React.MouseEvent) => {
    console.log('clicked node')

    e.stopPropagation() // Prevent event from bubbling to parent
    if (isFolder) {
      onFolderSelect(currentPath)
    } else {
      onFileSelect?.(currentPath) // Call onFileSelect for files
    }
  }

  return (
    <li
      ref={(node) => {
        if (node) {
          drag(drop(node))
        }
      }}
      className={`my-1 text-xs font-semibold ${isDragging ? 'opacity-50' : ''} ${
        isOver ? 'bg-blue-100 dark:bg-blue-900' : ''
      } cursor-pointer`}
      onContextMenu={handleRightClick}
      onClick={handleClick}
    >
      <div
        className={`flex items-center gap-1.5 py-0.5 px-1 rounded ${
          isSelected ? 'bg-blue-100 text-gray-800 dark:bg-gray-600 dark:text-white' : ''
        } hover:bg-sky-100 dark:hover:bg-gray-700`}
      >
        {isFolder && folder.folders && folder.folders?.length > 0 ? (
          <button onClick={handleToggleCollapse}>
            <ChevronRightIcon
              className={`size-4 text-gray-800 font-semibold dark:text-gray-300 ${
                !isCollapsed ? 'rotate-90' : ''
              }`}
            />
          </button>
        ) : (
          <span className="w-4"></span>
        )}

        {isFolder ? (
          <FolderIcon className="size-5 text-sky-500 dark:text-sky-400" />
        ) : (
          <DocumentIcon className="ml-[-1.7px] size-4 text-gray-700 dark:text-gray-300" />
        )}
        <span className="truncate text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-white">
          {folder.name}
        </span>
      </div>
      {isFolder && !isCollapsed && folder.folders && (
        <ul className="pl-4">
          {folder.folders.map((subFolder) => (
            <TreeNode
              key={subFolder.name}
              folder={subFolder}
              currentPath={[...currentPath, subFolder.name]}
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
      )}
    </li>
  )
}
