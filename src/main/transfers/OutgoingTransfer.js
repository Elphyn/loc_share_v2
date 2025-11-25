import { network } from "../core/main.js";
import { TcpConnector } from "../networking/Connectors.js";
import { createChannelWriter } from "./Writing.js";
import { createReadStream } from "fs";
import { config } from "../core/config.js";
import Transfer from "./Transfer.js";

export default class OutgoingTransfer extends Transfer {
  constructor(remoteID, files, transferID) {
    super(remoteID, transferID, files);
  }

  static prepareFiles(files) {
    // Changing format of files, so it's easier to index them
    // 1) When communicating with frontend
    // 2) When communicating over channel on transfer
    return files.reduce((obj, file) => {
      const id = crypto.randomUUID();
      obj[id] = file;
      return obj;
    }, {});
  }

  static create(remoteID, files) {
    const transferID = crypto.randomUUID();
    const preparedFiles = OutgoingTransfer.prepareFiles(files);
    const transfer = new OutgoingTransfer(remoteID, preparedFiles, transferID);
    return { transferID, transfer };
  }

  async _connect() {
    return await network.connect(this.remoteID, TcpConnector);
  }

  async sendMeta() {
    const meta = JSON.stringify({
      from: network.getAppInstanceID(),
      // removing local path of files we're sending
      // other instance doesn't need to know that
      files: Object.entries(this.files).reduce(
        (obj, [id, { path, ...rest }]) => {
          obj[id] = rest;
          return obj;
        },
        {},
      ),
    });

    await this.channel.sendTransferStart(meta);
  }

  async sendFiles() {
    for (const [fileID, file] of Object.entries(this.files)) {
      await this.channel.sendStartFile(fileID);

      const stream = createReadStream(file.path, {
        highWaterMark: config.chunk_length,
      });

      const channelWriter = createChannelWriter(this.channel);

      await new Promise((resolve, reject) => {
        let bytesSent = 0;
        stream
          .pipe(channelWriter)
          .on("finish", resolve)
          .on("chunk-sent", (bytes) => {
            bytesSent += bytes;
            this.notifyFileProgress(fileID, bytesSent);
          })
          .on("error", reject);
      });
    }
  }

  async startTransfer() {
    this.registerTransfer("outgoing");

    this.channel = await this._connect();

    // Probably shouldn't happen, just in case
    if (!this.channel)
      throw new Error(
        "Impossible condition, didn't throw an error on connection properly",
      );

    this.notifyTransferStart();

    await this.sendMeta();

    await this.sendFiles();
  }

  async ready() {
    try {
      await this.startTransfer();
      this.notifyTransferFinished();
    } catch (err) {
      console.log("[DEBUG] Transfer failed due to: ", err);
      this.notifyTransferFailed();
    }
  }
}
