import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [react(), basicSsl()],
  plugins: [react()],
  server: {
    // watch: {
    //     usePolling: true,
    // },
    // host: true,
    // https: true,
    strictPort: true,
    // port: 5173,
  }
});
