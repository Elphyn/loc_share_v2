import EventEmitter from "node:events";
import { headers } from "./headers.js";
import MessageParser from "./MessageParser.js";

export default class IncomingChannel extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.socketId = crypto.randomUUID();
    this.messageParser = new MessageParser();
    this.bonjourId = null;
    this.setup();
  }

  setup() {
    this.messageParser.on("message", (message) => {
      this.handleMessage(message);
    });
    this.socket.on("data", (data) => {
      this.messageParser.feed(data);
    });
  }

  handleMessage(message) {
    switch (message.type) {
      case headers.startTransfer:
        this.handleTranferRequest(message);
        break;
      case headers.meta:
        this.handleFileMeta(message);
        break;
      case headers.chunk:
        this.emit("file-chunk", message.payload);
        break;
      case headers.finish:
        this.emit("file-finished");
        break;
      case headers.finishTransfer:
        this.emit("tranfer-finished");
        break;
      default:
        throw new Error("[CHANNEL] wrong header in message");
    }
  }

  handleTranferRequest(message) {
    // here I planned to have some relation of socketId and bonjour Id that instance assigns to itself
    // beccause that's what's user sees, not socketId
    this.bonjourId = message.payload.toString();
    this.emit("transfer-request");
  }

  handleFileMeta(message) {
    const fileMeta = message.payload.toString();
    this.emit("file-meta", JSON.parse(fileMeta));
  }
}
