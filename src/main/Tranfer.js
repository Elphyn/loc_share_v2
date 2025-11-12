import { headers, includesPayload } from "./headers.js";
import { createReadStream } from "fs";
import EventEmitter from "events";
import { config } from "./config.js";
import createChannelWriter from "./Writing.js";

export default class Tranfer extends EventEmitter {
  static prepareMeta(meta) {
    return Buffer.from(JSON.stringify(meta));
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

  static async create(id, files, connector) {
    const channel = await connector.connect(id);

    // notify start of the tranfer
    console.log("[TRANSFER] sending start tranfer");
    await channel.send(Tranfer.makeMessage(headers.startTranfer));
    console.log("[TRANSFER] Start");

    for (const file of files) {
      await channel.send(
        Tranfer.makeMessage(headers.meta, Tranfer.prepareMeta(file)),
      );

      // const testPayload = Tranfer.makeMessage(
      //   headers.chunk,
      //   Buffer.from("Hello"),
      // );
      // console.log("[TRANFER TEST] sending playload: ", testPayload);
      // await channel.send(testPayload);

      const stream = createReadStream(file.path, {
        highWaterMark: config.chunk_length,
      });
      const writer = createChannelWriter(channel);

      await new Promise((resolve, reject) => {
        stream.pipe(writer).on("finish", resolve).on("error", reject);
      });
    }
    console.log("[TRANSFER] finished");
    await channel.send(Tranfer.makeMessage(headers.finishTranfer));
  }
}
