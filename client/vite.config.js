import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Change to 8000 if your backend uses that
                changeOrigin: true,

      },
      '/uploads': {
        target: 'http://localhost:5000', // 🟢 This allows the cards to see the images
                changeOrigin: true,

      },
    },
  },
});