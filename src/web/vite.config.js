import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      // without this on build absolute paths ruin access to js,css files in ./assets
      base: "./",
      plugins: [
        react({
          babel: {
            plugins: [["babel-plugin-react-compiler"]],
          },
        }),
      ],
    };
  } else {
    return {
      plugins: [
        react({
          babel: {
            plugins: [["babel-plugin-react-compiler"]],
          },
        }),
      ],
    };
  }
});
