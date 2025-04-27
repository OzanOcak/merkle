// src/global.d.ts
import { ElectronAPI } from '@electron-toolkit/preload'
import { CustomAPI } from '../electron/preload'

declare global {
  interface Window {
    electron: typeof import('@electron-toolkit/preload').electronAPI
    api: CustomAPI
  }
}

type StoreValue = string | number | boolean | object | null

interface CustomElectronAPI {
  getTheme: () => Promise<'light' | 'dark'>
  setTheme: (theme: 'light' | 'dark') => Promise<void>
}

interface Window {
  electronAPI: {
    getTheme: () => Promise<'light' | 'dark'>
    setTheme: (theme: 'light' | 'dark') => Promise<void>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: ElectronStoreAPI
  }
}
