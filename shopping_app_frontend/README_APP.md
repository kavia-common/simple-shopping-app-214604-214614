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
- npm run dev (port 5173 by default for Vite dev) or use existing preview runner (port 3000) in the environment.
- In this workspace, the orchestrator exposes preview on port 3000; no changes are required here.

Environment compatibility:
- Tooling is pinned to Vite 4.5.3 and React 18 to be compatible with Node 18.x used by the environment.
- package.json sets engines.node to ">=18 <20" and uses exact versions (no caret) to avoid accidental upgrades in CI.
- npm-shrinkwrap.json pins Vite (4.5.3) and @vitejs/plugin-react (3.1.0) to ensure deterministic installs in CI environments without a lockfile.

Accessibility:
- Semantic elements (header, main, section, article)
- aria-labels for interactive elements
- role="dialog" for cart sheet and aria-live for toast updates

Notes:
- Product images are placeholders via picsum.photos.
- No external services; cart is in-memory + localStorage persistence only.
