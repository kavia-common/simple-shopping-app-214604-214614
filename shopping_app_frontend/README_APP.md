# Ocean Shop (Tizen Web - React + Vite)

This is a simple shopping frontend demonstrating:
- Product browsing (grid of cards)
- Add to cart with toasts and disabled state/spinner
- Cart summary sheet with quantity controls, line subtotals, total, Clear Cart and Checkout
- Client-side cart state persisted to localStorage
- Tizen TV-friendly 1920x1080 canvas and remote key hints (ENTER opens cart, BACK closes cart)

Structure (by file):
- src/main.jsx: React entry
- src/index.css: Global CSS and Ocean Professional theme CSS variables
- src/App.jsx: App shell, components (TopBar, ProductGrid/ProductCard, CartPage, Toasts), mock products, storage utils

Theme (Ocean Professional):
- Colors: primary #2563EB, secondary/success #F59E0B, error #EF4444
- Background #f9fafb, Surface #ffffff, Text #111827
- Style: modern, rounded corners, subtle shadows, smooth transitions

How to adjust theme:
- Edit the `theme` object at the top of `src/App.jsx` or update CSS variables in `src/index.css`.
- Components reference these tokens for colors, shadows, and radii.

Run locally:
- npm run dev (binds to 0.0.0.0:3000 in this workspace and uses the pinned local Vite 4 runner)
- In this workspace, the orchestrator exposes preview on port 3000; no changes are required here.

Environment compatibility (Node 18 target):
- This project targets Node 18.x for development and preview. Do NOT upgrade Node to run it.
- Tooling is pinned to Vite 4.5.3 and @vitejs/plugin-react 3.1.0 to avoid Node 20+ requirements that trigger "crypto.hash is not a function".
- package.json sets engines.node to ">=18 <20" and uses exact versions (no caret) to avoid accidental upgrades in CI.
- npm-shrinkwrap.json locks vite (4.5.3) and @vitejs/plugin-react (3.1.0) to ensure deterministic installs, and overrides/resolutions enforce these versions.
- Scripts: `npm run build` attempts `vite build` first and falls back to a minimal `esbuild` bundling strategy if the environment ignores pins.

Accessibility:
- Semantic elements (header, main, section, article)
- aria-labels for interactive elements
- role="dialog" for cart sheet and aria-live for toast updates

Notes:
- Product images are placeholders via picsum.photos.
- No external services; cart is in-memory + localStorage persistence only.
