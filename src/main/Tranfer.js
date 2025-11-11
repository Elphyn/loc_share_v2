export class Tranfer {
  static makeMessage(header, payload) {
    if (payload && !Buffer.isBuffer(payload))
      throw new Error("[WRONG MESSAGE] Payload in message should be buffer");

    let buffer = Buffer.alloc(5);
    const headerBin = buffer.writeUint8(header, 4);

    const payloadLen = Buffer.isBuffer(payload) ? payload.length + 1 : 1;
    buffer.writeUInt32BE(payloadLen);
    if (payload) {
      buffer = Buffer.concat([buffer, payload]);
    }
    return buffer;
  }

  static async create(id, files, connector) {
    const channel = await connector.connect(id);

    // notify start of the tranfer
    channel.send();
  }
}
