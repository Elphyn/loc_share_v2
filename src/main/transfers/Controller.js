import { TcpConnector } from "../networking/Connectors.js";
import { ipcBus } from "../core/events.js";
import Transfer from "./Transfer.js";
import { headers } from "./headers.js";

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
    });
  }

  async createIncomingTranfer() {}

  async createOutgoingTranfer(id, files, transferId) {
    try {
      const channel = await this.network.connect(id, TcpConnector);

      const localId = this.network.getAppInstanceId();

      const transfer = Transfer.create("out", channel, files, localId);

      // TODO: something tells me it's kind of not the best approach
      // Writer approach with on.on.catch was better
      transfer.on("transfer-start", () => {
        ipcBus.emit("transfer-start", transferId);
      });

      transfer.on("file-progress-update", ({ id, bytesSent }) => {
        //TODO: transfer id here,
        ipcBus.emit("file-progress-update", { transferId, id, bytesSent });
      });

      await transfer.start();
      ipcBus.emit("transfer-finish", transferId);
      console.log("[CONTROLLER] Transfer finished");
    } catch (err) {
      console.log("[Transfer] Transfer failed, err:", err);
    }
  }
}
