import { TcpConnector } from "./Connectors.js";
import { ipcBus } from "./events.js";
import { instanceDiscoveryService } from "./main.js";

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
      const tranfer = await Tranfer.create(id, files, this.connector);
      console.log("[Transfer] Tranfer finished");
    } catch (err) {
      console.log("[Tranfer] Tranfer failed, err:", err);
    }
  }
}

class Tranfer {
  static async create(id, files, connector) {
    const channel = await connector.connect(id);

    console.log("[Tranfer] Sending hello to socket");
    channel.send("Hello");
  }
}

class TranferService extends EventEmitter {
  constructor() {
    super();
  }
}
