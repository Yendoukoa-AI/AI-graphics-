import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const hasCerts = fs.existsSync("./certs/key.pem") && fs.existsSync("./certs/cert.pem");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: hasCerts ? {
      key: fs.readFileSync("./certs/key.pem"),
      cert: fs.readFileSync("./certs/cert.pem"),
    } : false,
    proxy: {
      '/api': {
        target: hasCerts ? 'https://localhost:3001' : 'http://localhost:3001',
        secure: false, // For self-signed certificates
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
