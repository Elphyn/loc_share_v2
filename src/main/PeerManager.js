import { eventBus } from "./events.js";
import { createReadStream } from "fs";
import EventEmitter from "node:events";
import PeerChannel from "./PeerChannel.js";

export default class PeerManager extends EventEmitter {
  constructor(socketManager) {
    super();
    this.connections = new Map();
    this.socketManager = socketManager;
    this.setup();
  }

  setup() {
    eventBus.on("peer-connection-request", (socketID) => {
      console.log("[EVENTBUS] catched connection request in PeerManager");
      this.connect(socketID);
    });

    // eventBus.on("peer-file-request", (file) => {
    //   const stream = createReadStream(file.path);
    //
    //   stream.on("data", (data) => {
    //     console.log("[FILE] Sending binary: ", data);
    //     this.channel.sendMessageBinary(data);
    //   });
    // });

    this.socketManager.on("signal", (signal) => {
      const senderID = signal.from;

      if (this.connections.has(senderID)) return;

      const channel = new PeerChannel(this.socketManager);
      this.connections.set(senderID, channel);

      channel.respondSignal(signal).then(() => {
        console.log("[PEER] Connected to ", id);
        channel.on("data", (data) => {
          this.emit("data", {
            from: senderID,
            data,
          });
        });
      });
    });
  }

  connect(id) {
    if (this.connections.has(id)) return;
    console.log("[CONNECT] triggered connect to: ", id);

    const channel = new PeerChannel(this.socketManager);

    this.connections.set(id, channel);
    channel.createConnection(id).then(() => {
      console.log("[PEER] Connected to ", id);
      channel.on("data", (data) => {
        this.emit("data", {
          from: id,
          data,
        });
      });
    });
  }
}
