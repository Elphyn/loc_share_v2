import { TcpConnector } from "../networking/Connectors.js";
import { ipcBus } from "../core/events.js";
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
      "transfer-start": () => {
        console.log("[DEBUG] Controller caught transfer-start event");
        ipcBus.emit("transfer-start", transferID);
      },
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

  async createIncomingTranfer(meta, channel) {
    const transferID = this.registerTransfer("incoming", meta.from, meta.files);
    const transfer = FileStream.receive(meta, channel);

    ipcBus.emit("transfer-start", transferID);

    console.log("[DEBUG] Attaching event listeners on receiving");
    this.addManyListeners(transfer, this.transferListerns(transferID));

    await transfer.ready;
    console.log("[DEBUG] Awaited transfer.ready");

    this.offManyListeners(transfer, this.transferListerns(transferID));
    console.log("[DEBUG] Detaching event listeners on receiving");
  }
}
