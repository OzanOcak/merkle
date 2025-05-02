import path from 'path'
import fs from 'fs'
import { app, BrowserWindow } from 'electron'
import { spawn, ChildProcess } from 'child_process'

// Global state
let mainWindow: BrowserWindow | null = null
let apiProcess: ChildProcess | null = null
let healthCheckInterval: NodeJS.Timeout | null = null
const backendReady = false
let apiRetryCount = 0
const MAX_API_RETRIES = 30 // ~30 seconds with current interval

// Debug logging utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debugLog = (message: string, data?: any): void => {
  const timestamp = new Date().toISOString()
  const logMessage = `[DEBUG ${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`
  console.log(logMessage)
  fs.appendFileSync(path.join(app.getPath('logs'), 'markle-debug.log'), logMessage + '\n')
}

// Initialize debug logging
debugLog('Application starting', {
  cwd: process.cwd(),
  argv: process.argv,
  env: {
    NODE_ENV: process.env.NODE_ENV,
    ELECTRON_RUN_AS_NODE: process.env.ELECTRON_RUN_AS_NODE
  }
})

// Backend management with enhanced debugging
async function startBackend(): Promise<void> {
  if (apiProcess && !apiProcess.killed) {
    debugLog('Backend already running')
    return
  }

  const isDevelopment = process.env.NODE_ENV === 'development'
  let backendPath: string
  let backendMain: string

  try {
    backendPath = isDevelopment
      ? path.join(__dirname, '../../backend')
      : path.join(process.resourcesPath, 'app/backend')

    backendMain = path.join(backendPath, 'index.js')

    debugLog('Checking backend files', {
      backendPath,
      backendMain,
      exists: fs.existsSync(backendMain)
    })

    if (!fs.existsSync(backendMain)) {
      debugLog('Backend entry point not found', { backendMain })
      return
    }
  } catch (err) {
    debugLog('Failed to locate backend files', {
      error: err instanceof Error ? err.message : String(err)
    })
    return
  }

  debugLog(`Starting backend from: ${backendMain}`)

  try {
    apiProcess = spawn(process.execPath, [backendMain], {
      cwd: backendPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: '3001',
        ALTERNATE_PORT: '3002'
      }
    })

    debugLog('Backend process spawned', {
      pid: apiProcess.pid,
      command: `${process.execPath} ${backendMain}`,
      cwd: backendPath
    })

    if (!apiProcess.stdout || !apiProcess.stderr) {
      debugLog('Failed to establish communication with backend process')
      return
    }

    const safeLog = (data: Buffer, type: 'log' | 'error'): void => {
      const str = data.toString().trim()
      if (str) {
        console[type](`[Backend] ${str}`)
        debugLog(`Backend ${type}`, str)
      }
    }

    apiProcess.stdout.on('data', (data) => safeLog(data, 'log'))
    apiProcess.stderr.on('data', (data) => safeLog(data, 'error'))

    apiProcess.on('error', (err) => {
      debugLog('API server process error', {
        error: err.message,
        stack: err.stack
      })
    })

    apiProcess.on('spawn', () => {
      debugLog('Backend successfully spawned', { pid: apiProcess?.pid })
    })

    apiProcess.on('close', (code, signal) => {
      debugLog('Backend process closed', { code, signal })
      apiProcess = null
      if (code !== 0) {
        debugLog('API server exited unexpectedly')
      }
    })
  } catch (err) {
    debugLog('Failed to start API server', {
      error: err instanceof Error ? err.message : String(err)
    })
  }
}

// Enhanced health check with debugging
async function isBackendAlive(): Promise<boolean> {
  try {
    const startTime = Date.now()
    const response = await fetch('http://localhost:3001/api/healthcheck', {
      signal: AbortSignal.timeout(2000)
    })
    debugLog('Health check response', {
      status: response.status,
      duration: Date.now() - startTime
    })
    return response.ok
  } catch (error) {
    debugLog('Health check failed', {
      error: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

// Window management with debugging
async function createWindow(): Promise<void> {
  debugLog('Creating main window')

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#FF00FF',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  // Debug tools
  mainWindow.webContents.openDevTools({ mode: 'detach' })
  debugLog('DevTools opened')

  // Debug event listeners
  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDesc) => {
    debugLog('Window failed to load', { errorCode, errorDesc })
  })

  mainWindow.webContents.on('did-finish-load', () => {
    debugLog('Window finished loading')
    mainWindow?.show()
  })

  try {
    if (process.env.NODE_ENV === 'development') {
      debugLog('Loading development version')
      await mainWindow.loadURL('http://localhost:5173')
    } else {
      const absolutePath =
        '/Users/armchip/projects/electron/merkle/dist/mac-arm64/Markle.app/Contents/Resources/renderer/index.html'
      const resourcePath = path.join(process.resourcesPath, 'renderer/index.html')

      debugLog('Checking production paths', {
        absolutePath,
        absolutePathExists: fs.existsSync(absolutePath),
        resourcePath,
        resourcePathExists: fs.existsSync(resourcePath)
      })

      if (fs.existsSync(absolutePath)) {
        await mainWindow.loadFile(absolutePath)
      } else if (fs.existsSync(resourcePath)) {
        await mainWindow.loadFile(resourcePath)
      } else {
        await mainWindow.loadURL(`data:text/html,...`)
      }
    }
  } catch (err) {
    debugLog('Window creation error', {
      error: err instanceof Error ? err.message : String(err)
    })
    await mainWindow.loadURL(`data:text/html,...`)
    mainWindow.show()
  }
}

function createDebugSnapshot(): void {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    // Backend paths
    backend: {
      devPath: path.join(__dirname, '../../backend'),
      prodPath: path.join(process.resourcesPath, 'app/backend'),
      mainFile: path.join(process.resourcesPath, 'app/backend/index.js'),
      exists: fs.existsSync(path.join(process.resourcesPath, 'app/backend/index.js'))
    },
    // Resources
    resources: {
      path: process.resourcesPath,
      contents: fs.readdirSync(process.resourcesPath)
    },
    // Environment
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      ELECTRON_RUN_AS_NODE: process.env.ELECTRON_RUN_AS_NODE
    },
    // Network
    network: {
      localhost: {
        '3001': fetch('http://localhost:3001').catch((e) => e.message)
      }
    }
  }

  // Write to desktop for easy access
  fs.writeFileSync(
    path.join(app.getPath('desktop'), 'MARKLE_DEBUG.json'),
    JSON.stringify(debugInfo, null, 2)
  )
}

// App lifecycle with debugging
app.whenReady().then(() => {
  createDebugSnapshot()
  debugLog('App ready')
  createWindow()
  startBackend()

  healthCheckInterval = setInterval(async () => {
    const alive = await isBackendAlive()
    debugLog('Health check result', { alive, retryCount: apiRetryCount })

    if (alive) {
      debugLog('API connection established')
      if (healthCheckInterval) clearInterval(healthCheckInterval)
    } else if (apiRetryCount >= MAX_API_RETRIES) {
      debugLog('Max API retries reached')
      if (healthCheckInterval) clearInterval(healthCheckInterval)
    } else {
      apiRetryCount++
      debugLog(`Retrying API connection (attempt ${apiRetryCount}/${MAX_API_RETRIES})`)
      startBackend()
    }
  }, 1000)

  setTimeout(() => {
    if (!backendReady) {
      debugLog('Startup timeout reached')
    }
  }, 30000)
})

app.on('window-all-closed', () => {
  debugLog('All windows closed')
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  debugLog('App activated')
  if (mainWindow === null) createWindow()
})

app.on('will-quit', () => {
  debugLog('App quitting')
  if (apiProcess) apiProcess.kill('SIGTERM')
  if (healthCheckInterval) clearInterval(healthCheckInterval)
})

app.on('web-contents-created', (_, contents) => {
  contents.openDevTools({ mode: 'detach' })
  debugLog('DevTools forced open for web contents')
})
