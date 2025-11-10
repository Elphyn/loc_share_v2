import net from "net";
import { instanceDiscoveryService } from "./main.js";

export class TcpConnector {
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
        resolve({
          send: (data) => socket.write(data),
          disconnect: () => socket.close(),
          // buffer size as well, for backpressure
        });
      });

      socket.on("error", () => {
        reject("Connection failed");
      });
    });
  }
}

export class WrtcConnector {
  static negotiate() {}
  static connect(id) {
    const { ip, port } = instanceDiscoveryService.getConnectionInfo(id);
  }
}
