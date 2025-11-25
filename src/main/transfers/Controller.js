import { TcpConnector } from "../networking/Connectors.js";
import { ipcBus } from "../core/events.js";
import OutgoingTransfer from "./OutgoingTransfer.js";
import IncomingTransfer from "./IncomingTransfer.js";

export default class Controller {
  constructor(network) {
    this.connector = TcpConnector;
    this.network = network;
    this.busy = false;
    this.setup();
  }

  setup() {
    ipcBus.on("transfer-request", async ({ id, files }) => {
      const { _transferID, transfer } = OutgoingTransfer.create(id, files);

      await transfer.ready();
    });

    this.network.on("transfer-request", ({ meta, channel }) => {
      const { _transferID, transfer } = IncomingTransfer.create(channel, meta);
    });
  }
}
