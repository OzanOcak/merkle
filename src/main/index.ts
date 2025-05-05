import path from 'path'
import fs from 'fs'
import { app, BrowserWindow } from 'electron'
import { spawn, ChildProcess } from 'child_process'

// Global state
let mainWindow: BrowserWindow | null = null
let apiProcess: ChildProcess | null = null
const API_PORT = 3001

// Error handling
const handleError = (context: string, error: unknown): void => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error(`[ERROR] ${context}: ${errorMessage}`)
  try {
    fs.appendFileSync(
      path.join(app.getPath('logs'), 'markle-error.log'),
      `[${new Date().toISOString()}] ${context}: ${errorMessage}\n`
    )
  } catch (logError) {
    console.error('Failed to write to error log:', logError)
  }
}

// Backend process management
const cleanupBackend = (): void => {
  if (apiProcess) {
    try {
      apiProcess.removeAllListeners()
      if (!apiProcess.killed) {
        apiProcess.kill('SIGTERM')
      }
    } catch (err) {
      handleError('Cleaning up backend process', err)
    }
    apiProcess = null
  }
}

const startBackend = async (): Promise<boolean> => {
  cleanupBackend()

  try {
    const backendPath =
      process.env.NODE_ENV === 'development'
        ? path.join(__dirname, '../../backend/build')
        : path.join(process.resourcesPath, 'backend')

    const backendMain = path.join(backendPath, 'server.js')
    if (!fs.existsSync(backendMain)) {
      throw new Error(`Backend entry point not found at ${backendMain}`)
    }

    apiProcess = spawn('node', [backendMain], {
      cwd: backendPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: API_PORT.toString(),
        DATABASE_URL: 'file:./db.sqlite'
      }
    })

    apiProcess.stdout?.on('data', (data) => console.log(`[Backend] ${data.toString().trim()}`))
    apiProcess.stderr?.on('data', (data) => console.error(`[Backend] ${data.toString().trim()}`))

    apiProcess.on('error', (err) => {
      handleError('Backend process error', err)
      cleanupBackend()
    })

    apiProcess.on('exit', (code) => {
      if (code !== 0) {
        handleError('Backend process exited', new Error(`Code: ${code}`))
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

// Window management
const createWindow = async (): Promise<void> => {
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
      icon: path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: process.env.NODE_ENV === 'development'
      }
    })

    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }

    mainWindow.on('ready-to-show', () => {
      if (process.platform === 'darwin') {
        app.dock?.show()
      }
      mainWindow?.show()
    })

    mainWindow.on('closed', () => {
      mainWindow = null
      if (process.platform === 'darwin') {
        app.dock?.hide()
      }
    })

    await (process.env.NODE_ENV === 'development'
      ? mainWindow.loadURL('http://localhost:5173')
      : mainWindow.loadFile(path.join(process.resourcesPath, 'renderer/index.html')))
  } catch (err) {
    handleError('Creating window', err)
    if (mainWindow) {
      await mainWindow.loadURL(`data:text/html,<h1>Application Error</h1>`)
      mainWindow.show()
    }
  }
}

// App lifecycle
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    try {
      await startBackend()
      await createWindow()
    } catch (err) {
      handleError('App initialization', err)
      app.quit()
    }
  })
}

// Event handlers
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    cleanupBackend()
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch((err) => handleError('Activating window', err))
  }
})

app.on('before-quit', cleanupBackend)

// Error handling
process.on('uncaughtException', (err) => {
  handleError('Uncaught Exception', err)
  cleanupBackend()
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  handleError('Unhandled Rejection', reason)
})
