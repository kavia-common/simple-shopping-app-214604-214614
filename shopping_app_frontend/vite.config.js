import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration tuned for Node 18 with Vite v4.x.
 * - Bind dev server to 0.0.0.0:3000 with strictPort.
 * - HMR ports fixed to 3000 without hardcoding host to avoid proxy handshake issues.
 * - Dependency optimizer configured to avoid crypto.hash issues on some environments.
 * - allowedHosts intentionally relaxed to permit dynamic preview domains.
 */
export default defineConfig({
  base: '/',
  plugins: [react()],
  esbuild: { target: 'es2020' },
  optimizeDeps: {
    entries: [],
    esbuildOptions: {
      target: 'es2018',
    },
    // force: true, // enable if a stubborn cache requires re-prebundling
  },
  build: { target: 'es2020' },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // allowedHosts: ['vscode-internal-22154-beta.beta01.cloud.kavia.ai'], // example if you want to restrict
    hmr: {
      clientPort: 3000,
      port: 3000,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
})
