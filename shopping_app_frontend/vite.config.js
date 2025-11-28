import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration tuned for Node 18 dev with a build fallback.
 * - We pin Vite 4 in package.json, but in case the environment installs Vite 5/7,
 *   avoid deprecated options that cause warnings and keep settings compatible.
 */
export default defineConfig({
  plugins: [react()],
  base: '/',
  esbuild: {
    target: 'es2020',
  },
  optimizeDeps: {
    // For Vite >=5, `disabled` is removed. Using noDiscovery provides similar effect.
    noDiscovery: true,
  },
  build: {
    target: 'es2020',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // Explicitly allow the preview host used by the orchestrator to prevent Vite blocked host error.
    allowedHosts: ['vscode-internal-22154-beta.beta01.cloud.kavia.ai'],
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
})
