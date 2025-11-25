import { ipcBus } from "../core/events.js";
import EventEmitter from "events";

export default class Transfer extends EventEmitter {
  constructor(remoteID, transferID, files, channel = null) {
    this.remoteID = remoteID;
    this.files = files;
    this.transferID = transferID;
    this.channel = channel;
  }

  notifyTransferStart() {
    ipcBus.emit("transfer-start", this.transferID);
  }

  notifyTransferFinished() {
    ipcBus.emit("transfer-finished", this.transferID);

    // Emitting specifically to controller
    // Point: so it knows when to create/accept new transfer
    this.emit("transfer-finished");
  }

  notifyTransferFailed() {
    ipcBus.emit("transfer-failed", this.transferID);

    // Same as 19, controller doesn't need to know if somethign has failed
    // Only if he can create/accept new transfer
    this.emit("transfer-finished");
  }

  notifyFileProgress(fileID, bytesSent) {
    ipcBus.emit("file-progress-update", {
      transferID: this.transferID,
      fileID,
      bytesSent,
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
