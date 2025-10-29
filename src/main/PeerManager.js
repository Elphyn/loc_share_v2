import SimplePeer from "simple-peer";
import { eventBus } from "./events.js";
import wrtc from "@roamhq/wrtc";

export default class PeerManager {
  constructor() {
    this.setup();
    this.peer = null;
  }

  setup() {
    eventBus.on("peer-connection-request", (socketID) => {
      this.connect(socketID);
    });

    eventBus.on("peer-connection-offer", ({ from, data }) => {
      if (!this.peer) {
        this.peer = new SimplePeer({ initiator: false, wrtc });

        this.peer.on("signal", (offer) => {
          eventBus.emit("signal-redirect", {
            to: from,
            data: offer,
          });
        });

        this.peer.on("connect", () => {
          console.log("[PEER] P2P Connected!");
        });
      }

      this.peer.signal(data);
    });
  }

  connect(socketID) {
    if (this.peer)
      throw new Error(
        "Attempted to connect while already having peer connection",
      );

    console.log("[PEER] Creating peer");
    this.peer = new SimplePeer({
      initiator: true,
      wrtc,
    });

    this.peer.on("signal", (offer) => {
      eventBus.emit("signal-redirect", {
        to: socketID,
        data: offer,
      });
    });

    this.peer.on("connect", () => {
      console.log("[PEER] P2P Connected!");
    });
  }
}
