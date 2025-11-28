#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * run-vite-preview.js
 * Force-run Vite v4.5.3 via NPX for dev/preview in environments where node_modules
 * may contain a different vite (e.g., v7). This bypasses local vite and:
 *  - Purges .vite caches before start
 *  - Ensures host=0.0.0.0, port=3000, strictPort=true by default
 *  - Forwards CLI flags, allowing explicit --host/--port overrides
 *  - Works in Node 18; does not rely on local vite installation
 *
 * Usage:
 *   node scripts/run-vite-preview.js dev -- --open
 *   node scripts/run-vite-preview.js preview -- --port=5173 --host=0.0.0.0
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { existsSync, rmSync } from 'node:fs'
import process from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')

// Purge Vite caches to avoid optimizer residue between major versions
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
let action = 'dev'
let passArgs = []
if (argv.length > 0) {
  const candidate = String(argv[0] || '').trim()
  if (['dev', 'preview', 'build'].includes(candidate)) {
    action = candidate
    passArgs = argv.slice(1)
  } else {
    passArgs = argv
  }
}

// Purge caches before launch
purgeViteCaches()

// Defaults
let host = '0.0.0.0'
let port = '3000'

// Pick up explicit overrides from pass-through args
for (let i = 0; i < passArgs.length; i++) {
  const a = String(passArgs[i] || '')
  if (a === '--host' && typeof passArgs[i + 1] !== 'undefined') {
    host = String(passArgs[i + 1])
    i++
  } else if (a.startsWith('--host=')) {
    host = a.split('=').slice(1).join('=')
  } else if (a === '--port' && typeof passArgs[i + 1] !== 'undefined') {
    port = String(passArgs[i + 1])
    i++
  } else if (a.startsWith('--port=')) {
    port = a.split('=').slice(1).join('=')
  }
}

// Compose command ensuring strictPort, and forward all other flags as-is
const baseFlags = ['--host', host, '--port', port, '--strictPort']
const args = ['--yes', 'vite@4.5.3', action, ...baseFlags, ...passArgs]

console.log(`[preview] Launching: npx ${args.join(' ')}`)
spawnInherit('npx', args)
