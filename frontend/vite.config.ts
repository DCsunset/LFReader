import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    },
    headers: {
      "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:"
    }
  },
	plugins: [preact()],
});
