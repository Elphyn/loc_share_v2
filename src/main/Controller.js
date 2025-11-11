import { TcpConnector } from "./Connectors.js";
import { ipcBus } from "./events.js";
import { instanceDiscoveryService } from "./main.js";
import { headers } from "./headers.js";
import { createReadStream } from "fs";
import EventEmitter from "events";
import { config } from "./config.js";
import createChannelWriter from "./Writing.js";

export default class Controller {
  constructor() {
    this.connector = TcpConnector;
    this.setup();
  }

  setup() {
    ipcBus.on("tranfer-request", ({ id, files }) => {
      this.createTranfer(id, files);
    });
  }

  async createTranfer(id, files) {
    try {
      Tranfer.create(id, files, this.connector);
    } catch (err) {
      console.log("[Tranfer] Tranfer failed, err:", err);
    }
  }
}

export class Tranfer extends EventEmitter {
  static makeMessage(header, payload) {
    if (payload && !Buffer.isBuffer(payload))
      throw new Error("[WRONG MESSAGE] Payload in message should be buffer");

    let buffer = Buffer.alloc(5);
    buffer.writeUint8(header, 4);

    const payloadLen = Buffer.isBuffer(payload) ? payload.length + 1 : 1;
    buffer.writeUInt32BE(payloadLen);
    if (payload) {
      // TODO: [Improvement] Could use unsafe buffer, to not create a lot of new ones
      buffer = Buffer.concat([buffer, payload]);
    }
    return buffer;
  }

  static async create(id, files, connector) {
    const channel = await connector.connect(id);

    // notify start of the tranfer
    console.log("[TRANSFER] sending start tranfer");
    await channel.send(Tranfer.makeMessage(headers.startTranfer));
    console.log("[TRANSFER] Start");

    for (const file of files) {
      await new Promise((resolve, reject) => {
        channel.send(Tranfer.makeMessage(headers.meta));

        const stream = createReadStream(file.path, {
          highWaterMark: config.chunk_length,
        });
        const writer = createChannelWriter(channel);

        stream.pipe(writer);
      });
    }
    console.log("[TRANSFER] finished");
    channel.send(Tranfer.makeMessage(headers.finishTranfer));
  }
}
