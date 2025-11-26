import { ipcBus } from "../core/events.js";
import EventEmitter from "events";

export default class Transfer extends EventEmitter {
  constructor(remoteID, transferID, files, channel = null) {
    super();
    this.remoteID = remoteID;
    this.files = files;
    this.transferID = transferID;
    this.channel = channel;
  }

  notifyTransferStart() {
    console.log("[TRANSFER] Transfer started!");
    ipcBus.emit("transfer-start", this.transferID);
  }

  notifyTransferFinished() {
    console.log("[TRANSFER] Transfer finished!");
    ipcBus.emit("transfer-finish", this.transferID);

    // Emitting specifically to controller
    // Point: so it knows when to create/accept new transfer
    this.emit("transfer-finish");
  }

  notifyTransferFailed() {
    console.log("[TRANSFER] Transfer failed!");
    ipcBus.emit("transfer-failed", this.transferID);

    // Same as 19, controller doesn't need to know if somethign has failed
    // Only if he can create/accept new transfer
    this.emit("transfer-finished");
  }

  notifyFileProgress(fileID, bytesProcessed) {
    console.log("[TRANSFER] Transfer file progress triggered!");
    ipcBus.emit("file-progress-update", {
      transferID: this.transferID,
      fileID,
      bytesProcessed,
    });
  }

  registerTransfer(type) {
    ipcBus.emit("new-transfer", {
      id: this.transferID,
      transfer: {
        type,
        remoteID: this.remoteID,
        state: "Pending",
        files: this.files,
      },
    });
  }
}
