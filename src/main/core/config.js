import os from "node:os";
import path from "node:path";
import { platform } from "node:process";
import { ipcBus } from "./events.js";

export function generateName() {
  const adj = [
    "Fierce",

    "Creamy",

    "Tiny",

    "Mighty",

    "Fluffy",

    "Spicy",

    "Silent",

    "Jolly",

    "Sneaky",

    "Bright",

    "Golden",

    "Rapid",

    "Cozy",

    "Witty",

    "Happy",
  ];

  const nouns = [
    "Blueberry",

    "Strawberry",

    "Tiger",

    "Panda",

    "Rocket",

    "Cinnamon",

    "Maple",

    "Fox",

    "Dolphin",

    "Marshmallow",

    "Comet",

    "Pineapple",

    "Banana",

    "Cloud",

    "Sparrow",
  ];

  const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
  };

  const name = "".concat(
    adj[getRandomInt(adj.length)],
    " ",
    nouns[getRandomInt(nouns.length)],
  );

  console.log("[DEBUG] Name is generated: ", name);

  ipcBus.emit("instance-name-generated", name);

  return name;
}

function getDownloadsFolder() {
  const home = os.homedir();

  switch (platform) {
    case "linux":
      return path.join(home, "Downloads");
    default:
      throw new Error(`[OS] Unsupported operating system: ${platform}`);
  }
}

export const config = {
  chunk_length: 64 * 1024,
  savePath: getDownloadsFolder(),
  instanceName: null,
};
