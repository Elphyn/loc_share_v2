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
  tranferRequest: (id, files) => {
    // need to add filepath, renderer can't do it by itself
    files = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      path: webUtils.getPathForFile(file),
      id: file.id,
    }));
    ipcRenderer.send("tranfer-request", { id, files });
  },
});
