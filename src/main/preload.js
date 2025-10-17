const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getService: () => ipcRenderer.invoke("get-service")
})
