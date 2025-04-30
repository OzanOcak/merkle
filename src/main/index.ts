// main/index.ts
import path from 'path'
import { app, BrowserWindow } from 'electron'

let mainWindow: BrowserWindow

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true // Keep enabled for debugging
    }
  })

  // CORRECT PRODUCTION PATH FOR DMG BUILDS
  const prodPath = path.join(
    process.resourcesPath, // Points to Contents/Resources/
    'renderer/index.html' // Where extraResources puts files
  )

  console.log('PRODUCTION PATH:', prodPath)

  mainWindow.loadFile(prodPath).catch((err) => {
    console.error('LOAD ERROR:', err)
    mainWindow.loadURL(`data:text/html,<h1>Path Error</h1>
      <p>Tried: ${prodPath}</p>
      <p>${err.message}</p>`)
  })

  mainWindow.webContents.openDevTools()
})
