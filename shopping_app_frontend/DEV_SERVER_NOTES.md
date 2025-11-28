# Dev server configuration (Vite v4, Node 18)

- Vite is pinned to 4.5.3, @vitejs/plugin-react to 3.1.0, and esbuild to 0.19.12 for Node 18 compatibility.
- Dev server runs on port 3000 with strictPort and host 0.0.0.0.
- Allowed hosts are relaxed to avoid blocking dynamic preview domains.
- HMR ports are fixed to 3000; host is not hardcoded to avoid reverse proxy handshake issues.
- We invoke the local vite binary explicitly via scripts/run-vite-local.js to prevent any global/hoisted vite (v5/v7) from being used.
- The runner validates vite version at runtime and will exit if 5+/7+ is detected.
- If local vite is missing, the runner uses a zero-dependency fallback: `npx --yes vite@4.5.3`.
- For preview environments that may hoist/install Vite 7, use the bypass launcher `scripts/run-vite-preview.js` which ignores local vite and force-runs `npx vite@4.5.3` with host=0.0.0.0, port=3000, strictPort=true, purging `.vite` caches before start.
- Prestart auto-cleans caches to avoid cross-major optimizer residue.
- A postinstall guard purges node_modules/.vite and .vite caches; it logs if vite is not v4 but does not block dev in preview envs.
- Dependency optimizer is configured with optimizeDeps.entries = [] and esbuild target es2018 to avoid crypto.hash issues seen when newer stacks leak in.

Useful scripts:
- npm run dev             # start Vite via local runner (binds 0.0.0.0:3000)
- npm run start           # alias of dev
- npm run dev:purge-cache # remove node_modules/.vite and .vite then start
- npm run build           # Vite build; falls back to esbuild if needed

If dev port 3000 fails to become ready:
1) Ensure no older Vite cache: npm run dev:purge-cache
2) Verify Node is v18.x
3) Reinstall deps respecting overrides (CI does this automatically):
   - Ensure npm-shrinkwrap.json exists and includes "overrides"/"resolutions" for vite/plugin-react/esbuild.
4) If hashing issues persist on some environments, set optimizeDeps.force = true in vite.config.js (Vite v4 compatible) and retry.
5) Confirm the runner prints the local Vite 4.x path or the NPX fallback message.
