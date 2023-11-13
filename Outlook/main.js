// Import the electron module
const { app, BrowserWindow, shell, Tray, Menu, Notification } = require('electron')
let tray = null

// Function to create a new BrowserWindow instance
function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    show: false // Hide the window
  })

  // Load a website into the window
  win.loadURL('https://outlook.live.com')

  // Don't close the window, just hide it
  win.on('close', (event) => {
    event.preventDefault()
    win.hide()
  })
}

// Function to create a tray icon and menu
function createTray () {
  tray = new Tray('outlook.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Outlook', click: () => { shell.openExternal('https://outlook.live.com') } },
    { label: 'Quit', click: () => { app.quit() } }
  ])
  tray.setToolTip('Outlook')
  tray.setContextMenu(contextMenu)
}

// Create the window and tray when Electron is ready
app.whenReady().then(() => {
  createWindow()
  createTray()
  // Check for new mail every 5 minutes
  setInterval(checkForNewMail, 5 * 60 * 1000);
})

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

// Function to show a notification
function showNotification () {
  const notification = {
    title: 'New mail',
    body: 'You have new mail'
  }
  new Notification(notification).show()
}

// OAuth 2.0 Authorization Code Grant flow code...

// Constants
const clientId = 'your-app-id'
const clientSecret = 'your-app-secret'
const redirectUri = 'http://localhost'
const authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
const scopes = ['https://graph.microsoft.com/Mail.Read']

// Step 1: Redirect the user to the Microsoft login page
let authWindow = new BrowserWindow({ width: 800, height: 600, show: false, webPreferences: { nodeIntegration: false } })
let urlParams = {
  response_type: 'code',
  client_id: clientId,
  redirect_uri: redirectUri,
  scope: scopes.join(' ')
}
let authUrlWithParams = `${authUrl}?${qs.stringify(urlParams)}`
authWindow.loadURL(authUrlWithParams)
authWindow.show()

// Step 2: Handle the callback
authWindow.webContents.on('will-redirect', (event, url) => {
  let rawCode = /code=([^&]*)/.exec(url) || null
  let code = (rawCode && rawCode.length > 1) ? rawCode[1] : null
  let error = /\?error=(.+)$/.exec(url)

  if (code || error) {
    // Close the browser if code found or error
    authWindow.destroy()
  }

  // If there is a code, proceed to get token from Microsoft
  if (code) {
    // Step 3: Exchange the authorization code for an access token
    axios.post(tokenUrl, qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })).then(response => {
      let token = response.data.access_token

      // Step 4: Use the access token to access the Microsoft Graph API
      // Check for new mail every 5 minutes
      setInterval(() => checkForNewMail(token), 5 * 60 * 1000);
    }).catch(error => {
      console.log(error)
    })
  } else if (error) {
    console.log(`OAuth2 request failed: ${error}`)
  }
})