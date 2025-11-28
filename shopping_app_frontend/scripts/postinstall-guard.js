#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * postinstall-guard.js
 * Verifies local vite is v4.x after install and purges Vite caches that may come from other majors.
 */
import { rmSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import process from 'node:process'

const require = createRequire(import.meta.url)

try {
  const vitePkgPath = require.resolve('vite/package.json')
  const viteVersion = JSON.parse(readFileSync(vitePkgPath, 'utf8')).version
  if (!/^4\./.test(String(viteVersion))) {
    console.error('[postinstall] FATAL: vite', viteVersion, 'is not v4.x. Please reinstall with vite@4.5.3.')
    process.exit(1)
  }
  try { rmSync('node_modules/.vite', { recursive: true, force: true }) } catch {}
  try { rmSync('.vite', { recursive: true, force: true }) } catch {}
  console.log('[postinstall] Verified vite', viteVersion, 'and purged .vite caches')
} catch (e) {
  console.error('[postinstall] Could not verify local vite. Run npm ci/install.', e?.message || e)
  process.exit(1)
}
