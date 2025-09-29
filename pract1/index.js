const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require("fs");

const options = {
    vfsPath: null,
    scriptPath: null,
};

function parseArgs() {
    const args = process.argv.slice(2);
    args.forEach(arg => {
        if (arg.startsWith('--vfs=')) {
            options.vfsPath = arg.split('=')[1];
        }
        if (arg.startsWith('--script=')) {
            options.scriptPath = arg.split('=')[1];
        }
    });
    console.log('Parsed options:', options);
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Emulator',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            additionalArguments: [JSON.stringify(options)],
        },
    });

    win.loadFile(path.join(__dirname, 'index.html'));

    win.webContents.on('did-finish-load', () => {
        if (options.scriptPath) {
            try {
                const lines = fs.readFileSync(options.scriptPath, 'utf-8').split('\n').filter(Boolean);
                win.webContents.send('command-output', { type: 'run-script', lines });
            } catch (err) {
                win.webContents.send('command-output', { type: 'error', message: err.message });
            }
        }
    });
}

app.whenReady().then(() => {
    parseArgs();
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

ipcMain.on('app-exit', () => {
    app.quit();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
