#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * run-vite-local.js
 * Ensures we execute the locally pinned Vite (4.5.x) under Node 18, avoiding any global/hoisted Vite 5+/7+.
 * Usage mirrors `vite` CLI: node ./scripts/run-vite-local.js [command] [flags]
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

// If a Vite 7 cache exists, purge it before starting to avoid optimizer/hash conflicts
function purgeStaleViteCachesIfNeeded() {
  try {
    const viteCacheDir = resolve(projectRoot, 'node_modules', '.vite')
    const dotViteCacheDir = resolve(projectRoot, '.vite')
    // Heuristic: If cache exists but local vite is not 4.x, or we detect prior 5+/7+ run, clear.
    let shouldPurge = false
    try {
      const { viteVersion } = resolveLocalVite()
      if (!/^4\./.test(viteVersion || '')) shouldPurge = true
    } catch {
      // If we can't resolve local vite, best-effort purge
      shouldPurge = true
    }
    if (existsSync(viteCacheDir) && shouldPurge) {
      rmSync(viteCacheDir, { recursive: true, force: true })
      console.log('[info] Purged node_modules/.vite cache (potential Vite 7 residue)')
    }
    if (existsSync(dotViteCacheDir) && shouldPurge) {
      rmSync(dotViteCacheDir, { recursive: true, force: true })
      console.log('[info] Purged .vite cache (potential Vite 7 residue)')
    }
  } catch (err) {
    console.warn('[warn] Failed to purge Vite caches:', err?.message || err)
  }
}

// MAIN
const resolved = resolveLocalVite()
if (resolved.error || !existsSync(resolved.viteBin)) {
  console.error('[error] Unable to resolve local vite from node_modules. Did you run `npm install`?')
  process.exit(1)
}

// Enforce Vite major version == 4
const viteVersion = resolved.viteVersion
const major = Number((viteVersion || '0').split('.')[0])
if (!/^4\./.test(viteVersion || '')) {
  console.error(
    `[fatal] Vite ${viteVersion} detected. This project requires Vite 4.x under Node 18.\n` +
      `Please reinstall with pinned versions:\n` +
      `  - vite@4.5.3\n  - @vitejs/plugin-react@3.1.0\n` +
      `Then re-run: npm ci (or npm install)`,
  )
  process.exit(1)
}

// Purge caches if they may have been produced by a different Vite major
purgeStaleViteCachesIfNeeded()

// Sanitize args: remove any lingering "--force" flag which is unrelated and can mask issues
const args = process.argv.slice(2).filter((a) => a !== '--force')

// Spawn the exact local vite CLI using current Node
const child = spawn(process.execPath, [resolved.viteBin, ...args], {
  stdio: 'inherit',
  cwd: projectRoot,
  env: {
    // Remove any globally linked vite from PATH resolution by not using a bare "vite" spawn and keeping env clean.
    // Also ensure npm config vars don't alter our resolver.
    ...process.env,
    // Defensive: prevent experimental loaders from hijacking resolution
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
