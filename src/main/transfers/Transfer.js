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
    console.log("[DEBUG] this.files before crash: ", this.files);
    await this.channel.send(
      MessageParser.makeMessage(
        headers.startTransfer,
        JSON.stringify({
          from: this.localId,
          // other instance doesn't need to know the path, it's supposed to be another pc
          // also security reasons
          // funny looking expression lol, but all it does is dropping path for each file
          files: Object.entries(this.files).reduce(
            (obj, [id, { path, ...rest }]) => {
              obj[id] = rest;
              return obj;
            },
            {},
          ),
        }),
      ),
    );

    this.emit("transfer-start");

    Object.entries(this.files).forEach(async ([id, file]) => {
      const transfer = FileTransfer.createOutgoing(file, this.channel);

      transfer.on("progress-change", (bytesSent) => {
        // TODO: need to propogate up, probably should assign id to files
        // one layer up at Controller
        this.emit("file-progress-update", { id, bytesSent });
      });

      await transfer.sendFile();
    });

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

  // TODO: also it's probably a good idea to have something like channel itself preparing the message, not asking for static method
  // because in future when working with wrtc the method of preparing messages would be different
  // and since channel itself already has message parser we can reference non static method + the message preparing could be injected on runtime
  updateProgress(bytesSent) {
    this.bytesSent += bytesSent;
    this.emit("progress-change", this.bytesSent);
  }

  async sendFile() {
    // TODO: since I've decided to have one big meta object about transfer get sent before the files I should instead send id's
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
