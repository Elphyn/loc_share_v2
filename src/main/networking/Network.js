import net from "net";
import EventEmitter from "node:events";
import getPort, { portNumbers } from "get-port";
import bonjour from "bonjour";
import { ipcBus } from "../core/events.js";
import IncomingChannel from "../transfers/IncomingChannel.js";
import { config } from "../core/config.js";

export default class NetworkManager extends EventEmitter {
  constructor() {
    super();
    this.serverManager = new ServerManager();
    this.discoveryManager = new DiscoveryManager();
    this.nearbyDevices = new Map();
    // TODO: should make a static method that waits for this sevice to be ready
    // so, create properly, then return, then other parts of the program that are depended on it can be created
    this.setup();
  }

  getAppInstanceID() {
    return this.discoveryManager.getLocalInstanceId();
  }

  async connect(id, connector) {
    console.log("[DEBUG NETWORK] connect triggered ");
    if (!this.nearbyDevices.has(id))
      throw new Error("[CONNECTION FAILURE] No such id in nearbyDevices");
    const { ip, port } = this.getConnectionInfo(id);
    const channel = await connector.connect(ip, port);
    return channel;
  }

  async setup() {
    const port = await this.serverManager.createServer();

    this.serverManager.on("transfer-request", (channel) => {
      this.emit("transfer-request", channel);
    });

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
    ipcBus.emit("nearby-device-found", {
      id: instance.txt.id,
      name: instance.txt.name,
    });
  }

  onDiscoveredInstanceDown(instance) {
    console.log("[Service] Nearby device disconnected, id: ", instance.txt.id);
    this.nearbyDevices.delete(instance.txt.id);
    ipcBus.emit("nearby-device-lost", instance.txt.id);
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
      const channel = new IncomingChannel(socket);
      channel.on("transfer-request", (transferInfo) => {
        this.emit("transfer-request", { meta: transferInfo, channel });
      });
    });

    while (true) {
      this.port = await getPort({ port: portNumbers(3000, 3100) });

      const success = await new Promise((resolve) => {
        // this could fail due to port being used already
        try {
          this.server.listen(this.port, "0.0.0.0", () => {
            console.log("[SERVER] Server started on port: ", this.port);
            resolve(true);
          });
        } catch (err) {
          console.log("[DEBUG] failed to start on port ", this.port);
          resolve(false);
        }
      });
      if (success) break;
    }

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

  getLocalInstanceId() {
    return this.localInstanceId;
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
        name: config.instanceName,
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
