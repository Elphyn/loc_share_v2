import os from "node:os";
import path from "node:path";
import { platform } from "node:process";

function getDownloadsFolder() {
  const home = os.homedir();

  switch (platform) {
    case "linux":
      return path.join(home, "Downloads");
      break;
    default:
      throw new Error("[CONFIG] Unsupported operating system");
  }
}

export const config = {
  chunk_length: 64 * 1024,
  savePath: getDownloadsFolder(),
};
