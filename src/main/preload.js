const { contextBridge, ipcRenderer, webUtils } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  sendRendererReady: () => ipcRenderer.send("renderer-ready"),

  onConnection: (callback) => {
    const handler = (_even, localID) => callback(localID);
    ipcRenderer.on("server-connected", handler);
    return () => ipcRenderer.removeListener("server-connected", handler);
  },
  onConnectionReset: (callback) => {
    const handler = (_event, list) => callback(list);
    ipcRenderer.on("connections-list-reset", handler);
    return () => ipcRenderer.removeListener("connections-list-reset", handler);
  },
  onSocketConnection: (callback) => {
    const handler = (_event, id) => callback(id);
    ipcRenderer.on("connections-list-connection", handler);
    return () =>
      ipcRenderer.removeListener("connections-list-connection", handler);
  },
  onSocketDisconnection: (callback) => {
    const handler = (_event, id) => callback(id);
    ipcRenderer.on("connections-list-removal", handler);
    return () =>
      ipcRenderer.removeListener("connections-list-removal", handler);
  },
  sendFile: (file) => {
    const filePath = webUtils.getPathForFile(file);
    ipcRenderer.send("peer-file-request", {
      path: filePath,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  },
  onClickConnect: (id) => ipcRenderer.send("peer-connection-request", id),
});
