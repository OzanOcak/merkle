import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Add your custom API methods here
}

// Debugging utilities
const debugUtils = {
  logEnvironment: () => {
    console.log('[PRELOAD] Environment:', {
      contextIsolated: process.contextIsolated,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome,
      electronVersion: process.versions.electron,
      env: process.env.NODE_ENV
    })
  },
  forceReload: () => ipcRenderer.send('force-reload'),
  openDevTools: () => ipcRenderer.send('open-devtools')
}

// Setup debug listeners
const setupDebugging = (): void => {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('[PRELOAD] DOM fully loaded')
    debugUtils.logEnvironment()
  })

  window.addEventListener('error', (event) => {
    console.error('[PRELOAD] Window error:', event.error || event.message)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[PRELOAD] Unhandled rejection:', event.reason)
  })
}

// Only enable debug in development
if (process.env.NODE_ENV === 'development') {
  setupDebugging()
}

// Expose APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      debug: debugUtils // Only expose debug in development
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose APIs via contextBridge:', error)
  }
} else {
  // Fallback for non-contextIsolated mode
  // @ts-ignore (define in dts)
  window.electron = {
    ...electronAPI,
    debug: debugUtils
  }
  // @ts-ignore (define in dts)
  window.api = api
}
