import EventEmitter from "events";
import MessageParser from "./MessageParser.js";
import { headers } from "./headers.js";

export class TcpFileChannel extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
  }

  async sendTransferStart(meta) {
    await this._send(headers.startTransfer, meta);
  }

  async sendStartFile(fileID) {
    await this._send(headers.file, fileID);
  }

  async sendFileChunk(chunk) {
    await this._send(headers.chunk, chunk);
  }

  async sendFileFinish() {
    await this._send(headers.finish);
  }

  async sendTransferFinish() {
    await this._send(headers.finishTransfer);
  }

  async _send(header, payload) {
    const data = MessageParser.makeMessage(header, payload);

    return new Promise((resolve, reject) => {
      const ok = this.socket.write(data, (err) => {
        if (err) return reject(err);
        resolve();
      });

      if (!ok) {
        console.log("[DEBUG] Socket is paused");
        this.socket.once("drain", resolve);
      }
    });
  }
}
