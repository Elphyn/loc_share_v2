import nodeDataChannel from "node-datachannel";
import EventEmitter from "node:events";

export default class PeerChannel extends EventEmitter {
  constructor(socketManager) {
    super();
    this.peer = new nodeDataChannel.PeerConnection("peer", {
      iceServers: [],
    });

    this.state = "disconnected";
    this.socket = socketManager;
  }

  setupSharedListeners(id) {
    this.peer.onStateChange((state) => {
      console.log("[PEER] State: ", state);
      this.connection = state;
    });

    this.peer.onLocalDescription((description, type) => {
      this.socket.send("signal", {
        to: id,
        type,
        data: description,
      });
    });

    this.peer.onLocalCandidate((candidate, mid) => {
      this.socket.send("signal", {
        to: id,
        type: "ice",
        data: { candidate, mid },
      });
    });
  }

  onSignal({ type, data }) {
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
  }

  readyChannel() {
    this.channel.onMessage((data) => {
      this.emit("data", data);
    });
  }

  createConnection(id) {
    return new Promise((resolve, _reject) => {
      this.setupSharedListeners(id);

      this.channel = this.peer.createDataChannel("channel");

      const handleSignal = (signal) => {
        this.onSignal(signal);
      };

      this.channel.onOpen(() => {
        this.readyChannel();
        this.socket.off("signal", handleSignal);
        resolve();
      });

      this.socket.on("signal", handleSignal);
    });
  }

  respondSignal(signal) {
    return new Promise((resolve, _reject) => {
      this.setupSharedListeners(signal.from);

      this.onSignal(signal);

      const handleSignal = (signal) => {
        this.onSignal(signal);
      };

      this.socket.on("signal", handleSignal);

      this.peer.onDataChannel((dc) => {
        this.channel = dc;

        this.readyChannel();
        this.socket.off("signal", handleSignal);
        resolve();
      });
    });
  }
}
