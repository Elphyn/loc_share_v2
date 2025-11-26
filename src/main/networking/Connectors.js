import net from "net";
import MessageParser from "../transfers/MessageParser.js";
import { TcpFileChannel } from "../transfers/OutgoingChannel.js";

// TODO: This shouldn't return socket on connection, it should
// return a channel class, first make this class
// not really a class maybe, just an object that has certain fields
// like don't give the socket, give an object with a few functions
// send: async (data) => await this.send(data)
// something like that
export class TcpConnector {
  constructor(socket) {
    this.socket = socket;
    this.messageParser = new MessageParser();
  }

  static connect(ip, port) {
    return new Promise((resolve, reject) => {
      console.log("[CONNECTOR] Starting connection");
      const socket = net.createConnection({
        host: ip,
        port,
      });

      socket.on("connect", () => {
        console.log("[CONNECTOR] Connected");
        const channel = new TcpFileChannel(socket);
        resolve(channel);
      });
      // TODO: should grab error here
      socket.on("error", (error) => {
        console.log("[CONNECTION FAILURE] Connection failed due to: ", error);
        reject("Connection failed");
      });
    });
  }
}
// export class WrtcConnector {
//   static negotiate() {}
//   static connect(id) {
//     const { ip, port } = instanceDiscoveryService.getConnectionInfo(id);
//   }
// }
