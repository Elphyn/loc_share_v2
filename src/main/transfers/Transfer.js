import { headers } from "./headers.js";
import { createReadStream } from "fs";
import EventEmitter from "events";
import { config } from "../core/config.js";
import { createChannelWriter } from "./Writing.js";
import MessageParser from "./MessageParser.js";

// Should probably make method non static and also track state
export default class Transfer extends EventEmitter {
  constructor(type, channel, files, localId) {
    super();
    this.state = "Preparing";
    this.files = files;
    this.channel = channel;
    this.localId = localId;
  }

  static create(type, channel, files, localId) {
    const instance = new Transfer(type, channel, files, localId);
    return instance;
  }

  async start() {
    // notify start of the transfer
    console.log("[TRANSFER] sending start transfer");

    await this.channel.send(
      MessageParser.makeMessage(headers.startTransfer, this.localId),
    );
    console.log("[TRANSFER] Start");

    this.emit("transfer-start");

    for (const file of this.files) {
      const transfer = FileTransfer.createOutgoing(file, this.channel);

      transfer.on("progress-change", (bytesSent) => {
        // TODO: need to propogate up, probably should assign id to files
        // one layer up at Controller
        this.emit("file-progress-update", { id: file.id, bytesSent });
      });

      await transfer.sendFile();
    }
    console.log("[TRANSFER] finished");
    await this.channel.send(MessageParser.makeMessage(headers.finishTransfer));

    this.emit("transfer-finished");
  }
}

class FileTransfer extends EventEmitter {
  constructor(file, channel, type) {
    super();
    this.file = file;
    this.channel = channel;
    this.bytesSent = 0;
    this.type = type;
  }

  static createIncoming(file) {}

  static createOutgoing(file, channel) {
    const instance = new FileTransfer(file, channel, "out");
    return instance;
  }

  // TODO: that later should add as a proxy for emitting progress change upwards
  updateProgress(bytesSent) {
    this.bytesSent += bytesSent;
    this.emit("progress-change", this.bytesSent);
  }

  async sendFile() {
    await this.channel.send(
      MessageParser.makeMessage(headers.meta, JSON.stringify(this.file)),
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
