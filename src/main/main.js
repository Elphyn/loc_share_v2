import { app, BrowserWindow, ipcMain } from "electron";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import IPCManager from "./IPCManager.js";
import Controller from "./Controller.js";
import InstanceDiscoveryService from "./Services.js";

export let win;
export let instanceDiscoveryService;

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
  instanceDiscoveryService = new InstanceDiscoveryService();
  controller = new Controller();

  ipcManager = new IPCManager();
});

app.on("before-quit", async (event) => {
  console.log("[ELECTRON] Running cleanup before exit");
  event.preventDefault();
  await controller.cleanup();
  app.exit(0);
});
