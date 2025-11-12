import { headers, includesPayload } from "./headers.js";
import EventEmitter from "node:events";
// TODO: [Improvement] could use allocUnsafe, to have one buffer, no need to create new ones
export default class MessageParser extends EventEmitter {
  constructor() {
    super();
    this.buffer = Buffer.alloc(0);
    // this.expectedLength = null;
  }

  feed(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
      if (this.buffer.length < 1) break;

      const messageType = this.buffer.readUint8(0);

      if (!includesPayload.has(messageType)) {
        this.emit("message", { type: messageType });
        this.buffer = this.buffer.subarray(1);
        continue;
      }

      if (this.buffer.length < 5) break;

      const payloadLen = this.buffer.readUInt32BE(1);

      if (this.buffer.length < payloadLen + 5) {
        console.log("[MESSAGE PARSER] not enough data yet");
        break;
      }

      const payload = this.buffer.subarray(5, payloadLen + 5);

      this.emit("message", { type: messageType, payload });

      this.buffer = this.buffer.subarray(payloadLen + 5);
    }
  }
}
