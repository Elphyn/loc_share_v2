import { Readable, Writable } from "stream";

export function createChannelWriter(channel) {
  return new Writable({
    write(chunk, _encoding, callback) {
      const onSent = () => {
        this.emit("chunk-sent", chunk.length);
        callback();
      };
      channel.sendFileChunk(chunk).then(onSent).catch(callback);
    },
    final(callback) {
      channel
        .sendFileFinish()
        .then(() => callback())
        .catch(callback);
    },
  });
}

export class ChannelReadable extends Readable {
  constructor(channel, options = {}) {
    super(options);

    this.channel = channel;

    this.bytesWritten = 0;

    channel.on("file-chunk", (chunk) => {
      console.log("[IMPORTANT] In file-chunk event in ChannelReadable");
      const ok = this.push(chunk);
      this.bytesWritten += chunk.length;
      this.emit("progress-change", this.bytesWritten);
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
