const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const Imap = require('imap');
const open = require('open');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ show: false });
  mainWindow.loadURL('file://' + __dirname + '/login.html');
}

app.on('ready', createWindow);

ipcMain.on('login', (event, data) => {
  const { email, password } = data;

  const imap = new Imap({
    user: email,
    password: password,
    host: 'outlook.office365.com',
    port: 993,
    tls: true
  });

  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  imap.once('ready', function() {
    openInbox(function(err, box) {
      if (err) throw err;
      imap.on('mail', function() {
        const notification = new Notification({
          title: 'New email',
          body: 'Click to open the app'
        });

        notification.show();

        notification.on('click', () => {
          mainWindow.show();
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