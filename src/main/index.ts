import path from 'path'
import fs from 'fs'
import { app, BrowserWindow } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import { execSync } from 'child_process'

// Global state
let mainWindow: BrowserWindow | null = null
let apiProcess: ChildProcess | null = null
const API_PORT = 3001
const DEBUG_FORCE_PATHS = true // Set to false after fixing

if (DEBUG_FORCE_PATHS) {
  // Nuclear path debug - finds your files NO MATTER WHAT
  const nuclearPathFind = (): void => {
    console.log('=== NUCLEAR PATH SCAN ===')
    const scanPaths = [
      process.cwd(),
      path.join(process.cwd(), 'out'),
      path.join(process.cwd(), 'dist'),
      path.join(process.cwd(), '..'),
      __dirname,
      process.resourcesPath,
      path.join(process.resourcesPath, '..')
    ]

    scanPaths.forEach((p) => {
      try {
        console.log(`\nSCANNING: ${p}`)
        const files = fs.readdirSync(p)
        console.log(files)

        // Special - look for index.html anywhere
        const htmlFiles = files.filter((f) => f.includes('index.html'))
        if (htmlFiles.length) {
          console.log('🔥 FOUND HTML FILES:', htmlFiles)
          htmlFiles.forEach((f) => {
            const fullPath = path.join(p, f)
            console.log(`FULL PATH: ${fullPath}`)
          })
        }
      } catch (err) {
        console.log(`Cannot scan ${p}:`, (err as Error).message)
      }
    })
  }

  // Run it immediately
  nuclearPathFind()
}

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

const debugAppPaths = (): void => {
  console.log('\n=== PATH DEBUGGING ===')
  console.log('Application paths:')
  console.log('process.cwd():', process.cwd())
  console.log('__dirname:', __dirname)
  console.log('process.resourcesPath:', process.resourcesPath)
  console.log('process.execPath:', process.execPath)

  console.log('\nAttempting to scan directories...')

  const checkPaths = [
    process.resourcesPath,
    path.join(process.resourcesPath, '..'),
    path.join(process.resourcesPath, '../..'),
    __dirname,
    path.join(__dirname, '..'),
    path.join(__dirname, '../../..')
  ]

  checkPaths.forEach((p) => {
    try {
      console.log(`\nContents of ${p}:`)
      console.log(fs.readdirSync(p))
    } catch (err) {
      // Assert that err is of type Error
      if (err instanceof Error) {
        console.log(`Cannot read ${p}:`, err.message)
      } else {
        console.log(`Cannot read ${p}:`, err) // Fallback for non-Error types
      }
    }
  })
}

const findRendererPath = (): string => {
  console.log('=== NUCLEAR PATH DETECTION ===')

  // All possible base directories to check
  const searchBases = [
    process.cwd(),
    __dirname,
    process.resourcesPath,
    path.join(process.resourcesPath, '..'),
    path.join(process.resourcesPath, '../Resources'),
    '/' // Root directory as last resort
  ]

  // All possible subpaths where index.html might be
  const subPaths = [
    'renderer/index.html',
    'app-renderer/index.html',
    'out/renderer/index.html',
    'resources/renderer/index.html',
    'app/dist/renderer/index.html'
  ]

  // Scan every possible combination
  for (const base of searchBases) {
    for (const subPath of subPaths) {
      const fullPath = path.join(base, subPath)
      try {
        if (fs.existsSync(fullPath)) {
          console.log(`✅ FOUND RENDERER AT: ${fullPath}`)
          return fullPath
        }
        console.log(`❌ Not found: ${fullPath}`)
      } catch (err) {
        console.log(`⚠️ Error checking ${fullPath}:`, (err as Error).message)
      }
    }
  }

  // Last resort - scan entire filesystem
  console.log('💀 PERFORMING FULL FILESYSTEM SCAN...')
  try {
    const findCmd =
      process.platform === 'win32'
        ? `dir /s /b "${path.join(process.resourcesPath, 'index.html')}"`
        : `find "${process.resourcesPath}" -name "index.html"`

    const results = execSync(findCmd).toString()
    console.log('🔥 FOUND THESE HTML FILES:', results)
  } catch (err) {
    console.log('💀 FULL SCAN FAILED:', err)
  }

  throw new Error('COULD NOT LOCATE RENDERER - SEE CONSOLE FOR SCAN RESULTS')
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
    const backendPath = path.join(__dirname, '../backend')

    // Set NODE_PATH to include backend node_modules
    process.env.NODE_PATH = path.join(backendPath, 'node_modules')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('module').Module._initPaths()

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
  // Handle existing window
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
    return
  }

  try {
    // Determine correct icon path
    const iconPath =
      process.env.NODE_ENV === 'development'
        ? path.join(
            __dirname,
            '../../resources',
            process.platform === 'win32' ? 'icon.ico' : 'icon.png'
          )
        : path.join(
            process.resourcesPath,
            'resources',
            process.platform === 'win32' ? 'icon.ico' : 'icon.png'
          )

    // Create new window
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      icon: iconPath,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: true, // Keep enabled for now
        webSecurity: false
      }
    })

    // Window event handlers
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

    // Load the renderer - SIMPLIFIED BASED ON NUCLEAR SCAN RESULTS
    if (process.env.NODE_ENV === 'development') {
      await mainWindow.loadURL('http://localhost:5173')
    } else {
      // Use the exact path we know works from the scan
      // Use the nuclear path detector
      const rendererPath = findRendererPath()
      console.log('🔨 USING RENDERER PATH:', rendererPath)
      await mainWindow.loadFile(rendererPath)

      if (!fs.existsSync(rendererPath)) {
        throw new Error(`Renderer not found at: ${rendererPath}`)
      }

      await mainWindow.loadFile(rendererPath)
    }

    // Open dev tools in both modes for now (remove in production)
    mainWindow.webContents.openDevTools() // Keep for debugging
    mainWindow.show()
  } catch (err) {
    console.error('Window creation failed:', err)

    // Enhanced error display with path info
    const errorHtml = `
      <h1>Application Error</h1>
      <pre>${err instanceof Error ? err.stack : String(err)}</pre>
      <h3>Debug Info:</h3>
      <p>NODE_ENV: ${process.env.NODE_ENV || 'undefined'}</p>
      <p>Current directory: ${process.cwd()}</p>
      <p>Renderer path attempted: ${path.join(process.cwd(), 'out/renderer/index.html')}</p>
      <p>Directory contents: ${
        fs.existsSync(path.join(process.cwd(), 'out/renderer'))
          ? fs.readdirSync(path.join(process.cwd(), 'out/renderer')).join(', ')
          : 'out/renderer does not exist'
      }</p>
    `

    if (mainWindow && !mainWindow.isDestroyed()) {
      await mainWindow.loadURL(`data:text/html,${encodeURIComponent(errorHtml)}`)
      mainWindow.show()
    } else {
      const errorWindow = new BrowserWindow({ width: 800, height: 600 })
      await errorWindow.loadURL(`data:text/html,${encodeURIComponent(errorHtml)}`)
      errorWindow.webContents.openDevTools()
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
      debugAppPaths()
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
