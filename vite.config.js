import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 500,
    },
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
