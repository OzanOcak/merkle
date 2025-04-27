import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createThemeSlice, ThemeSlice } from './themeSlice'
import { createExplorerSlice, ExplorerSlice } from './explorerSlice'
import { initialFolders } from '@/components/explorer/tree/tree_queries'

type StoreInitialization = {
  _hydrated: boolean
}

export type StoreType = ThemeSlice & ExplorerSlice & StoreInitialization

export const useStore = create<StoreType>()(
  persist(
    immer((set, get, api) => ({
      _hydrated: false,
      ...createThemeSlice(set, get, api),
      ...createExplorerSlice(set, get, api)
    })),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => {
        console.log('Partializing state:', state) // Debug log
        return {
          theme: state.theme,
          latex: state.latex,
          folders: state.folders,
          currentPath: state.currentPath,
          currentFileName: state.currentFileName
        }
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true

          // Check if localStorage was empty
          const storedData = localStorage.getItem('app-store')
          if (!storedData) {
            // If empty, ensure initialFolders are used
            state.folders = initialFolders
          }

          // Validate and initialize theme
          if (!state.theme || (state.theme !== 'light' && state.theme !== 'dark')) {
            state.theme = 'light' // Default theme
            localStorage.setItem(
              'app-store',
              JSON.stringify({
                ...JSON.parse(localStorage.getItem('app-store') || '{}'),
                theme: 'light'
              })
            )
          }

          // Validate folders
          if (!state.folders || !Array.isArray(state.folders)) {
            state.folders = initialFolders
          }
        }
      }
    }
  )
)
