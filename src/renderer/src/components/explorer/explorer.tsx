// components/explorer/explorer.tsx
import { ExplorerHeader } from './view/header'
import { useState } from 'react'
import {
  addFileToPath,
  addFolderToPath,
  addFolderToRoot,
  deleteFolderAtPath,
  findFolder,
  // initialFolders,
  renameFolderAtPath,
  deleteFileAtPath as deleteFileFromTree
  //deleteItemAtPath,
  // addItemToPath,
} from './tree/tree_queries'
import { FileList } from './file_list'
import { useContextMenu } from './hooks/useContextMenu'
import { ContextMenu } from './modal/menu'
import { useFileImport } from './hooks/useFileImport'
import { FolderType } from './utils/types'
import { useStore } from '@/store'
import { CreationInput } from './explorer_create_input'
import { RenameInput } from './explorer_rename_input'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import useRenameFile from '@/hooks/useRenameFile'
import { useContentStore } from '@/store/content-store'
import { useFileContent } from '@/hooks/useFileContent'
//import { DragItem } from "./utils/types";

// for example: ['folder1', 'file2.md']
interface ExplorerProps {
  onFileSelect: (filePath: string) => void
}

export function Explorer({ onFileSelect }: ExplorerProps) {
  const local_folders = useStore((state) => state.folders)
  const actions = useStore((state) => state.actions)
  //console.log(actions)

  const { mutate: deleteFileMutation } = useDeleteFile()
  const { mutate: renameFileMutation } = useRenameFile()

  const [folders, setFolders] = useState<FolderType[]>(local_folders)

  const [addingFile, setAddingFile] = useState<boolean>(false)
  const [newFileName, setNewFileName] = useState<string>('')
  const [addingFolder, setAddingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set())
  const [selectedPath, setSelectedPath] = useState<string[]>([])
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu() // modal

  const setContent = useContentStore((state) => state.actions.setContent)
  //const currentFileName = useStore((state) => state.currentFileName)
  {
    /*
  useEffect(() => {
    if (selectedPath.length > 0) {
      const fileName = selectedPath[selectedPath.length - 1];
      if (fileName !== currentFileName) {
        actions.setCurrentFile(fileName);
      }
    }
  }, [selectedPath, actions, currentFileName]);
*/
  }
  const { manualFetch } = useFileContent(null)

  const [renamingFolder, setRenamingFolder] = useState<{
    path: string[]
    oldName: string
  } | null>(null)

  const [renamingFile, setRenamingFile] = useState<{
    path: string[]
    oldName: string
  } | null>(null)

  const { handleImport } = useFileImport(
    (importedFiles) => {
      // Add files to the current selected path
      // Add Zustand updates for each imported file
      importedFiles.forEach((file) => {
        actions.addFileToPath(selectedPath, file.name)
      })
      setFolders((prev) => {
        return importedFiles.reduce((currentTree, file) => {
          return addFileToPath(currentTree, selectedPath, file.name)
        }, prev)
      })
    },
    {
      allowedExtensions: ['md', 'gif', 'png', 'jpg', 'jpeg', 'webp'],
      multiple: true
    }
  )

  const handleFileClick = async (path: string[]) => {
    const fileName = path[path.length - 1] // Extract filename (e.g., "notes.md")

    // 1. **SYNC** Update Zustand & UI state FIRST (before any async)

    // Update Zustand
    actions.setCurrentFile(fileName)
    // Then update local UI state
    setSelectedPath(path)
    onFileSelect(path.join('/')) // Notify parent immediately

    // 2. **ASYNC** Load content in the background (but don't block UI)
    manualFetch(fileName)
      .then((content) => {
        setContent(content) // Update content when ready
      })
      .catch((error) => {
        console.error('Failed to load file:', error)
      })
  }

  const handleNewFile = () => {
    // Clear selection if it's a file
    if (selectedPath.length > 0) {
      const selectedItem = findFolder(folders, selectedPath)
      if (selectedItem?.folders === undefined) {
        setSelectedPath([]) // Deselect if it's a file
      }
    }
    setAddingFile(true)
    setNewFileName('')
  }

  const handleAddFile = () => {
    let finalName = newFileName.trim()

    // Add .md extension if not present
    if (!finalName.includes('.')) {
      finalName += '.md'
    }

    if (finalName) {
      actions.addFileToTree(selectedPath, finalName)
      setFolders((prev) => {
        return selectedPath.length > 0
          ? addFileToPath(prev, selectedPath, finalName)
          : [...prev, { name: finalName }]
      })
    }

    setAddingFile(false)
    setSelectedPath([])
  }

  const handleNewFolder = () => {
    setAddingFolder(true)
    setNewFolderName('')
  }

  const handleAddFolder = () => {
    const folderName = newFolderName.trim()
    if (!folderName) return

    // Get the currently selected item (could be file, folder, or nothing)
    const selectedItem = selectedPath.length > 0 ? findFolder(folders, selectedPath) : null

    // Determine where to create the new folder:
    // - At root if nothing selected OR if a file is selected
    // - In selected folder if a folder is selected
    const shouldCreateAtRoot = !selectedItem || (selectedItem && !selectedItem.folders)

    // Update Zustand store (single source of truth)
    if (shouldCreateAtRoot) {
      actions.addFolderToRoot(folderName)
    } else {
      // Only create in path if we're sure it's a folder
      actions.addFolderToPath(selectedPath, folderName)
    }

    // Update local state to match Zustand
    setFolders((prev) => {
      return shouldCreateAtRoot
        ? addFolderToRoot(prev, folderName)
        : addFolderToPath(prev, selectedPath, folderName)
    })

    // Reset UI state
    setAddingFolder(false)
    setSelectedPath([])
  }

  const handleCollapseAll = () => {
    const foldersWithChildren: string[] = []

    const collectFolders = (items: FolderType[], path: string = '') => {
      items.forEach((item) => {
        if (item.folders && item.folders.length > 0) {
          const currentPath = path ? `${path}/${item.name}` : item.name
          foldersWithChildren.push(currentPath)
          collectFolders(item.folders, currentPath)
        }
      })
    }

    collectFolders(folders)
    setCollapsedFolders(new Set(foldersWithChildren))
  }

  const handleClickOutside = () => {
    setSelectedPath([]) // Clear selection
    closeContextMenu() // Close any open context menu
    setAddingFile(false)
    setAddingFolder(false)
    setRenamingFolder(null)
    setRenamingFile(null)
  }

  const handleDeleteFolder = async () => {
    if (selectedPath.length === 0) return

    if (confirm(`Delete folder ${selectedPath.join('/')} and all its contents?`)) {
      try {
        // Find the folder in your current state
        const folder = findFolder(folders, selectedPath)

        if (!folder || !folder.folders) return // Not a folder or doesn't exist

        // Collect all files in this folder (recursively if needed)
        const filesToDelete: string[] = []

        const collectFiles = (items: FolderType[], currentPath: string[] = []) => {
          items.forEach((item) => {
            if (item.folders) {
              // It's a subfolder - recurse
              collectFiles(item.folders, [...currentPath, item.name])
            } else {
              // It's a file - add to deletion list
              filesToDelete.push([...currentPath, item.name].join('/'))
            }
          })
        }

        collectFiles([folder]) // Start collection from the selected folder

        // Delete all files from backend
        for (const filePath of filesToDelete) {
          const fileName = filePath.split('/').pop()!
          await deleteFileMutation(fileName)
        }

        // Only after successful deletion of all files, update UI state
        actions.deleteFolderAtPath(selectedPath)
        setFolders((prev) => deleteFolderAtPath(prev, selectedPath))
        setSelectedPath([])
      } catch (error) {
        console.error('Error deleting folder contents:', error)
        alert('Failed to delete some files in the folder')
      }
    }
  }

  const handleRenameFolder = () => {
    if (!selectedPath.length) return
    const folder = findFolder(folders, selectedPath)
    if (folder) {
      actions.renameFolderAtPath(selectedPath, folder.name)
      setRenamingFolder({
        path: selectedPath,
        oldName: folder.name
      })
      setNewFolderName(folder.name)
    }
  }

  const handleRenameConfirm = () => {
    if (!renamingFolder || !newFolderName.trim()) return

    actions.renameFolderAtPath(selectedPath, newFolderName) // update local storage with zustand
    setFolders((prev) => renameFolderAtPath(prev, renamingFolder.path, newFolderName.trim()))
    setRenamingFolder(null)
    setSelectedPath([])
  }

  const handleDeleteFile = () => {
    if (selectedPath.length === 0) return

    const selectedItem = findFolder(folders, selectedPath)
    if (selectedItem?.folders === undefined) {
      const fileName = selectedPath[selectedPath.length - 1]
      // It's likely a file
      if (confirm(`Delete file ${selectedPath.join('/')}?`)) {
        actions.deleteFileAtPath(selectedPath)
        setFolders((prev) => deleteFileFromTree(prev, selectedPath))
        setSelectedPath([]) // Clear selection after deletion
      }
      // Call the mutation
      deleteFileMutation(fileName, {
        onSuccess: () => {
          // Update local state only after successful API call
          actions.deleteFileAtPath(selectedPath)
          setFolders((prev) => deleteFileFromTree(prev, selectedPath))
          actions.clearCurrentFile()
          setSelectedPath([])
        },
        onError: () => {
          alert('Failed to delete file')
        }
      })
    }
  }

  const handleRenameFile = () => {
    if (!selectedPath.length) return

    const file = findFolder(folders, selectedPath)
    if (file && file.folders === undefined) {
      // It's a file
      setRenamingFile({
        path: selectedPath,
        oldName: file.name
      })
      setNewFileName(file.name.replace(/\.md$/, '')) // Remove .md extension for editing
    }
  }

  const handleRenameFileConfirm = () => {
    if (!renamingFile || !newFileName.trim()) return

    let finalName = newFileName.trim()
    // Add .md extension if not present
    if (!finalName.includes('.')) {
      finalName += '.md'
    }

    // Optimistically update local state first
    actions.renameFolderAtPath(selectedPath, finalName) // rename file, folder same
    setFolders((prev) => renameFolderAtPath(prev, renamingFile.path, finalName))
    setRenamingFile(null)
    setSelectedPath([])
    renameFileMutation(
      {
        originalName: renamingFile.oldName,
        newName: finalName
      },
      {
        onSuccess: () => {
          console.log('Renamed successfully:')
          setRenamingFile(null)
          setSelectedPath([])
          // Update local state here
        },
        onError: () => {
          console.error('Rename failed:')
        }
      }
    )
  }

  // Check if a folder is currently selected
  const hasFolderSelected =
    selectedPath.length > 0 && findFolder(folders, selectedPath)?.folders !== undefined

  // Check if a file is currently selected
  const hasFileSelected =
    selectedPath.length > 0 && findFolder(folders, selectedPath)?.folders === undefined

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800" onClick={handleClickOutside}>
      <ExplorerHeader
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
        onCollapseAll={handleCollapseAll}
        onImport={handleImport}
      />

      {addingFile && (
        <CreationInput
          type="file"
          value={newFileName}
          onChange={setNewFileName}
          onSubmit={handleAddFile}
          onBlur={handleAddFile}
          fileExtension=".md"
        />
      )}

      {addingFolder && (
        <CreationInput
          type="folder"
          value={newFolderName}
          onChange={setNewFolderName}
          onSubmit={handleAddFolder}
          onBlur={handleAddFolder}
        />
      )}

      {renamingFolder && (
        <RenameInput
          type="folder"
          value={newFolderName}
          onChange={setNewFolderName}
          onSubmit={handleRenameConfirm}
          onBlur={handleRenameConfirm}
        />
      )}

      {renamingFile && (
        <RenameInput
          type="file"
          value={newFileName}
          oldValue={renamingFile.oldName}
          onChange={setNewFileName}
          onSubmit={handleRenameFileConfirm} // Parent closes input
          onBlur={handleRenameFileConfirm} // Close on blur too
          fileExtension=".md"
          onSuccess={() => {
            // Optional: Update local state after rename
            const finalName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`
            actions.renameFolderAtPath(selectedPath, finalName)
          }}
        />
      )}

      <div
        className="flex-1 overflow-y-auto text-gray-800 dark:text-gray-200"
        onContextMenu={(e) => {
          setSelectedPath([])
          handleContextMenu(e)
        }}
      >
        <FileList
          folders={folders}
          collapsedFolders={collapsedFolders}
          setCollapsedFolders={setCollapsedFolders}
          onFolderSelect={setSelectedPath}
          selectedPath={selectedPath}
          handleContextMenu={handleContextMenu}
          renamingFolder={renamingFolder}
          renamingFile={renamingFile}
          setFolders={setFolders}
          onFileSelect={handleFileClick}
        />
      </div>

      {contextMenu?.visible && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={closeContextMenu}
          onCreateFile={handleNewFile}
          onCreateFolder={handleNewFolder}
          onDeleteFolder={handleDeleteFolder}
          onRenameFolder={handleRenameFolder}
          hasFolderSelected={hasFolderSelected}
          hasFileSelected={hasFileSelected}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
        />
      )}
    </div>
  )
}
