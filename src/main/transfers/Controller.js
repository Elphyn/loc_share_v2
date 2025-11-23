import { TcpConnector } from "../networking/Connectors.js";
import { ipcBus } from "../core/events.js";
import Transfer from "./Transfer.js";
import { ChannelReadable } from "./Writing.js";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { config } from "../core/config.js";
import { FileStream } from "./FileStream.js";
import { channel } from "node:diagnostics_channel";

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

  async createIncomingTranfer(transfer, channel) {
    const transferID = crypto.randomUUID();

    ipcBus.emit("new-transfer", { id: transferID, transfer });

    const handleFile = async (fileID) => {
      const fileChunks = new ChannelReadable(channel);

      const saveFolder = config.savePath;
      console.log("[DEBUG] Save folder is: ", saveFolder);

      // TODO: need to check whether the file already exists, so as to not override it but create a second one
      const writeStream = createWriteStream(
        path.join(config.savePath, transfer.files[fileID].name),
      );

      await new Promise((resolve, reject) => {
        fileChunks.pipe(writeStream).on("finish", resolve).on("error", reject);
      });

      console.log("[DEBUG] Finished writing a file");
    };

    channel.on("transfer-file-start", handleFile);
  }

  // async createOutgoingTranfer(id, files) {
  //   if (files.length === 0) return;
  //
  //   // preparing files for easier referencing on both sides and front
  //   files = files.reduce((obj, file) => {
  //     const id = crypto.randomUUID();
  //     obj[id] = file;
  //     return obj;
  //   }, {});
  //
  //   const transferID = crypto.randomUUID();
  //
  //   const transferInfo = {
  //     type: "outgoing",
  //     to: id,
  //     state: "Pending",
  //     files,
  //   };
  //
  //   ipcBus.emit("new-transfer", { id: transferID, transfer: transferInfo });
  //
  //   try {
  //     const channel = await this.network.connect(id, TcpConnector);
  //
  //     const localId = this.network.getAppInstanceId();
  //
  //     const transfer = Transfer.createOutgoing("out", channel, files, localId);
  //
  //     transfer.on("transfer-start", () => {
  //       ipcBus.emit("transfer-start", transferID);
  //     });
  //
  //     transfer.on("file-progress-update", ({ id, bytesSent }) => {
  //       ipcBus.emit("file-progress-update", {
  //         transferID,
  //         fileID: id,
  //         bytesSent,
  //       });
  //     });
  //
  //     await transfer.start();
  //     ipcBus.emit("transfer-finish", transferID);
  //     console.log("[CONTROLLER] Transfer finished");
  //   } catch (err) {
  //     console.log("[Transfer] Transfer failed, err:", err);
  //     //TODO: need to configure emitting failure to front here
  //   }
  // }
  async createOutgoingTranfer(id, files) {
    files = files.reduce((obj, file) => {
      const id = crypto.randomUUID();
      obj[id] = file;
      return obj;
    }, {});

    let channel;
    try {
      channel = await this.network.connect(id, TcpConnector);
    } catch (err) {
      console.log("[DEBUG] Weren't able to connect, err", err);
      return;
    }

    const localId = this.network.getAppInstanceId();

    const transfer = FileStream.create(channel, files, localId);

    const handleStart = () => {
      console.log("[DEBUG] Transfer-started");
    };

    const handleProgress = ({ fileID, bytesSent }) => {
      console.log(`[DEBUG] Progress changed: file: ${fileID} | ${bytesSent}`);
    };

    const handleFinish = () => {
      console.log("[DEBUG] Transfer finished");
    };

    const handleError = (err) => {
      console.log("[DEBUG] Transfer failed, err: ", err);
    };

    transfer
      .on("transfer-start", handleStart)
      .on("progress-change", handleProgress)
      .on("transfer-finished", handleFinish)
      .on("error", handleError);

    await transfer.ready;
    console.log("[DEBUG] Transfer done");
  }
}
