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
    ipcMain.on("peer-file-request", (_event, file) => {
      console.log("[IPC] Requested to send file: ", file);
      ipcBus.emit("peer-file-request", file);
    });
  }
}
