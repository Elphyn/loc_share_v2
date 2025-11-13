import { TcpConnector } from "../networking/Connectors.js";
import { ipcBus } from "../core/events.js";
import Tranfer from "./Tranfer.js";
import { instanceDiscoveryService } from "../core/main.js";
import { headers } from "./headers.js";

export default class Controller {
  constructor() {
    this.connector = TcpConnector;
    // this.network = instanceDiscoveryService;
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
      Tranfer.create(id, files, this.connector);
    } catch (err) {
      console.log("[Tranfer] Tranfer failed, err:", err);
    }
  }
}
