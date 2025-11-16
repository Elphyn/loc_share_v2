const { contextBridge, ipcRenderer, webUtils } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  sendRendererReady: () => ipcRenderer.send("renderer-ready"),

  nearbyDeviceOn: (callback) => {
    const handler = (_event, device) => callback(device);
    ipcRenderer.on("nearby-device-found", handler);
    return () => ipcRenderer.removeListener("nearby-device-found", handler);
  },
  nearbyDeviceOff: (callback) => {
    const handler = (_event, id) => callback(id);
    ipcRenderer.on("nearby-device-lost", handler);
    return () => ipcRenderer.removeListener("nearby-device-lost", handler);
  },
  getFilePath: (file) => {
    return webUtils.getPathForFile(file);
  },
  transferRequest: (id, files, transferId) => {
    // need to add filepath, renderer can't do it by itself
    ipcRenderer.send("transfer-request", { id, files, transferId });
  },

  onTransferStart: (callback) => {
    const handler = (_event, transferId) => callback(transferId);
    ipcRenderer.on("transfer-start", handler);
    return () => {
      ipcRenderer.removeListener("transfer-start", handler);
    };
  },

  onTransferFinish: (callback) => {
    const handler = (_event, transferId) => callback(transferId);
    ipcRenderer.on("transfer-finish", handler);
    return () => {
      ipcRenderer.removeListener("transfer-finish", handler);
    };
  },

  onFileProgress: (callback) => {
    const handler = (_event, { transferId, id, bytesSent }) =>
      callback({ transferId, id, bytesSent });
    ipcRenderer.on("file-progress-update", handler);
    return () => {
      ipcRenderer.removeListener("file-progress-update", handler);
    };
  },
});
