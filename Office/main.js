// Import the electron module
const { app, BrowserWindow } = require('electron')

// Function to create a new BrowserWindow instance
function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      },
    fullscreen: true
  })

  // Load a website into the window
  win.loadURL('https://www.microsoft365.com')
}

// Create the window when Electron is ready
app.whenReady().then(createWindow)

// Quit the application when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
