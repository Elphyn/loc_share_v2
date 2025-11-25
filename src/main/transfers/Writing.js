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

    this._onChunk = this.handleChunk.bind(this);
    channel.on("file-chunk", this._onChunk);

    channel.on("file-finished", () => {
      // cleanup
      channel.off("file-chunk", this._onChunk);
      // no more chunk can be pushed in
      this.push(null);
    });
  }

  handleChunk(chunk) {
    console.log("[IMPORTANT] In file-chunk event in ChannelReadable");
    const ok = this.push(chunk);
    this.bytesWritten += chunk.length;
    this.emit("progress-change", this.bytesWritten);
    // not ok - no more room in buffer, need to slow down
    if (!ok) {
      this.channel.pause();
    }
  }

  _read() {
    this.channel.resume();
  }
}
