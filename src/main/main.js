import { start } from './serverManager.js'
import { app, BrowserWindow, ipcMain } from "electron";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getServiceProvider } from './serverManager.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export let win

const createWindow = () => {
  win = new BrowserWindow({
    width: 500,
    height: 900,
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
    win.loadFile(path.join(__dirname, "renderer/dist/index.html"));
  }


  win.removeMenu();
};

app.whenReady().then(() => {
  createWindow();
  start()
});

ipcMain.handle("get-service", () => {
  let service = getServiceProvider()
  console.log("sending service: ", service)
  return service
})



