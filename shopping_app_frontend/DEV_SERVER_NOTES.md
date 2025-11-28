# Dev server configuration (Vite v4, Node 18)

- Vite is pinned to 4.5.3, @vitejs/plugin-react to 3.1.0, and esbuild to 0.19.12 for Node 18 compatibility.
- Dev server runs on port 3000 with strictPort and host 0.0.0.0.
- Allowed host includes: vscode-internal-22154-beta.beta01.cloud.kavia.ai.
- HMR ports are fixed to 3000; host is not hardcoded to avoid reverse proxy handshake issues.
- We invoke the local vite binary explicitly via scripts/run-vite-local.js to prevent any global/hoisted vite (v5/v7) from being used.
- The runner validates vite version at runtime and will exit if 5+/7+ is detected.
- Predev script also checks vite version via require.resolve and fails fast if not v4.x.
- The runner purges node_modules/.vite and .vite caches if it suspects they were produced by Vite 5+/7+.
- Dependency optimizer is configured with optimizeDeps.entries = [] and esbuild target es2018 to avoid crypto.hash issues seen when newer stacks leak in.

Useful scripts:
- npm run dev             # start Vite via local runner (uses pinned local vite)
- npm run dev:purge-cache # remove node_modules/.vite and .vite then start
- npm run build           # Vite build; falls back to esbuild if needed

If dev port 3000 fails to become ready:
1) Ensure no older Vite cache: npm run dev:purge-cache
2) Verify Node is v18.x
3) Reinstall deps respecting overrides (CI does this automatically):
   - Ensure npm-shrinkwrap.json exists and includes "overrides"/"resolutions" for vite/plugin-react/esbuild.
4) If hashing issues persist on some environments, set optimizeDeps.force = true in vite.config.js (Vite v4 compatible) and retry.
5) Confirm the local runner prints the local Vite 4.x path and version.
