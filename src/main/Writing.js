import { Tranfer } from "./Controller.js";
import { headers } from "./headers.js";
import { Writable } from "stream";

export default function createChannelWriter(channel) {
  return new Writable({
    write(chunk, _encoding, callback) {
      channel
        .send(Tranfer.makeMessage(headers.chunk, chunk))
        .then(() => callback())
        .catch(callback);
    },
    final(callback) {
      channel
        .send(Tranfer.makeMessage(headers.finish))
        .then(() => callback())
        .catch(callback);
    },
  });
}
