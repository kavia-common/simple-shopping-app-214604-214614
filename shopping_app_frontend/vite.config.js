import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration tuned for Node 18 with Vite v4.x.
 * - Avoid Vite v5+/v7-only options.
 * - Bind dev server to port 3000 with strictPort.
 * - HMR ports fixed to 3000 without hardcoding host to avoid proxy handshake issues.
 * - Dependency optimizer configured to avoid crypto.hash issues on some environments.
 * Note: Local runner enforces Vite 4.x; this config remains compatible with v4.
 */
export default defineConfig({
  base: '/',
  plugins: [react()],
  esbuild: { target: 'es2020' },
  // Vite v4-compatible optimizeDeps adjustments to prevent crypto.hash issues.
  optimizeDeps: {
    entries: [], // keep empty to minimize pre-bundle surface
    esbuildOptions: {
      target: 'es2018',
    },
    // force: true, // uncomment if a stubborn cache requires re-prebundling
  },
  build: { target: 'es2020' },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // Do not restrict allowed hosts; some preview environments use dynamic hosts.
    // allowedHosts: ['vscode-internal-22154-beta.beta01.cloud.kavia.ai'],
    hmr: {
      clientPort: 3000,
      port: 3000,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
})
