const { app, BrowserWindow, Notification, remote, ipcRenderer, ipcMain, Tray } = require('electron');
const Imap = require('imap');
const open = require('open');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ show: false });
  mainWindow.loadURL('file://' + __dirname + '/login.html');
}

app.on('ready', () => {
  createWindow();

  tray = new Tray('outlook.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
});

ipcRenderer.on('login', (event, data) => {
  const { email, password } = data;

  const imap = new Imap({
    user: email,
    password: password,
    host: 'https://outlook.live.com',
    port: 993,
    tls: true
  });

  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  imap.once('ready', function() {
    mainWindow.webContents.send('login-success');
  
    openInbox(function(err, box) {
      if (err) throw err;
      imap.on('mail', function() {
        const notification = new Notification({
          title: 'New email',
          body: 'Click to open the app'
        });

                notification.show();

                notification.on('click', () => {
                  let mainWindow = remote.BrowserWindow.getAllWindows()[0];
                  if (mainWindow) {
                    if (mainWindow.isMinimized()) mainWindow.restore();
                    mainWindow.focus();
                  }
                });
              });
          });

  });

  imap.once('error', function(err) {
    console.log(err);
  });

  imap.once('end', function() {
    console.log('Connection ended');
  });

  imap.connect();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});