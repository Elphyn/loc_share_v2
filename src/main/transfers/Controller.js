import { TcpConnector } from "../networking/Connectors.js";
import { ipcBus } from "../core/events.js";
import { ChannelReadable } from "./Writing.js";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { config } from "../core/config.js";
import { FileStream } from "./FileStream.js";
import "../utils/eventEmitterExtension.js";

export default class Controller {
  constructor(network) {
    this.connector = TcpConnector;
    this.network = network;
    this.busy = false;
    this.setup();
  }

  setup() {
    ipcBus.on("transfer-request", ({ id, files }) => {
      this.createOutgoingTranfer(id, files);
    });

    this.network.on("transfer-request", ({ transfer, channel }) => {
      this.createIncomingTranfer(transfer, channel);
    });
  }

  // async createIncomingTranfer(transfer, channel) {
  //   const transferID = crypto.randomUUID();
  //
  //   ipcBus.emit("new-transfer", { id: transferID, transfer });
  //
  //   const handleFile = async (fileID) => {
  //     const fileChunks = new ChannelReadable(channel);
  //
  //     const saveFolder = config.savePath;
  //
  //     // TODO: need to check whether the file already exists, so as to not override it but create a second one
  //     const writeStream = createWriteStream(
  //       path.join(config.savePath, transfer.files[fileID].name),
  //     );
  //
  //     await new Promise((resolve, reject) => {
  //       fileChunks.pipe(writeStream).on("finish", resolve).on("error", reject);
  //     });
  //
  //     console.log("[DEBUG] Finished writing a file");
  //   };
  //
  //   channel.on("transfer-file-start", handleFile);
  // }

  createIncomingTranfer(meta, channel) {
    const transferID = this.registerTransfer("incoming", meta.from, meta.files);
    const transfer = FileStream.receive(meta, channel);
  }

  // assinging id's to files, important to reference which file we're sending
  // and emitting to front progress change of specific file
  prepareFiles(files) {
    return files.reduce((obj, file) => {
      const id = crypto.randomUUID();
      obj[id] = file;
      return obj;
    }, {});
  }

  async connectByID(id) {
    try {
      return await this.network.connect(id, TcpConnector);
    } catch (err) {
      console.log("[DEBUG] Error while connecting: err", err);
      return;
    }
  }

  registerTransfer(type, remoteID, files) {
    const transferID = crypto.randomUUID();

    ipcBus.emit("new-transfer", {
      id: transferID,
      transfer: {
        type,
        remoteID,
        state: "Pending",
        files,
      },
    });
    return transferID;
  }

  transferListerns(transferID) {
    return {
      "transfer-start": () => ipcBus.emit("transfer-start", transferID),
      "progress-change": ({ fileID, bytesSent }) =>
        ipcBus.emit("file-progress-update", {
          transferID,
          fileID,
          bytesSent,
        }),
      "transfer-finished": () => ipcBus.emit("transfer-finish", transferID),
      error: (err) => console.log("[DEBUG] Transfer failed, err: ", err),
    };
  }

  addManyListeners(emitter, listeners) {
    emitter.onMany(listeners);
  }
  offManyListeners(emitter, listeners) {
    emitter.offMany(listeners);
  }

  // TODO: this works, but it's messy and needs a decomposition
  async createOutgoingTranfer(id, files) {
    const prepared = this.prepareFiles(files);

    const channel = await this.connectByID(id);
    // TODO: here should signal failure of transfer to front
    if (!channel) {
      return;
    }

    const transferID = this.registerTransfer("outgoing", id, prepared);

    const transfer = FileStream.create(
      channel,
      prepared,
      this.network.getAppInstanceID(),
    );

    this.addManyListeners(transfer, this.transferListerns(transferID));

    await transfer.ready;

    this.offManyListeners(transfer, this.transferListerns(transferID));
  }
}
