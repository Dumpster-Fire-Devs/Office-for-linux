const { app, BrowserWindow, ipcMain } = require('electron');
let loginWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    fullscreen: true
  });

  mainWindow.loadURL('https://outlook.live.com');

  backgroundWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  backgroundWindow.loadURL('file://' + __dirname + '/background.html');

  loginWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  loginWindow.loadURL('file://' + __dirname + '/login.html');
}

ipcMain.on('login', (event, data) => {
  backgroundWindow.webContents.send('login', data);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});