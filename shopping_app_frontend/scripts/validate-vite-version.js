#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * validate-vite-version.js
 * Exits with code 0 if vite is 4.x, otherwise prints an error and exits non-zero.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import process from 'node:process'

const require = createRequire(import.meta.url)

try {
  const vitePkgPath = require.resolve('vite/package.json')
  const version = JSON.parse(readFileSync(vitePkgPath, 'utf8')).version
  if (!/^4\./.test(String(version))) {
    console.error('[validate] Vite', version, 'detected; requires v4.x. Reinstall with vite@4.5.3.')
    process.exit(1)
  }
  console.log('[validate] Vite', version, '(OK)')
} catch (e) {
  console.error('[validate] Unable to resolve local vite. Run npm install/ci.', e?.message || e)
  process.exit(1)
}
