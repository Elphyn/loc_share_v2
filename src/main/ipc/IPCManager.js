import { ipcMain } from "electron";
import { ipcBus } from "../core/events.js";
import { win } from "../core/main.js";

export default class IPCManager {
  constructor() {
    this.setup();
  }

  setup() {
    ipcBus.on("instance-name-generated", (name) => {
      console.log("[DEBUG] IPC sending name: ", name);
      win.webContents.send("instance-name-generated", name);
    });
    ipcBus.on("nearby-device-found", (device) => {
      win.webContents.send("nearby-device-found", device);
    });
    ipcBus.on("nearby-device-lost", (id) => {
      win.webContents.send("nearby-device-lost", id);
    });
    ipcBus.on("new-transfer", (transfer) => {
      win.webContents.send("new-transfer", transfer);
    });
    ipcBus.on("transfer-start", (transferId) => {
      win.webContents.send("transfer-start", transferId);
    });
    ipcBus.on(
      "file-progress-update",
      ({ transferID, fileID, bytesProcessed }) => {
        win.webContents.send("file-progress-update", {
          transferID,
          fileID,
          bytesProcessed,
        });
      },
    );
    ipcBus.on("transfer-finish", (transferID) => {
      win.webContents.send("transfer-finish", transferID);
    });

    ipcMain.on("peer-connection-request", (_event, id) => {
      console.log("[IPC] Client asked to connect to ", id);
      ipcBus.emit("peer-connection-request", id);
    });
    ipcMain.on("transfer-request", (_event, req) => {
      console.log("[IPC] Asked for a transfer to ", req.id);
      ipcBus.emit("transfer-request", req);
    });
  }
}
