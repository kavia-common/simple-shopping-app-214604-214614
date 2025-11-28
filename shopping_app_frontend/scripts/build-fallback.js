/* Simple fallback build using esbuild for environments where vite is pinned incorrectly.
   It bundles the app to dist/ and copies static index.html. */

import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs'
import { resolve } from 'path'

const outdir = resolve('dist')

// Ensure dist exists
try { mkdirSync(outdir, { recursive: true }) } catch {}

await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  outdir,
  sourcemap: false,
  format: 'esm',
  splitting: true,
  metafile: false,
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  define: { 'process.env.NODE_ENV': '"production"' },
  target: ['es2020'],
})

// Copy index.html
const html = readFileSync('index.html', 'utf-8')
writeFileSync(resolve(outdir, 'index.html'), html)
// Copy config.xml for packaging
try { copyFileSync('config.xml', resolve(outdir, '../config.xml')) } catch {}

console.log('Fallback build completed.')
