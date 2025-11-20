import net from "net";

// TODO: This shouldn't return socket on connection, it should
// return a channel class, first make this class
// not really a class maybe, just an object that has certain fields
// like don't give the socket, give an object with a few functions
// send: async (data) => await this.send(data)
// something like that
export class TcpConnector {
  constructor(socket) {
    this.socket = socket;
  }

  async send(data) {
    return new Promise((resolve, reject) => {
      const ok = this.socket.write(data, (err) => {
        if (err) return reject(err);
        resolve();
      });

      if (!ok) {
        this.socket.once("drain", resolve);
      }
    });
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
        resolve(new TcpConnector(socket));
      });

      socket.on("error", () => {
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
