const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendRendererReady: () => ipcRenderer.send('renderer-ready'),

  onConnection: (callback) => {
    ipcRenderer.on("server-connected", callback)
    return () => ipcRenderer.removeListener("server-connected", callback)
  },
  onConnectionReset: (callback) => {
    const handler = (_event, list) => callback(list)
    ipcRenderer.on("connections-list-reset", handler)
    return () => ipcRenderer.removeListener("connections-list-reset", handler)
  },
  onSocketConnection: (callback) => {
    const handler = (_event, id) => callback(id)
    ipcRenderer.on("connections-list-connection", handler)
    return () => ipcRenderer.removeListener("connections-list-connection", handler)
  },
  onSocketDisconnection: (callback) => {
    const handler = (_event, id) => callback(id)
    ipcRenderer.on("connections-list-removal", handler)
    return () => ipcRenderer.removeListener("connections-list-removal", handler)
  }
})
