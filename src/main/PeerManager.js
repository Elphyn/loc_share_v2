import { eventBus } from "./events.js";
import { createReadStream } from "fs";
import nodeDataChannel from "node-datachannel";

nodeDataChannel.initLogger("Error");

export default class PeerManager {
  constructor() {
    this.setup();
    this.peer = null;
    this.channel = null;
    this.connection = "Disconnected";
  }

  setup() {
    eventBus.on("peer-connection-request", (socketID) => {
      this.connect(socketID);
    });

    eventBus.on("peer-connection-offer", ({ from, data, type }) => {
      console.log(`[PEER RECEIVER] type: ${type}`);
      console.log("[PEER RECEIVER] data: ", data);
      if (!this.peer) {
        this.peer = new nodeDataChannel.PeerConnection("pc", {
          iceServers: [],
        });

        this.peer.onStateChange((state) => {
          console.log("[PEER] State: ", state);
          this.connection = state;
        });

        this.peer.onLocalDescription((description, type) => {
          console.log("[PEER] Generated local description");
          eventBus.emit("signal-redirect", {
            to: from,
            type: type,
            data: description,
          });
        });

        this.peer.onLocalCandidate((candidate, mid) => {
          console.log("[PEER] Generated candidate");
          eventBus.emit("signal-redirect", {
            to: from,
            type: "ice",
            data: { candidate, mid },
          });
        });

        this.peer.onDataChannel((dc) => {
          console.log(`[PEER RECEIVER] Datachannel is created by`);
          this.channel = dc;

          this.channel.onMessage((msg) => {
            console.log("[PEER] Received: ", msg);
          });
        });
      }
      switch (type) {
        case "offer":
          this.peer.setRemoteDescription(data, type);
          break;
        case "answer":
          this.peer.setRemoteDescription(data, type);
          break;
        case "ice":
          this.peer.addRemoteCandidate(data.candidate, data.mid);
          break;
      }
    });

    eventBus.on("peer-file-request", (file) => {
      const stream = createReadStream(file.path);

      stream.on("data", (data) => {
        console.log("[FILE] Sending binary: ", data);
        this.channel.sendMessageBinary(data);
      });
    });
  }

  connect(socketID) {
    console.log("[PEER] connect triggered");
    this.peer = new nodeDataChannel.PeerConnection("pc", {
      iceServers: [],
    });

    this.peer.onStateChange((state) => {
      console.log("[PEER] State: ", state);
      this.connection = state;
    });

    this.peer.onLocalDescription((description, type) => {
      console.log("[PEER] Generated local description");
      eventBus.emit("signal-redirect", {
        to: socketID,
        type: type,
        data: description,
      });
    });

    this.peer.onLocalCandidate((candidate, mid) => {
      console.log("[PEER] Generated candidate");
      eventBus.emit("signal-redirect", {
        to: socketID,
        type: "ice",
        data: { candidate, mid },
      });
    });

    this.channel = this.peer.createDataChannel("test");

    this.channel.onOpen(() => {
      console.log("[PEER] dc channel is open");
      this.channel.sendMessage("[PEER] message on opening channel");
      this.channel.onMessage((msg) => {
        console.log("[PEER MESSAGE] ", msg);
      });
    });
  }
}
