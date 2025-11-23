// TODO:
// 1) Make a file stream
// 2) Adjust message parser so it's using injected MessageParser for headers and payload preparing

import EventEmitter from "events";
import { headers } from "./headers.js";
import { config } from "../core/config.js";
import { createChannelWriter } from "./Writing.js";
import { createReadStream, createWriteStream } from "fs";

export class FileStream extends EventEmitter {
  constructor() {
    super();
    this.ready = null;
  }

  static receive(channel, meta) {
    const instance = new FileStream();

    instance.ready = (async () => {
      const handleFile = async (fileID) => {
        const fileChunks = new ChannelReadable(channel);

        // TODO: need to check whether the file already exists, so as to not override it but create a second one
        const writeStream = createWriteStream(
          path.join(config.savePath, meta.files[fileID].name),
        );

        await new Promise((resolve, reject) => {
          fileChunks
            .pipe(writeStream)
            .on("finish", resolve)
            .on("error", reject);
        });
      };

      try {
        await new Promise((resolve, reject) => {
          const listener = (fileID) => {
            handleFile(fileID).catch((err) => {
              channel.stopOnError(err);
            });
          };

          channel.on("transfer-file-start", listener);

          channel.once("transfer-finished", () => {
            channel.off("transfer-file-start", listener);
            resolve();
          });

          channel.once("error", (err) => {
            channel.off("transfer-file-start", listener);
            reject(err);
          });
        });
      } catch (err) {
        instance.emit("error", err);
      }
    })();

    return instance;
  }

  // TODO: remember to return properly for chaining listeners
  static create(channel, files, localID) {
    const instance = new FileStream();

    instance.ready = (async () => {
      try {
        const meta = JSON.stringify({
          from: localID,
          // removing local path of files we're sending
          // other instance doesn't need to know that
          files: Object.entries(files).reduce(
            (obj, [id, { path, ...rest }]) => {
              obj[id] = rest;
              return obj;
            },
            {},
          ),
        });

        await channel.send(headers.startTransfer, meta);
        instance.emit("transfer-start");

        for (const [id, file] of Object.entries(files)) {
          await channel.send(headers.file, id);

          const stream = createReadStream(file.path, {
            highWaterMark: config.chunk_length,
          });

          const channelWriter = createChannelWriter(channel);

          await new Promise((resolve, reject) => {
            stream
              .pipe(channelWriter)
              .on("finish", resolve)
              .on("chunk-sent", (bytes) => {
                instance.emit("progress-change", {
                  fileID: id,
                  bytesSent: bytes,
                });
              })
              .on("error", reject);
          });
        }

        await channel.send(headers.finishTransfer);
        instance.emit("transfer-finished");
      } catch (err) {
        instance.emit("error", err);
      }
    })();

    return instance;
  }
}
