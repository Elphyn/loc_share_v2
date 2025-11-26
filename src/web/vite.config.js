import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // without this on build absolute paths ruin access to js,css files in ./assets
  base: "./",
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
