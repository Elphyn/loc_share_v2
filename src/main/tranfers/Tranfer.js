import { headers, includesPayload } from "./headers.js";
import { createReadStream } from "fs";
import EventEmitter from "events";
import { config } from "../core/config.js";
import { createChannelWriter } from "./Writing.js";
import MessageParser from "./MessageParser.js";

// Should probably make method non static and also track state
export default class Tranfer extends EventEmitter {
  static prepareMeta(meta) {
    return Buffer.from(JSON.stringify(meta));
  }

  static async create(id, files, connector) {
    const channel = await connector.connect(id);

    // notify start of the tranfer
    console.log("[TRANSFER] sending start tranfer");
    await channel.send(MessageParser.makeMessage(headers.startTranfer));
    console.log("[TRANSFER] Start");

    for (const file of files) {
      // await channel.send(
      //   MessageParser.makeMessage(headers.meta, Tranfer.prepareMeta(file)),
      // );
      //
      // const stream = createReadStream(file.path, {
      //   highWaterMark: config.chunk_length,
      // });
      // const writer = createChannelWriter(channel);
      //
      // await new Promise((resolve, reject) => {
      //   stream.pipe(writer).on("finish", resolve).on("error", reject);
      // });
      FileTranfer.sendFile(file, channel);
    }
    console.log("[TRANSFER] finished");
    await channel.send(MessageParser.makeMessage(headers.finishTranfer));
  }
}

class FileTranfer {
  constructor(file) {
    this.meta = file;
    this.bytesSent = 0;
  }

  static recieveFile(file) {}

  // TODO: this should return a File Tranfer object
  // also extend EventEmitter to read progress and errors
  static async sendFile(file, channel) {
    // const instance = new FileTranfer(file);
    await channel.send(
      MessageParser.makeMessage(headers.meta, Tranfer.prepareMeta(file)),
    );

    const stream = createReadStream(file.path, {
      highWaterMark: config.chunk_length,
    });
    const channelWriter = createChannelWriter(channel);

    await new Promise((resolve, reject) => {
      const updateProgress = (bytesSent) => {
        // TODO: to update here we need to have an instance of the class
        // meaning this whole method should create one and refer to it
        // tomorrow work on that
        this.bytesSent += bytesSent;
        console.log(`[FILE TRANSFER] ${this.bytesSent} / ${this.meta.size}`);
      };
      // old version
      // stream.pipe(channelWriter).on("finish", resolve).on("error", reject);
      stream
        .pipe(channelWriter)
        .on("finish", resolve)
        .on("chunk-sent", updateProgress)
        .on("error", reject);
    });
  }
}
//
// class
