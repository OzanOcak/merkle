import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type ContentState = {
  _hydrated: boolean
  currentContent: string | null
  actions: {
    setContent: (content: string, isNew?: boolean) => void
    getContent: () => string | null
    clearContent: () => void
    updateContent: (newContent: string) => void
  }
}

export const useContentStore = create<ContentState>()(
  persist(
    immer((set, get) => ({
      _hydrated: false,
      currentContent: null,
      actions: {
        setContent: (content) =>
          set({
            currentContent: content
          }),
        getContent: () => get().currentContent,
        clearContent: () =>
          set({
            currentContent: null
          }),
        updateContent: (newContent) => {
          set((state) => {
            if (state.currentContent !== null) {
              state.currentContent = newContent
            }
          })
        }
      }
    })),
    {
      name: 'content-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        currentContent: state.currentContent
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true
          // Initialize content if not in localStorage
          if (state.currentContent === undefined) {
            state.currentContent = null
          }
        }
      }
    }
  )
)
