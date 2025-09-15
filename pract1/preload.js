const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vfsAPI', {
    exitApp: () => ipcRenderer.send('app-exit'),
});
