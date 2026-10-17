import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { redirectCreatePlugin } from "./vite/redirectCreate";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), redirectCreatePlugin()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        create: resolve(__dirname, "create/index.html"),
      },
    },
  },
});
