#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * run-vite-local.js
 * Ensures we execute the locally pinned Vite (4.5.x) under Node 18, avoiding any global/hoisted Vite 5+/7+.
 * Usage mirrors `vite` CLI: node ./scripts/run-vite-local.js [command] [flags]
 * - Forwards all extra CLI flags (e.g., `-- --port 3000 --host 0.0.0.0`)
 * - Always resolves ./node_modules/vite/bin/vite.js
 * - Falls back to `npx --yes vite@4.5.3` if local resolve fails
 * - Purges node_modules/.vite and .vite caches before start to avoid optimizer/hash mismatches
 */
import { createRequire } from 'module'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, sep } from 'node:path'
import process from 'node:process'
import { existsSync, rmSync, readFileSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')

// Guard Node runtime (Node 18 required)
const nodeMajor = Number(process.versions.node.split('.')[0] || 0)
if (!(nodeMajor >= 18 && nodeMajor < 20)) {
  console.warn(`[warn] Detected Node ${process.versions.node}. This project targets Node 18.x only.`)
}

const require = createRequire(import.meta.url)

// Resolve local vite package.json to enforce version and compute correct CLI
function resolveLocalVite() {
  try {
    // Resolve via require.resolve to avoid PATH/global leaks
    const vitePkgPath = require.resolve('vite/package.json', { paths: [projectRoot] })
    const vitePkg = JSON.parse(readFileSync(vitePkgPath, 'utf8'))
    const viteVersion = String(vitePkg.version || '')
    const viteBin = resolve(vitePkgPath.split(`${sep}package.json`).shift(), 'bin', 'vite.js')
    return { vitePkg, viteVersion, viteBin }
  } catch (err) {
    return { error: err }
  }
}

// Purge Vite caches to avoid residue from different major versions
function purgeViteCaches() {
  try {
    const viteCacheDir = resolve(projectRoot, 'node_modules', '.vite')
    const dotViteCacheDir = resolve(projectRoot, '.vite')
    if (existsSync(viteCacheDir)) {
      rmSync(viteCacheDir, { recursive: true, force: true })
      console.log('[info] Purged node_modules/.vite cache')
    }
    if (existsSync(dotViteCacheDir)) {
      rmSync(dotViteCacheDir, { recursive: true, force: true })
      console.log('[info] Purged .vite cache')
    }
  } catch (err) {
    console.warn('[warn] Failed to purge Vite caches:', err?.message || err)
  }
}

// MAIN
// Forward all provided arguments (including after double-dash)
const args = process.argv.slice(2)

// Try resolve local vite
const resolved = resolveLocalVite()

// Enforce Vite major version == 4 if resolved
let viteVersion = ''
if (!resolved.error && existsSync(resolved.viteBin)) {
  try {
    viteVersion = require('vite/package.json').version || resolved.viteVersion || ''
  } catch {
    viteVersion = resolved.viteVersion || ''
  }
  const major = Number((viteVersion || '0').split('.')[0])
  if (major !== 4) {
    console.error(
      `[fatal] Vite ${viteVersion} detected. This project requires Vite 4.x under Node 18.\n` +
        `Please reinstall with pinned versions:\n` +
        `  - vite@4.5.3\n  - @vitejs/plugin-react@3.1.0\n` +
        `Then re-run: npm ci (or npm install)`,
    )
    process.exit(1)
  }
}

// Always purge caches before starting to be safe in preview runners
purgeViteCaches()

// Spawn helper
function spawnInherit(cmd, cmdArgs) {
  const child = spawn(cmd, cmdArgs, {
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

// Prefer exact local vite binary; log path and version for diagnostics
if (!resolved.error && existsSync(resolved.viteBin)) {
  if (viteVersion) {
    console.log(`[runner] Using local Vite ${viteVersion} at ${resolved.viteBin}`)
  } else {
    console.log(`[runner] Using local Vite at ${resolved.viteBin}`)
  }
  spawnInherit(process.execPath, [resolved.viteBin, ...args])
} else {
  // Fallback: npx vite@4.5.3
  console.warn('[runner] Local vite not found. Falling back to npx vite@4.5.3')
  // Use --yes to ensure non-interactive
  spawnInherit('npx', ['--yes', 'vite@4.5.3', ...args])
}
