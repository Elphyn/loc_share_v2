import { headers } from "./headers.js";
import { Writable } from "stream";
import MessageParser from "./MessageParser.js";

export function createChannelWriter(channel) {
  return new Writable({
    write(chunk, _encoding, callback) {
      const onSent = () => {
        this.emit("chunk-sent", chunk.length);
        callback();
      };
      channel
        .send(MessageParser.makeMessage(headers.chunk, chunk))
        .then(onSent)
        .catch(callback);
    },
    final(callback) {
      console.log("[DEBUG] Transfer actually finished");
      channel
        .send(MessageParser.makeMessage(headers.finish))
        .then(() => callback())
        .catch(callback);
    },
  });
}

// export function createFileWriter(path) {
//   return new Writable({
//     write(chunk, _encoding, callback) {
//
//     }
//   })
// }
