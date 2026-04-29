import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // Required when serving through Cloudflare Tunnel — Vite 5.1+ rejects
    // unknown Host headers by default.
    allowedHosts: ["dev.isums.pro", "localhost", "127.0.0.1"],
    // HMR client needs to know it's reaching the dev server over public
    // HTTPS (port 443) rather than localhost:5173.
    hmr: {
      host: "dev.isums.pro",
      protocol: "wss",
      clientPort: 443,
    },
  },
});
