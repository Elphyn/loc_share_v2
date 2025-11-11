import net from "net";
import { instanceDiscoveryService } from "./main.js";

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
        this.socket.on("drain", resolve);
      }
    });
  }

  static connect(id) {
    const { ip, port } = instanceDiscoveryService.getConnectionInfo(id);
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
