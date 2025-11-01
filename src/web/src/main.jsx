import { StrictMode } from "react";
import { Buffer } from "buffer";
import process from "process";

window.Buffer = Buffer;
window.process = process;
window.global = window;

import { createRoot } from "react-dom/client";
import "./index.css";
import "./globals.css";
import App from "./App.jsx";
import { IPCProvider } from "./contexts/useIPCContext.jsx";
import { FileProvider } from "./contexts/useFileContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <IPCProvider>
      <FileProvider>
        <App />
      </FileProvider>
    </IPCProvider>
  </StrictMode>,
);
