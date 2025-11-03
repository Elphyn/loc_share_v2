import { io } from "socket.io-client";
import { eventBus } from "./events.js";
import EventEmitter from "node:events";

export default class SocketManager extends EventEmitter {
  constructor() {
    super();
    this.socket = null;
    this.currentServiceId = null;
    this.io = null;
    this.connectionState = false;
    this.cleanup = null;
    this.serverConnections = [];
    this.setup();
  }

  setup() {
    console.log("[Client] Calling setup on SocketManager");
    eventBus.on("switch-server", (service) => {
      console.log("[IMPORTANT] switch server triggered");
      if (service.txt?.id === this.currentServiceId) return;
      this.connect(`http://${service.addresses[0]}:${service.port}`);
    });

    eventBus.on("signal-redirect", ({ to, data, type }) => {
      if (!this.socket || !this.connectionState)
        throw new Error("No socket or no connection on signal-redirect");
      this.socket.emit("signal", {
        type,
        to,
        data,
      });
    });

    this.startSearch();
  }

  startSearch() {
    eventBus.emit("no-service-active");
  }

  send(event, data) {
    this.socket.emit(event, data);
  }

  disconnect() {
    this.socket.disconnect();
    this.socket.close(); // hahahsahahahahahhaha kill me
    this.removeListeners();
    this.serverConnections = [];
  }

  setupEventListeners() {
    const onConnect = () => {
      console.log("Clientside is connected!");
      eventBus.emit("backend-connected", this.socket.id);
      this.connectionState = true;
    };

    const onDisconnect = () => {
      console.log("lost connection to a server");
      this.connectionState = false;
      this.socket.close(); // what a joke
      this.removeListeners();
      this.serverConnections = [];
      this.startSearch();
    };

    const onNewConnection = (id) => {
      console.log("New connection: ", id);
      this.addToList(id);
    };

    const onDisconnectedSocket = (id) => {
      this.removeFromList(id);
    };

    const onSignal = (signal) => {
      this.emit("signal", signal);
    };

    this.socket.on("connect", onConnect);
    this.socket.on("disconnect", onDisconnect);
    this.socket.on("socket-connected", onNewConnection);
    this.socket.on("socket-disconnected", onDisconnectedSocket);
    this.socket.on("signal", onSignal);

    return () => {
      this.socket.off("connect", onConnect);
      this.socket.off("disconnect", onDisconnect);
      this.socket.off("new-connection", onNewConnection);
      this.socket.off("socket-disconnected", onDisconnectedSocket);
      this.socket.off("signal", onSignal);
    };
  }

  connect(adress) {
    if (this.connectionState) this.disconnect();

    console.log("[IMPORTANT] Client connecting to ", adress);

    this.socket = io(adress);

    this.cleanup = this.setupEventListeners();

    this.socket.emit("get-connections", (connections) => {
      console.log("[Client] List we got from the server: ");
      connections.forEach((item) => {
        console.log("- ", item);
      });
      this.resetList(connections);
    });
  }

  resetList(connections) {
    this.serverConnections = connections;

    eventBus.emit("connections-list-reset", this.serverConnections);
  }

  addToList(id) {
    if (this.serverConnections.includes(id)) return;
    this.serverConnections.push(id);
    eventBus.emit("connections-list-connection", id);
  }

  removeFromList(id) {
    console.log("This socket disconnected: ", id);
    this.serverConnections = this.serverConnections.filter((x) => x !== id);
    eventBus.emit("connections-list-removal", id);
  }

  removeListeners() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
  }
}
