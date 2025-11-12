import { TcpConnector } from "./Connectors.js";
import { ipcBus } from "./events.js";
import Tranfer from "./Tranfer.js";

export default class Controller {
  constructor() {
    this.connector = TcpConnector;
    this.setup();
  }

  setup() {
    ipcBus.on("tranfer-request", ({ id, files }) => {
      this.createTranfer(id, files);
    });
  }

  async createTranfer(id, files) {
    try {
      Tranfer.create(id, files, this.connector);
    } catch (err) {
      console.log("[Tranfer] Tranfer failed, err:", err);
    }
  }
}
