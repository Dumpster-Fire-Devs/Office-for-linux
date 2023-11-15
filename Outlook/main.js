const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;
let backgroundWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    fullscreen: true
  });

  mainWindow.loadURL('https://www.outlook.office365.com');

  backgroundWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  backgroundWindow.loadURL('file://' + __dirname + '/background.html');
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

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});