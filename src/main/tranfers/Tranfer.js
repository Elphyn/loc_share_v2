import { headers, includesPayload } from "./headers.js";
import { createReadStream } from "fs";
import EventEmitter from "events";
import { config } from "../core/config.js";
import { createChannelWriter } from "./Writing.js";
import MessageParser from "./MessageParser.js";

// Should probably make method non static and also track state
export default class Tranfer extends EventEmitter {
  static async create(id, files, connector) {
    const channel = await connector.connect(id);

    // notify start of the tranfer
    console.log("[TRANSFER] sending start tranfer");
    await channel.send(MessageParser.makeMessage(headers.startTranfer));
    console.log("[TRANSFER] Start");

    for (const file of files) {
      const tranfer = FileTranfer.createOutgoing(file, channel);
      await tranfer.sendFile();
    }
    console.log("[TRANSFER] finished");
    await channel.send(MessageParser.makeMessage(headers.finishTranfer));
  }
}

class FileTranfer extends EventEmitter {
  constructor(file, channel, type) {
    super();
    this.file = file;
    this.channel = channel;
    this.bytesSent = 0;
    this.type = type;
  }

  static recieveFile(file) {}

  static createOutgoing(file, channel) {
    const instance = new FileTranfer(file, channel, "receive");
    return instance;
  }

  prepareMeta() {
    return Buffer.from(JSON.stringify(this.file));
  }

  // TODO: that later should add as a proxy for emitting progress change upwards
  updateProgress(bytesSent) {
    this.bytesSent += bytesSent;
    console.log(`[FILE TRANSFER] ${this.bytesSent} / ${this.file.size}`);
  }

  async sendFile() {
    await this.channel.send(
      MessageParser.makeMessage(headers.meta, this.prepareMeta()),
    );

    const stream = createReadStream(this.file.path, {
      highWaterMark: config.chunk_length,
    });
    const channelWriter = createChannelWriter(this.channel);

    await new Promise((resolve, reject) => {
      stream
        .pipe(channelWriter)
        .on("finish", resolve)
        .on("chunk-sent", (bytes) => {
          this.updateProgress(bytes);
        })
        .on("error", reject);
    });
  }
}
//
// class
