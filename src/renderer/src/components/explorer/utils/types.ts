export type FolderType = { name: string; folders?: FolderType[] }

export type File = {
  name: string
  type: 'file'
}

export type Folder = {
  name: string
  type: 'folder'
  children: Node[]
}

export type Node = File | Folder

export type FileDragItem = {
  type: 'file'
  path: string[]
  name: string // Just need the name for files
  originalPath: string[]
}

export type FolderDragItem = {
  type: 'folder'
  path: string[]
  folder: FolderType // Your existing folder type
  originalPath: string[]
}

export type DragItem = FileDragItem | FolderDragItem

export const ItemTypes = {
  FILE: 'file',
  FOLDER: 'folder'
} as const

export type TreeNodeProps = {
  folder: FolderType
  currentPath: string[] // Now only currentPath is needed
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
