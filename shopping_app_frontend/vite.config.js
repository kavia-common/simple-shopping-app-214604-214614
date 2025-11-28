import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite v4 configuration (Node 18 compatible).
 * Avoids Node 20-only APIs and Vite 5+ options.
 * Docs: https://v4.vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'es2020'
  },
  build: {
    target: 'es2020'
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    host: true,
    port: 3000
  }
})
