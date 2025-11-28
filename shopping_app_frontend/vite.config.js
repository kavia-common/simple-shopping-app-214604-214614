import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite v4 configuration (Node 18 compatible).
 * Avoids Node 20-only APIs and Vite 5+ options.
 * Docs: https://v4.vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  base: '/',
  esbuild: {
    target: 'es2020',
  },
  optimizeDeps: {
    // Some CI environments + Node 18 + older plugin graph can trigger optimizer
    // code paths that rely on newer Node APIs. Disable pre-optimization to avoid it.
    disabled: true,
  },
  build: {
    target: 'es2020',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // Let Vite infer allowed hosts and HMR target from the request origin to avoid blocking on unknown hostnames.
    // Removing allowedHosts and explicit hmr host prevents WS connection errors that can blank the UI in preview runners.
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
})
