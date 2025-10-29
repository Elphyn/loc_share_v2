import { app, BrowserWindow, ipcMain } from "electron";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import ServerManager from "./ServerManager.js";
import ServiceManager from "./ServiceManager.js";
import SocketManager from "./SocketManager.js";
import IPCManager from "./IPCManager.js";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import PeerManager from "./PeerManager.js";

export let win;
let serviceManager;
let serverManager;
let socketManager;
let ipcManager;
let peerManager;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
  win = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: true,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    win.loadURL("http://localhost:5173/");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "web/dist/index.html"));
  }

  win.removeMenu();
};

app.whenReady().then(() => {
  createWindow();
});

ipcMain.once("renderer-ready", async () => {
  serviceManager = new ServiceManager();
  serverManager = new ServerManager();
  socketManager = new SocketManager();
  ipcManager = new IPCManager();
  peerManager = new PeerManager();

  // debug
  const rl = readline.createInterface({
    input,
    output,
    prompt: "> ",
  });

  while (true) {
    const input = await rl.question(">");

    if (input === "connections") {
      const connections = serverManager.getConnections();

      console.log("You asked for connections: ");
      connections.forEach((socket) => {
        console.log(socket.id);
      });
      return;
    }
    console.log("Wrong command: ", prompt);
  }
});
