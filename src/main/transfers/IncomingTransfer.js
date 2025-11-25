import Transfer from "./Transfer.js";
import { config } from "../core/config.js";
import { ChannelReadable } from "./Writing.js";
import { createWriteStream } from "original-fs";
import path from "node:path";

export default class IncomingTransfer extends Transfer {
  constructor(channel, meta, transferID) {
    super(meta.from, transferID, meta.files, channel);

    this.setup();
  }

  async handeFile(fileID) {
    const fileChunks = new ChannelReadable(this.channel);

    // TODO: need to check whether the file already exists, so as to not override it but create a second one
    const writeStream = createWriteStream(
      path.join(config.savePath, this.files[fileID].name),
    );

    await new Promise((resolve, reject) => {
      fileChunks.on("progress-change", (bytesWritten) => {
        this.notifyFileProgress(fileID, bytesWritten);
      });

      fileChunks.pipe(writeStream).on("finish", resolve).on("error", reject);
    });
  }

  attachListeners() {
    this.channel.on("transfer-file-start", (fileID) => {
      try {
        this.handeFile(fileID);
      } catch (err) {
        console.log("[ERROR] on handling file: ", err);
        this.channel.stopOnError(err);
        this.notifyTransferFailed();
      }
    });

    this.channel.once("transfer-finished", () => {
      this.notifyTransferFinished();
    });
  }

  setup() {
    this.registerTransfer("incoming");

    this.attachListeners();

    this.notifyTransferStart();
  }

  static create(channel, meta) {
    const transferID = crypto.randomUUID();

    const instance = new IncomingTransfer(channel, meta, transferID);

    return { transferID, transfer: instance };
  }
}
