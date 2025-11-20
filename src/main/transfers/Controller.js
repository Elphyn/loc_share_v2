import { TcpConnector } from "../networking/Connectors.js";
import { ipcBus } from "../core/events.js";
import Transfer from "./Transfer.js";

export default class Controller {
  constructor(network) {
    this.connector = TcpConnector;
    this.network = network;
    this.busy = false;
    this.setup();
  }

  setup() {
    ipcBus.on("transfer-request", ({ id, files, transferId }) => {
      this.createOutgoingTranfer(id, files, transferId);
    });
    this.network.on("transfer-request", (channel) => {
      console.log("[DEBUG] Got tranfer request from ", channel.bonjourId);
      this.createIncomingTranfer(channel);
    });
  }

  async createIncomingTranfer(channel) {}

  async createOutgoingTranfer(id, files) {
    // preparing files for easier referencing on both sides and front
    files = files.reduce((obj, file) => {
      const id = crypto.randomUUID();
      obj[id] = file;
      return obj;
    }, {});

    const transferID = crypto.randomUUID();
    const transferInfo = {
      type: "outgoing",
      to: id,
      state: "Pending",
      files,
    };

    ipcBus.emit("new-transfer", { id: transferID, transfer: transferInfo });

    try {
      const channel = await this.network.connect(id, TcpConnector);

      const localId = this.network.getAppInstanceId();

      const transfer = Transfer.create("out", channel, files, localId);

      transfer.on("transfer-start", () => {
        ipcBus.emit("transfer-start", transferID);
      });

      transfer.on("file-progress-update", ({ id, bytesSent }) => {
        ipcBus.emit("file-progress-update", {
          transferID,
          fileID: id,
          bytesSent,
        });
      });

      await transfer.start();
      ipcBus.emit("transfer-finish", transferID);
      console.log("[CONTROLLER] Transfer finished");
    } catch (err) {
      console.log("[Transfer] Transfer failed, err:", err);
      //TODO: need to configure emitting failure to front here
    }
  }
}
