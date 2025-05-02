import path from 'path'
import fs from 'fs'
import { app, BrowserWindow } from 'electron'
import { spawn, ChildProcess } from 'child_process'

// Global state with type safety
let mainWindow: BrowserWindow | null = null
let apiProcess: ChildProcess | null = null
let healthCheckInterval: NodeJS.Timeout | null = null
let apiRetryCount = 0
const MAX_API_RETRIES = 30
const API_PORT = 3001
const HEALTH_CHECK_TIMEOUT = 2000

// Centralized error handling
const handleError = (context: string, error: unknown): void => {
  const timestamp = new Date().toISOString()
  const errorMessage = error instanceof Error ? error.message : String(error)
  const logMessage = `[ERROR ${timestamp}] ${context}: ${errorMessage}`

  console.error(logMessage)

  try {
    fs.appendFileSync(path.join(app.getPath('logs'), 'markle-error.log'), logMessage + '\n')
  } catch (logError) {
    console.error('Failed to write to error log:', logError)
  }
}

// Properly cleanup backend process
const cleanupBackend = (): void => {
  if (apiProcess) {
    try {
      if (!apiProcess.killed) {
        apiProcess.removeAllListeners()
        apiProcess.kill('SIGTERM')
      }
    } catch (err) {
      handleError('Cleaning up backend process', err)
    } finally {
      apiProcess = null
    }
  }
}

// Start backend with proper error handling
const startBackend = async (): Promise<boolean> => {
  // Clean up any existing process first
  cleanupBackend()

  try {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const backendPath = isDevelopment
      ? path.join(__dirname, '../../backend')
      : path.join(process.resourcesPath, 'app/backend')

    const backendMain = path.join(backendPath, 'index.js')

    if (!fs.existsSync(backendMain)) {
      throw new Error(`Backend entry point not found at ${backendMain}`)
    }

    apiProcess = spawn(process.execPath, [backendMain], {
      cwd: backendPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: API_PORT.toString()
      }
    })

    if (!apiProcess.stdout || !apiProcess.stderr) {
      throw new Error('Failed to establish communication with backend process')
    }

    // Log backend output
    apiProcess.stdout.on('data', (data) => console.log(`[Backend] ${data.toString().trim()}`))
    apiProcess.stderr.on('data', (data) => console.error(`[Backend] ${data.toString().trim()}`))

    apiProcess.on('error', (err) => {
      handleError('Backend process error', err)
      cleanupBackend()
    })

    apiProcess.on('exit', (code, signal) => {
      if (code !== 0) {
        handleError('Backend process exited', new Error(`Code: ${code}, Signal: ${signal}`))
      }
      cleanupBackend()
    })

    return true
  } catch (err) {
    handleError('Starting backend', err)
    cleanupBackend()
    return false
  }
}

// Health check with timeout
const isBackendAlive = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)

    const response = await fetch(`http://localhost:${API_PORT}/api/healthcheck`, {
      signal: controller.signal
    })

    clearTimeout(timeout)
    return response.ok
  } catch {
    return false
  }
}

// Window management with cleanup
const createWindow = async (): Promise<void> => {
  // Prevent multiple windows
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    return
  }

  try {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      icon:
        process.platform === 'win32'
          ? path.join(__dirname, 'build/icon.ico')
          : path.join(__dirname, 'build/icon.png'), // .png for Linux/macOS
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: process.env.NODE_ENV === 'development'
      }
    })

    // Show dock icon when window is ready (macOS)
    mainWindow.on('ready-to-show', () => {
      if (process.platform === 'darwin') {
        app.dock?.show()
      }
      mainWindow?.show()
    })

    // Proper window close handling
    mainWindow.on('closed', () => {
      mainWindow = null
      // Hide dock when window is closed (macOS)
      if (process.platform === 'darwin') {
        app.dock?.hide()
      }
    })

    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
      await mainWindow.loadURL('http://localhost:5173')
    } else {
      const indexPath = path.join(process.resourcesPath, 'renderer/index.html')
      await mainWindow.loadFile(indexPath)
    }
  } catch (err) {
    handleError('Creating window', err)
    if (mainWindow) {
      await mainWindow.loadURL(`data:text/html,<h1>Application Error</h1>`)
      mainWindow.show()
    }
  }
}

// Cleanup all resources
const cleanup = (): void => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
    healthCheckInterval = null
  }
  cleanupBackend()
}

// Single instance lock for production
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance - focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    } else {
      createWindow().catch((err) => {
        handleError('Recreating window from second instance', err)
      })
    }
  })

  // App lifecycle management
  app.whenReady().then(async () => {
    try {
      // Hide dock initially (macOS)
      if (process.platform === 'darwin') {
        app.dock?.hide()
      }

      await createWindow()
      const started = await startBackend()

      if (started) {
        healthCheckInterval = setInterval(async () => {
          const alive = await isBackendAlive()

          if (alive) {
            if (healthCheckInterval) clearInterval(healthCheckInterval)
          } else if (apiRetryCount >= MAX_API_RETRIES) {
            cleanup()
            handleError('Backend', new Error('Maximum connection retries reached'))
          } else {
            apiRetryCount++
            await startBackend()
          }
        }, 1000)
      }
    } catch (err) {
      handleError('App initialization', err)
    }
  })
}

// Proper shutdown handling
app.on('window-all-closed', () => {
  // On macOS, we keep the app running even with no windows
  if (process.platform !== 'darwin') {
    cleanup()
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS, recreate window when dock icon is clicked and no windows are open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch((err) => {
      handleError('Recreating window on activate', err)
    })
  }
})

app.on('before-quit', () => {
  // Ensure proper cleanup when actually quitting
  cleanup()
})

app.on('will-quit', () => {
  // Final cleanup
  cleanup()
})

// Handle macOS reopen events
app.on('open-file', () => {
  if (mainWindow === null) {
    createWindow().catch((err) => {
      handleError('Recreating window from file open', err)
    })
  }
})

app.on('open-url', () => {
  if (mainWindow === null) {
    createWindow().catch((err) => {
      handleError('Recreating window from URL open', err)
    })
  }
})

// Prevent process from hanging
process.on('uncaughtException', (err) => {
  handleError('Uncaught Exception', err)
  cleanup()
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  handleError('Unhandled Rejection', reason)
})
