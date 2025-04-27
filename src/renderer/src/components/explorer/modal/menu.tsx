// components/explorer/context/menu.tsx
import { useEffect } from 'react'

type MenuPosition = {
  x: number
  y: number
}

type ContextMenuProps = {
  position: MenuPosition
  onClose: () => void
  onCreateFile: () => void
  onCreateFolder: () => void
  onDeleteFolder: () => void
  onRenameFolder: () => void
  hasFolderSelected: boolean
  hasFileSelected: boolean
  onDeleteFile: () => void
  onRenameFile: () => void
}

export const ContextMenu = ({
  position,
  onClose,
  onCreateFile,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  hasFolderSelected,
  hasFileSelected,
  onDeleteFile,
  onRenameFile
}: ContextMenuProps) => {
  useEffect(() => {
    const handleClickOutside = () => onClose()
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  // Handle delete actions with proper menu closing
  const handleDeleteAction = (deleteHandler: () => void) => {
    onClose() // Close menu first
    setTimeout(() => deleteHandler(), 10) // Small delay to ensure menu is closed
  }

  return (
    <div
      className="fixed bg-white dark:bg-gray-600 shadow-lg rounded-md py-1 z-50 w-48 border border-gray-200 dark:border-sky-100"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {!hasFileSelected && (
        <>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            onClick={(e) => {
              e.stopPropagation()
              onCreateFile()
              onClose()
            }}
          >
            New File
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            onClick={(e) => {
              e.stopPropagation()
              onCreateFolder()
              onClose()
            }}
          >
            New Folder
          </button>
        </>
      )}
      {hasFileSelected && (
        <>
          <button
            className="w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm"
            onClick={(e) => {
              e.stopPropagation()
              onRenameFile()
              onClose()
            }}
          >
            Rename
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 text-sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteAction(onDeleteFile) // Use the new handler
            }}
          >
            Delete File
          </button>
        </>
      )}
      {hasFolderSelected && (
        <>
          <button
            className="w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm"
            onClick={(e) => {
              e.stopPropagation()
              onRenameFolder()
              onClose()
            }}
          >
            Rename
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 text-sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteAction(onDeleteFolder) // Use the new handler
            }}
          >
            Delete Folder
          </button>
        </>
      )}
    </div>
  )
}
