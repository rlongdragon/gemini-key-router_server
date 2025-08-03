import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/v1/admin": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../../dist/webpanel',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        management: path.resolve(__dirname, 'management.html'),
      },
    },
  },
});
