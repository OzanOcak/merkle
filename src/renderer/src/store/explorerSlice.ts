import {
  addFileToPath,
  addFileToTree,
  addFolderToPath,
  addFolderToRoot,
  deleteFileAtPath,
  deleteFolderAtPath,
  deleteItemAtPath,
  findFolder,
  initialFolders,
  renameFolderAtPath
} from '@/components/explorer/tree/tree_queries'
import { FolderType } from '@/components/explorer/utils/types'
import { StateCreator } from 'zustand'
import { StoreType } from '.'

export type ExplorerSlice = {
  folders: FolderType[]
  currentPath: string[]
  currentFileName: string | null
  latex: boolean
  actions: {
    // File operations
    addFileToPath: (path: string[], fileName: string) => void
    addFileToTree: (parentPath: string[], fileName: string) => void
    deleteFileAtPath: (path: string[]) => void

    // Folder operations
    addFolderToPath: (path: string[], folderName: string) => void
    addFolderToRoot: (folderName: string) => void
    deleteFolderAtPath: (path: string[]) => void
    renameFolderAtPath: (path: string[], newName: string) => void

    // Generic operations
    deleteItemAtPath: (path: string[]) => void

    // Navigation
    setCurrentPath: (path: string[]) => void
    findFolder: (path: string[]) => FolderType | null

    // State management
    resetFolders: () => void
    setFolders: (newFolders: FolderType[]) => void

    // Selected File (name only)
    setCurrentFile: (fileName: string | null) => void // Simplified
    clearCurrentFile: () => void

    //Latex Info Page
    setLatex: (latex: boolean) => void
  }
}

export const createExplorerSlice: StateCreator<
  StoreType,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  ExplorerSlice
> = (set, get) => ({
  // Initialize empty - Zustand will populate from localStorage or fallback to initialFolders
  folders: initialFolders,
  currentPath: [],
  currentFileName: null,
  latex: false,
  actions: {
    // File operations
    addFileToPath: (path, fileName) => {
      set((state) => ({
        folders: addFileToPath(state.folders, path, fileName)
      }))
    },
    addFileToTree: (parentPath, fileName) => {
      set((state) => ({
        folders: addFileToTree(state.folders, parentPath, fileName)
      }))
    },
    deleteFileAtPath: (path) => {
      set((state) => ({
        folders: deleteFileAtPath(state.folders, path)
      }))
    },

    // Folder operations
    addFolderToPath: (path, folderName) => {
      set((state) => ({
        folders: addFolderToPath(state.folders, path, folderName)
      }))
    },
    addFolderToRoot: (folderName) => {
      set((state) => ({
        folders: addFolderToRoot(state.folders, folderName)
      }))
    },
    deleteFolderAtPath: (path) => {
      set((state) => ({
        folders: deleteFolderAtPath(state.folders, path)
      }))
    },
    renameFolderAtPath: (path, newName) => {
      set((state) => ({
        folders: renameFolderAtPath(state.folders, path, newName)
      }))
    },

    // Generic operation
    deleteItemAtPath: (path) => {
      set((state) => ({
        folders: deleteItemAtPath(state.folders, path)
      }))
    },

    // Navigation
    setCurrentPath: (path) => set({ currentPath: path }),
    findFolder: (path) => findFolder(get().folders, path),

    // State management
    resetFolders: () => {
      set({ folders: [] }) // Will be repopulated by persist middleware
    },
    setFolders: (newFolders) => set({ folders: newFolders }),

    // File selection (simplified)
    setCurrentFile: (fileName) => set({ currentFileName: fileName }),
    clearCurrentFile: () => set({ currentFileName: null }),

    //Latex Page
    setLatex: (latex) => set({ latex })
  }
})
