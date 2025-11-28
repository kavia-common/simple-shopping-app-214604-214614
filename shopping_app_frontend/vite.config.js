import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration tuned for Node 18 with Vite v4.x.
 * - Avoid Vite v5+/v7-only options.
 * - Bind dev server to port 3000 with strictPort and allowedHosts.
 * - HMR ports fixed to 3000 without hardcoding host to avoid proxy handshake issues.
 */
export default defineConfig({
  base: '/',
  plugins: [react()],
  esbuild: { target: 'es2020' },
  // Vite v4-compatible optimizeDeps. If hashing issues persist on some envs, toggle force.
  optimizeDeps: {
    // force: true,
  },
  build: { target: 'es2020' },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: ['vscode-internal-22154-beta.beta01.cloud.kavia.ai'],
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
