import { headers, includesPayload } from "./headers.js";
import EventEmitter from "node:events";
// TODO: [Improvement] could use allocUnsafe, to have one buffer, no need to create new ones
export default class MessageParser extends EventEmitter {
  constructor() {
    super();
    // this.buffer = Buffer.alloc(0);
    // assuming there's a possibility that there could be multiple people trying to communicate
    // even a request on which I could answer "Instance is busy when we're already receiving a tranfer" is going to break the tranfer
    // so to avoid it for each person that is sending you something we're making different buffers
    this.channelBuffers = new Map();
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

    if (typeof payload !== "string" && !Buffer.isBuffer(payload))
      throw new Error(
        "[TRANSFER ERROR] Payload should be either string or Buffer",
      );

    if (typeof payload === "string") {
      payload = Buffer.from(payload);
    }

    const headers = Buffer.alloc(5);

    headers.writeUint8(typeHeader, 0);
    headers.writeUInt32BE(payload.length, 1);

    // TODO: [Improvement] Could use unsafe buffer, to not create a lot of new ones
    return Buffer.concat([headers, payload]);
  }

  feed(socketId, chunk) {
    if (!this.channelBuffers.has(socketId))
      this.channelBuffers.set(socketId, Buffer.alloc(0));

    let buffer = this.channelBuffers.get(socketId);
    buffer = Buffer.concat([buffer, chunk]);

    while (true) {
      if (buffer.length < 1) break;

      const messageType = buffer.readUint8(0);

      if (!includesPayload.has(messageType)) {
        this.emit("message", { from: socketId, type: messageType });
        buffer = buffer.subarray(1);
        continue;
      }

      if (buffer.length < 5) break;

      const payloadLen = buffer.readUInt32BE(1);

      if (buffer.length < payloadLen + 5) break;

      const payload = buffer.subarray(5, payloadLen + 5);

      this.emit("message", { from: socketId, type: messageType, payload });

      buffer = buffer.subarray(payloadLen + 5);
    }
  }
}
