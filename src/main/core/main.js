import { app, BrowserWindow, ipcMain } from "electron";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import IPCManager from "../ipc/IPCManager.js";
import Controller from "../transfers/Controller.js";
import NetworkManager from "../networking/Network.js";
import { config, generateName } from "./config.js";

export let win;
export let network;

let ipcManager;
let controller;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
  win = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: true,
    maximizable: false,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, "../ipc/preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    win.loadURL("http://localhost:5173/");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../../web/dist/index.html"));
  }

  win.removeMenu();
};

app.whenReady().then(() => {
  createWindow();
});

ipcMain.once("renderer-ready", async () => {
  ipcManager = new IPCManager();
  config.instanceName = generateName();

  network = new NetworkManager();
  controller = new Controller(network);
});

app.on("before-quit", async (event) => {
  console.log("[ELECTRON] Running cleanup before exit");
  event.preventDefault();
  await network.cleanup();
  app.exit(0);
});
