import getPort, { portNumbers } from "get-port";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { publishServer } from "../lib/discovery.js";

import { eventBus } from "./events.js";

export default class ServerManager {
  constructor() {
    this.server = null;
    this.myServiceID = null;
    this.serverPublishTime = null;
    this.port = null;
    this.io = null;
    this.connections = [];
    this.setup();
  }

  setup() {
    eventBus.on("no-active-server", () => {
      console.log("No active server, creating our own!");
      this.connections = [];
      this.startServer();
    });

    eventBus.on("found-server", (service) => {
      if (!this.server || service.txt.id === this.myServiceID) {
        this.betterServer(service);
        return;
      }

      const serverStartTime = new Date(service.txt.time);
      if (serverStartTime < this.serverPublishTime) {
        this.killServer();
        this.betterServer(service);
      }
    });
  }

  betterServer(service) {
    eventBus.emit("switch-server", service);
  }

  async startServer() {
    this.port = await getPort({ port: portNumbers(3000, 3100) });

    if (this.io) {
      throw new Error("Trying to start a server while one is already working");
    }

    this.server = createServer();
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log("[Server] new socket connected: ", socket.id);
      this.connections.push(socket);

      socket.on("get-connections", (callback) => {
        console.log("[Server] Asked for current connections: ");
        this.connections.forEach((item) => {
          console.log("- ", item.id);
        });
        const ids = Array.from(this.connections).map((el) => el.id);
        callback(ids);
      });

      socket.on("signal", (message) => {
        console.log(" Server received signal, redirecting");
        message.from = socket.id;
        this.io.to(message.to).emit("signal", message);
      });

      socket.on("disconnect", () => {
        console.log("[Server] socket disconneted: ", socket.id);
        this.connections.filter((item) => item !== socket.id);
        this.io.emit("socket-disconnected", socket.id);
      });

      this.io.emit("socket-connected", socket.id);
    });

    this.server.listen(this.port, () => {
      console.log("Server started listening on port: ", this.port);
      [this.myServiceID, this.serverPublishTime] = publishServer(this.port);
    });
  }

  killServer() {
    if (!this.io) {
      return new Error("Trying to kill server while there's none");
    }

    this.io.sockets.sockets.forEach((socket) => {
      socket.disconnect(true);
    });

    this.connections = [];

    this.io.close(() => {
      console.log("Closing seoket.io server");
      this.io = null;

      this.server.close(() => {
        console.log("Http server closed");
        this.server = null;
      });
    });
  }

  getConnections() {
    return this.connections;
  }
}
