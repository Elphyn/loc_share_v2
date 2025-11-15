import { headers, includesPayload } from "./headers.js";
import EventEmitter from "node:events";
// TODO: [Improvement] could use allocUnsafe, to have one buffer, no need to create new ones
export default class MessageParser extends EventEmitter {
  constructor() {
    super();
    this.buffer = Buffer.alloc(0);
    // this.expectedLength = null;
  }

  static makeMessage(typeHeader, payload) {
    if (!typeHeader)
      throw new Error(
        "[TRANSFER ERROR] no header was passed on creating of message",
      );
    // message without a payload
    if (!includesPayload.has(typeHeader)) {
      const buffer = Buffer.alloc(1);
      buffer.writeUint8(typeHeader, 0);
      return buffer;
    }

    if (!payload)
      throw new Error(
        "[TRANSFER ERROR] payload header was specified but no payload was given",
      );

    const headers = Buffer.alloc(5);

    headers.writeUint8(typeHeader, 0);
    headers.writeUInt32BE(payload.length, 1);

    // TODO: [Improvement] Could use unsafe buffer, to not create a lot of new ones
    return Buffer.concat([headers, payload]);
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

      if (this.buffer.length < payloadLen + 5) break;

      const payload = this.buffer.subarray(5, payloadLen + 5);

      this.emit("message", { type: messageType, payload });

      this.buffer = this.buffer.subarray(payloadLen + 5);
    }
  }
}
