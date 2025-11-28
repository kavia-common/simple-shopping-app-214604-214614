#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * run-vite-local.js
 * Ensures we execute the locally pinned Vite (4.5.x) under Node 18, avoiding any global vite.
 * Usage mirrors `vite` CLI: node ./scripts/run-vite-local.js [command] [flags]
 */
import { createRequire } from 'module'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { existsSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')

const require = createRequire(import.meta.url)
let viteBin
try {
  // Prefer direct path to local vite bin
  viteBin = resolve(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')
  if (!existsSync(viteBin)) {
    throw new Error('vite bin not found locally')
  }
  // Validate it exists by requiring package.json
  const vitePkg = require(resolve(projectRoot, 'node_modules', 'vite', 'package.json'))
  if (!/^4\.5\./.test(String(vitePkg.version))) {
    console.warn(`[warn] Local vite version is ${vitePkg.version}; expected 4.5.x`)
  } else {
    console.log(`[info] Using local vite ${vitePkg.version} at ${viteBin}`)
  }
} catch (e) {
  console.error('[error] Unable to resolve local vite. Did you run npm install?')
  process.exit(1)
}

// Sanitize args: remove any lingering "--force" flag which is unrelated and can mask issues
let args = process.argv.slice(2).filter(a => a !== '--force')

// Extra safety: if PATH has a global vite, do not use it; we exec node process with viteBin explicitly.
const child = spawn(process.execPath, [viteBin, ...args], {
  stdio: 'inherit',
  cwd: projectRoot,
  env: {
    ...process.env,
  },
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
  } else {
    process.exit(code ?? 0)
  }
})
