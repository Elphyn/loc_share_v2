import { createReadStream } from "fs";
import { Transfer } from "./Transfer.js";
import { headers } from "./headers.js";

const stream = createReadStream("/home/vlad/Pictures/mountain_black.jpg");

stream.on("data", (data) => {
  const message = MessageParser.makeMessage(headers.chunk, data);
  console.log("Message: ", message);
});
