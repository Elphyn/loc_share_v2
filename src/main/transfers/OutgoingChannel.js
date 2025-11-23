import EventEmitter from "events";
import MessageParser from "./MessageParser.js";

export class TcpFileChannel extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
  }

  async send(header, payload) {
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
