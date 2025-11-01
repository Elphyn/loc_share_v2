import { ipcMain } from "electron";
import { eventBus } from "./events.js";
import { win } from "./main.js";

export default class IPCManager {
  constructor() {
    this.setup();
  }

  setup() {
    eventBus.on("backend-connected", (localID) => {
      win.webContents.send("server-connected", localID);
    });
    eventBus.on("connections-list-reset", (connections) => {
      win.webContents.send("connections-list-reset", connections);
    });
    eventBus.on("connections-list-connection", (id) => {
      win.webContents.send("connections-list-connection", id);
    });
    eventBus.on("connections-list-removal", (id) => {
      win.webContents.send("connections-list-removal", id);
    });

    ipcMain.on("peer-connection-request", (_event, id) => {
      console.log("[IPC] Client asked to connect to ", id);
      eventBus.emit("peer-connection-request", id);
    });
    ipcMain.on("peer-file-request", (_event, file) => {
      console.log("[IPC] Requested to send file: ", file);
      eventBus.emit("peer-file-request", file);
    });
  }
}
