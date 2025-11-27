const { contextBridge, ipcRenderer, webUtils } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  sendRendererReady: () => ipcRenderer.send("renderer-ready"),

  onNameGenerated: (callback) => {
    const handler = (_event, name) => callback(name);
    ipcRenderer.on("instance-name-generated", handler);

    return () => {
      ipcRenderer.removeListener("instance-name-generated", handler);
    };
  },

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
  onNewTransfer: (callback) => {
    const handler = (_event, transfer) => callback(transfer);
    ipcRenderer.on("new-transfer", handler);
    return () => {
      ipcRenderer.removeListener("new-transfer", handler);
    };
  },
  onTransferStart: (callback) => {
    const handler = (_event, transferID) => callback(transferID);
    ipcRenderer.on("transfer-start", handler);
    return () => {
      ipcRenderer.removeListener("transfer-start", handler);
    };
  },

  onTransferFinish: (callback) => {
    const handler = (_event, transferID) => callback(transferID);
    ipcRenderer.on("transfer-finish", handler);
    return () => {
      ipcRenderer.removeListener("transfer-finish", handler);
    };
  },

  onFileProgress: (callback) => {
    const handler = (_event, { transferID, fileID, bytesProcessed }) =>
      callback({ transferID, fileID, bytesProcessed });
    ipcRenderer.on("file-progress-update", handler);
    return () => {
      ipcRenderer.removeListener("file-progress-update", handler);
    };
  },
});
