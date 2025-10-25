import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(async () => {
  const tailwindcss = await import('@tailwindcss/vite');

  return {
    plugins: [react(), tailwindcss.default()],
    server: {
      proxy: {
        "/api/v1/admin": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
      host: "0.0.0.0",
      open: true,
    },
    build: {
      outDir: "../../dist/webpanel",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          management: path.resolve(__dirname, "management.html"),
        },
      },
    },
  };
});
