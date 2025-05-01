// main/index.ts
import path from 'path'
import { app, BrowserWindow, session } from 'electron'

let mainWindow: BrowserWindow

app.whenReady().then(async () => {
  // Configure CORS for Electron's renderer
  await session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['http://localhost:3001'],
        'Access-Control-Allow-Methods': ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        'Access-Control-Allow-Headers': ['Content-Type']
      }
    })
  })

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true // Keep enabled for debugging
    }
  })

  // Determine the path based on the environment
  const isDevelopment = process.env.NODE_ENV === 'development'
  const filePath = isDevelopment
    ? path.join(__dirname, '../renderer/index.html') // Development path
    : path.join(process.resourcesPath, 'renderer/index.html') // Production path

  console.log('PRODUCTION PATH:', filePath)

  mainWindow.loadFile(filePath).catch((err) => {
    console.error('LOAD ERROR:', err)
    mainWindow.loadURL(`data:text/html,<h1>Path Error</h1>
      <p>Tried: ${filePath}</p>
      <p>${err.message}</p>`)
  })

  mainWindow.webContents.openDevTools()
})

app.on('window-all-closed', () => {
  app.quit()
})

/**
 import {  dialog, net } from 'electron'

 async function isBackendAlive(): Promise<boolean> {
  try {
    const response = await net.fetch('http://localhost:3001/api/healthcheck')
    return response.ok
  } catch {
    return false
  }
}

app.whenReady().then(async () => {
  // Check backend connection
  if (!(await isBackendAlive())) {
    dialog.showErrorBox(
      'Backend Required',
      'Please start the backend server first:\n\ncd backend && npm start'
    )
    app.quit()
    return
  }
})
 */
