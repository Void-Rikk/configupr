const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vfsAPI', {
    exitApp: () => ipcRenderer.send('app-exit'),
    onOutput: (callback) => ipcRenderer.on('command-output', (_, data) => callback(data)),
});
