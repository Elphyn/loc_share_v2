import net from "net";
import EventEmitter from "node:events";
import getPort, { portNumbers } from "get-port";
import bonjour from "bonjour";
import { ipcBus } from "./events.js";

export default class InstanceDiscoveryService {
  constructor() {
    this.serverManager = new ServerManager();
    this.discoveryManager = new DiscoveryManager();
    this.nearbyDevices = new Map();
    this.setup();
  }

  async setup() {
    const port = await this.serverManager.createServer();
    this.serverManager.on("data", this.handleData);

    this.discoveryManager.pubish("tcp", port);
    this.discoveryManager.browse("tcp");

    this.discoveryManager.on("instance-up", (instance) => {
      this.onDiscoveredInstanceUp(instance);
    });
    this.discoveryManager.on("instance-down", (instance) => {
      this.onDiscoveredInstanceDown(instance);
    });
  }

  async cleanup() {
    await this.discoveryManager.cleanup();
    await this.serverManager.cleanup();
  }

  getConnectionInfo(id) {
    const ip = this.nearbyDevices.get(id).addresses[0];
    const port = this.nearbyDevices.get(id).port;
    return {
      ip,
      port,
    };
  }

  onDiscoveredInstanceUp(instance) {
    console.log("[Service] Found nearby device, id: ", instance.txt.id);
    this.nearbyDevices.set(instance.txt.id, instance);
    ipcBus.emit("nearby-device-found", { id: instance.txt.id });
  }

  onDiscoveredInstanceDown(instance) {
    console.log("[Service] Nearby device disconnected, id: ", instance.txt.id);
    this.nearbyDevices.delete(instance.txt.id);
    ipcBus.emit("nearby-device-lost", instance.txt.id);
  }

  handleData(data) {
    console.log("Received data: ", data);
  }
}

class ServerManager extends EventEmitter {
  constructor() {
    super();
    this.server = null;
    this.port = null;
  }

  async createServer() {
    this.server = net.createServer((socket) => {
      socket.on("data", (data) => {
        this.emit("data", data);
      });
    });

    this.port = await getPort({ port: portNumbers(3000, 3100) });

    await new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log("[SERVER] Server started");
        resolve();
      });
    });

    return this.port;
  }

  getServerPort() {
    return this.port;
  }

  cleanup() {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log("[SERVER] closed");
        resolve();
      });
    });
  }
}

class DiscoveryManager extends EventEmitter {
  constructor() {
    super();
    this.bonjour = bonjour();
    this.browser = null;
    this.localInstanceId = null;
  }

  browse(type) {
    this.browser = this.bonjour.find({ type: type });

    this.browser.on("up", (instance) => {
      if (!instance.name.startsWith("loc-share-inst")) return;
      if (instance.txt.id === this.localInstanceId) return;
      this.emit("instance-up", instance);
    });

    this.browser.on("down", (instance) => {
      if (!instance.name.startsWith("loc-share-inst")) return;
      if (instance.txt.id === this.localInstanceId) return;
      this.emit("instance-down", instance);
    });
  }

  pubish(type, port) {
    this.localInstanceId = crypto.randomUUID();
    this.bonjour.publish({
      name: `loc-share-inst-${this.localInstanceId}`,
      type: type,
      port: port,
      txt: {
        id: this.localInstanceId,
      },
    });
  }

  cleanup() {
    return new Promise((resolve) => {
      this.browser.stop();
      this.bonjour.unpublishAll(() => {
        console.log("[BONJOUR] Unpublishing ourselves");
        this.bonjour.destroy();
        resolve();
      });
    });
  }
}
