import { ipcMain } from "electron";
import { ipcBus } from "./events.js";
import { win } from "./main.js";

export default class IPCManager {
  constructor() {
    this.setup();
  }

  setup() {
    ipcBus.on("nearby-device-found", (device) => {
      win.webContents.send("nearby-device-found", device);
    });
    ipcBus.on("nearby-device-lost", (id) => {
      win.webContents.send("nearby-device-lost", id);
    });

    ipcMain.on("peer-connection-request", (_event, id) => {
      console.log("[IPC] Client asked to connect to ", id);
      ipcBus.emit("peer-connection-request", id);
    });
    ipcMain.on("tranfer-request", (_event, { id, files }) => {
      console.log("[IPC] Asked for a tranfer to ", id);
      files.forEach((file) => {
        console.log("[IPC] File: ", file);
      });
    });
  }
}
