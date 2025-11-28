#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * run-vite-preview.js
 * Force-run Vite v4.5.3 via NPX for dev/preview in environments where node_modules
 * may contain a different vite (e.g., v7). This bypasses any predev/version guard
 * and ensures:
 *  - .vite caches are purged before start
 *  - host=0.0.0.0, port=3000, strictPort=true
 *  - flags from CLI are forwarded
 *  - allowedHosts relaxed via config (vite.config.js handles it)
 *
 * Usage examples:
 *   node scripts/run-vite-preview.js dev -- --open
 *   node scripts/run-vite-preview.js preview
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { existsSync, rmSync } from 'node:fs'
import process from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')

// Always purge Vite caches to avoid residue from other majors
function purgeViteCaches() {
  try {
    const nmVite = resolve(projectRoot, 'node_modules', '.vite')
    const dotVite = resolve(projectRoot, '.vite')
    if (existsSync(nmVite)) {
      rmSync(nmVite, { recursive: true, force: true })
      console.log('[preview] Purged node_modules/.vite')
    }
    if (existsSync(dotVite)) {
      rmSync(dotVite, { recursive: true, force: true })
      console.log('[preview] Purged .vite')
    }
  } catch (err) {
    console.warn('[preview] Failed to purge Vite caches:', err?.message || err)
  }
}

function spawnInherit(cmd, args) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      // Ensure Node flags are preserved if present
      NODE_OPTIONS: process.env.NODE_OPTIONS ? String(process.env.NODE_OPTIONS) : '',
    },
  })
  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
    } else {
      process.exit(code ?? 0)
    }
  })
}

const argv = process.argv.slice(2)
// Accept a mode (dev|preview|build) then pass through any extra flags after a -- separator
// Default action: dev
let action = 'dev'
let passArgs = []
if (argv.length > 0) {
  // If first arg is one of dev/preview/build, treat as action
  const candidate = String(argv[0] || '').trim()
  if (['dev', 'preview', 'build'].includes(candidate)) {
    action = candidate
    passArgs = argv.slice(1)
  } else {
    passArgs = argv
  }
}

// Purge caches first
purgeViteCaches()

// Always run via npx vite@4.5.3 and fix host/port/strictPort; forward flags after --
const fixedFlags = ['--host', '0.0.0.0', '--port', '3000', '--strictPort']
const args = ['--yes', 'vite@4.5.3', action, ...fixedFlags, ...passArgs]

console.log(`[preview] Launching: npx ${args.join(' ')}`)
spawnInherit('npx', args)
