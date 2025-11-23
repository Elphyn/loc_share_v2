import { headers } from "./headers.js";
import { Readable, Writable } from "stream";

export function createChannelWriter(channel) {
  return new Writable({
    write(chunk, _encoding, callback) {
      const onSent = () => {
        this.emit("chunk-sent", chunk.length);
        callback();
      };
      channel.send(headers.chunk, chunk).then(onSent).catch(callback);
    },
    final(callback) {
      channel
        .send(headers.finish)
        .then(() => callback())
        .catch(callback);
    },
  });
}

export class ChannelReadable extends Readable {
  constructor(channel, options = {}) {
    super(options);

    this.channel = channel;

    channel.on("file-chunk", (chunk) => {
      const ok = this.push(chunk);

      // not ok - no more room in buffer, need to slow down
      if (!ok) {
        channel.pause();
      }
    });

    channel.on("file-finished", () => {
      this.push(null);
    });
  }

  _read() {
    this.channel.resume();
  }
}
