import { app, BrowserWindow, ipcMain } from "electron";
import path, { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ServerManager from "./ServerManager.js";
import ServiceManager from "./ServiceManager.js";
import SocketManager from "./SocketManager.js";
import IPCManager from "./IPCManager.js";

export let win
let serviceManager
let serverManager
let socketManager
let ipcManager


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


const createWindow = () => {
  win = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: true,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // preload: pathToFileURL(path.join(__dirname, "preload.js")).href,
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

ipcMain.once('renderer-ready', () => {
  serviceManager = new ServiceManager()
  serverManager = new ServerManager()
  socketManager = new SocketManager()
  ipcManager = new IPCManager()
})




