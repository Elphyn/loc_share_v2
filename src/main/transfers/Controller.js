import { TcpConnector } from "../networking/Connectors.js";
import { ipcBus } from "../core/events.js";
import Tranfer from "./Tranfer.js";
import { headers } from "./headers.js";

export default class Controller {
  constructor(network) {
    this.connector = TcpConnector;
    this.network = network;
    this.busy = false;
    this.setup();
  }

  setup() {
    ipcBus.on("tranfer-request", ({ id, files }) => {
      this.createTranfer(id, files);
    });
    // this.network.on("server-message", ({ type, payload }) => {
    //   if (type !== headers.startTranfer || this.busy) return;
    // });
  }

  async receiveTranfer() {}

  async createTranfer(id, files) {
    try {
      const channel = await this.network.connect(id, TcpConnector);
      const tranfer = Tranfer.create("out", channel, files);
      // TODO: supposed to tack changes here
      await tranfer.start();
      console.log("[CONTROLLER] Tranfer finished");
    } catch (err) {
      console.log("[Tranfer] Tranfer failed, err:", err);
    }
  }
}
