import { eventBus } from "./events.js";
import { win } from "./main.js";

export default class IPCManager {
  constructor() {
    this.setup()
  }

  setup() {
    eventBus.on("backend-connected", () => {
      win.webContents.send("server-connected")
    })
    eventBus.on("connections-list-reset", (connections) => {
      win.webContents.send("connections-list-reset", connections)
    })
    eventBus.on("connections-list-connection", (id) => {
      win.webContents.send("connections-list-connection", id)
    })
    eventBus.on("connections-list-removal", (id) => {
      win.webContents.send("connections-list-removal", id)
    })
  }
}

