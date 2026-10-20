import { defineConfig } from 'vite';

export default defineConfig({
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
  preview: { host: '127.0.0.1', port: 5175, strictPort: true },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks(id) { if (id.replaceAll('\\', '/').includes('/node_modules/three/')) return 'three'; } } },
  },
});
