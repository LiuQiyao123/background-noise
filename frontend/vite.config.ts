import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/watchdog': {
        target: 'http://127.0.0.1:18790',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/watchdog/, ''),
      },
    },
  },
});
