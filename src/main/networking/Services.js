import net from "net";
import EventEmitter from "node:events";
import getPort, { portNumbers } from "get-port";
import bonjour from "bonjour";
import { ipcBus } from "../core/events.js";
import { messageParser } from "../core/main.js";
import MessageParser from "../transfers/MessageParser.js";
import IncomingChannel from "../transfers/Channel.js";
import { channel } from "node:diagnostics_channel";

// TODO: Should probably rename an this to network
// Also Should rename the file itself
export default class InstanceDiscoveryService extends EventEmitter {
  constructor() {
    super();
    this.serverManager = new ServerManager();
    this.discoveryManager = new DiscoveryManager();
    this.nearbyDevices = new Map();
    // TODO: should make a static method that waits for this sevice to be ready
    // so, create properly, then return, then other parts of the program that are depended on it can be created
    this.setup();
  }

  getAppInstanceId() {
    return this.discoveryManager.getLocalInstanceId();
  }

  connect(id, connector) {
    if (!this.nearbyDevices.has(id))
      throw new Error("[CONNECTION FAILURE] No such id in nearbyDevices");
    const { ip, port } = this.getConnectionInfo(id);
    const channel = connector.connect(ip, port);
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
    ipcBus.emit("nearby-device-found", { id: instance.txt.id });
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
        this.emit("transfer-request", { transfer: transferInfo, channel });
      });
    });

    // TODO: starting server could fail due to this line
    // so wrap in protection and retry
    this.port = await getPort({ port: portNumbers(3000, 3100) });

    await new Promise((resolve) => {
      // this could fail if both instances start at the same moment
      // probabl could just wrap in retry
      // due to port
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
