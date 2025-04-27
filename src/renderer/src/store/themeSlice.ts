import { StateCreator } from 'zustand'
import { StoreType } from '.'

export type ThemeSlice = {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

export const createThemeSlice: StateCreator<
  StoreType,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  ThemeSlice
> = (set, get) => {
  // Get initial theme from localStorage if available
  const initialTheme =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('app-store') || '{}').theme || 'light'
      : 'light'

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      set({ theme })
    },
    toggleTheme: () => {
      const newTheme = get().theme === 'light' ? 'dark' : 'light'
      set({ theme: newTheme })
    }
  }
}
