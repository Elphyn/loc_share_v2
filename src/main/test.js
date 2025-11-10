import { MessageParser } from "./Services.js";

const payload = 123456789;
const type = 5;

let buffer = Buffer.alloc(5);
buffer.writeUInt32BE(payload, 1);
buffer.writeUint8(type, 0);

const len = Buffer.alloc(4);
len.writeUInt32BE(buffer.length);

buffer = Buffer.concat([len, buffer]);

console.log("Generated buffer:");
console.log(buffer);
console.log("Importing");

const messageParser = new MessageParser();

messageParser.on("message", (message) => {
  console.log("Got: ", message);
});

messageParser.feed(buffer);
