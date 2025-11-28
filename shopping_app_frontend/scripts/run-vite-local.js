#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * run-vite-local.js
 * Zero-dependency dev launcher:
 * - Always executes local Vite 4.x from node_modules if present.
 * - Falls back to `npx --yes vite@4.5.3` when local module is missing.
 * - Never touches any globally installed vite.
 * - Purges Vite caches to avoid residue from other majors.
 * - Forwards all CLI args, e.g. `-- --host 0.0.0.0 --port 3000`.
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

// Guard Node runtime (Node 18 targeted)
const nodeMajor = Number(process.versions.node.split('.')[0] || 0)
if (!(nodeMajor >= 18 && nodeMajor < 20)) {
  console.warn(`[warn] Detected Node ${process.versions.node}. This project targets Node 18.x.`)
}

const require = createRequire(import.meta.url)

function resolveLocalVite() {
  try {
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
const args = process.argv.slice(2)
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
        `Use the NPX fallback or reinstall with pinned versions:\n` +
        `  - vite@4.5.3\n  - @vitejs/plugin-react@3.1.0\n`,
    )
    process.exit(1)
  }
}

// Always purge caches before starting to be safe in preview runners
purgeViteCaches()

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

if (!resolved.error && existsSync(resolved.viteBin)) {
  if (viteVersion) {
    console.log(`[runner] Using local Vite ${viteVersion} at ${resolved.viteBin}`)
  } else {
    console.log(`[runner] Using local Vite at ${resolved.viteBin}`)
  }
  spawnInherit(process.execPath, [resolved.viteBin, ...args])
} else {
  console.warn('[runner] Local vite not found. Falling back to npx vite@4.5.3')
  spawnInherit('npx', ['--yes', 'vite@4.5.3', ...args])
}
