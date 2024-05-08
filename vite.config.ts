import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/cb-merch/',
  plugins: [react()],
  server: {
    strictPort: true,
    // port: 5173,
  }
});
