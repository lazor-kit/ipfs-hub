import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Hỗ trợ HashRouter
  define: {
    'global': 'window', // Để Buffer hoạt động
  },
  server: {
    port: 3006,
  },
});