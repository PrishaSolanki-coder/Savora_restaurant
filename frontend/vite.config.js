import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // During local development, any request the frontend makes to /api/*
    // gets forwarded to the Express backend running on port 5000.
    // This avoids CORS issues in dev and mirrors how it will work in production.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
