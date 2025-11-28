import { useEffect, useMemo, useRef, useState } from 'react'
import { useTizenKeys } from './hooks/useTizenKeys'
import './App.css'
import { theme, saveCart, loadCart } from './lib/theme'

/**
 * Mock Data: 12 products
 */
const PRODUCTS = [
  { id: 'p1', name: 'Ocean Breeze T-Shirt', price: 24.99, img: 'https://picsum.photos/seed/ob/300/300', description: 'Soft cotton tee inspired by ocean hues.' },
  { id: 'p2', name: 'Amber Glow Mug', price: 14.5, img: 'https://picsum.photos/seed/ag/300/300', description: 'Ceramic mug with a warm amber accent.' },
  { id: 'p3', name: 'Bluewave Backpack', price: 59.99, img: 'https://picsum.photos/seed/bw/300/300', description: 'Durable backpack in professional blue.' },
  { id: 'p4', name: 'Coastal Notebook', price: 8.75, img: 'https://picsum.photos/seed/cn/300/300', description: 'Dotted pages with a coastal cover.' },
  { id: 'p5', name: 'Sunrise Headphones', price: 89.0, img: 'https://picsum.photos/seed/sh/300/300', description: 'Crisp sound with amber accents.' },
  { id: 'p6', name: 'Cascade Water Bottle', price: 19.5, img: 'https://picsum.photos/seed/cw/300/300', description: 'Insulated bottle, stay hydrated.' },
  { id: 'p7', name: 'Harbor Hoodie', price: 49.95, img: 'https://picsum.photos/seed/hh/300/300', description: 'Cozy fleece with subtle logo.' },
  { id: 'p8', name: 'Waveform Mousepad', price: 12.0, img: 'https://picsum.photos/seed/wm/300/300', description: 'Smooth surface for productivity.' },
  { id: 'p9', name: 'Marine Sunglasses', price: 39.99, img: 'https://picsum.photos/seed/ms/300/300', description: 'Polarized lenses, modern frame.' },
  { id: 'p10', name: 'Shoreline Lamp', price: 64.0, img: 'https://picsum.photos/seed/sl/300/300', description: 'Soft ambient glow for desks.' },
  { id: 'p11', name: 'Reef Sneakers', price: 74.25, img: 'https://picsum.photos/seed/rs/300/300', description: 'Lightweight, breathable mesh.' },
  { id: 'p12', name: 'Tidal Desk Mat', price: 29.0, img: 'https://picsum.photos/seed/td/300/300', description: 'Wide mat, ocean gradient.' },
]

/**
 * Toast system
 */
function useToasts() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const show = (message, type = 'info', duration = 2000) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }

  return { toasts, show }
}

function Toasts({ toasts }) {
  return (
    <div
      aria-live="polite"
      style={{
        position: 'absolute',
        right: 32,
        bottom: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 40,
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          style={{
            background: theme.surface,
            color: theme.text,
            borderLeft: `6px solid ${
              t.type === 'error' ? theme.error : t.type === 'success' ? theme.success : theme.primary
            }`,
            boxShadow: theme.shadow,
            padding: '14px 18px',
            borderRadius: theme.radiusSm,
            minWidth: 280,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

/**
 * App Shell: top bar + content + bottom cart bar
 */
function TopBar({ cartCount }) {
  return (
    <header
      style={{
        width: '100%',
        height: 80,
        background: `linear-gradient(135deg, rgba(37,99,235,0.06), rgba(243,244,246,0.6))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        color: theme.text,
        borderBottom: '1px solid rgba(17,24,39,0.06)',
      }}
    >
      <h1 style={{ fontSize: 28, letterSpacing: 0.2, margin: 0 }}>
        <span style={{ color: theme.primary, fontWeight: 800 }}>Ocean</span> Shop
      </h1>
      <div
        aria-label="Cart item count"
        style={{
          fontSize: 18,
          color: theme.muted,
        }}
      >
        {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
      </div>
    </header>
  )
}

function BottomBar({ cartCount, onOpenCart }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <button
        aria-label="Open Cart"
        onClick={onOpenCart}
        style={{
          pointerEvents: 'auto',
          background: theme.primary,
          color: '#fff',
          border: 'none',
          padding: '16px 24px',
          borderRadius: 9999,
          boxShadow: theme.shadow,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          transition: theme.transition,
          fontSize: 18,
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        🛒 Cart
        <span
          aria-label="Cart item count"
          style={{
            background: '#fff',
            color: theme.primary,
            borderRadius: 999,
            padding: '4px 10px',
            fontWeight: 700,
          }}
        >
          {cartCount}
        </span>
      </button>
    </div>
  )
}

/**
 * Product Card + Grid
 */
function ProductCard({ product, onAdd }) {
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    setAdding(true)
    await new Promise(r => setTimeout(r, 250))
    onAdd(product)
    setAdding(false)
  }

  return (
    <article
      style={{
        background: theme.surface,
        borderRadius: theme.radius,
        boxShadow: theme.shadow,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transition,
      }}
    >
      <img
        src={product.img}
        alt={product.name}
        width={300}
        height={200}
        style={{ width: '100%', height: 200, objectFit: 'cover' }}
      />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: theme.text }}>{product.name}</h3>
        <p style={{ margin: 0, fontSize: 14, color: theme.muted }}>{product.description}</p>
        <div style={{ marginTop: 6, fontWeight: 800, color: theme.text }}>${product.price.toFixed(2)}</div>
        <button
          aria-label={`Add ${product.name} to cart`}
          disabled={adding}
          onClick={handleAdd}
          style={{
            marginTop: 8,
            background: adding ? '#c7d2fe' : theme.primary,
            color: adding ? theme.primary : '#fff',
            border: 'none',
            padding: '10px 14px',
            borderRadius: theme.radiusSm,
            cursor: adding ? 'wait' : 'pointer',
            transition: theme.transition,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 600,
          }}
        >
          {adding ? (
            <>
              <span
                aria-hidden="true"
                style={{
                  width: 16,
                  height: 16,
                  border: '3px solid rgba(37,99,235,0.3)',
                  borderTopColor: theme.primary,
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Adding...
            </>
          ) : (
            <>
              ➕ Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  )
}

function ProductGrid({ products, onAdd }) {
  if (!products || products.length === 0) {
    // skeleton state
    return (
      <div
        role="status"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          padding: 24,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 320,
              borderRadius: theme.radius,
              background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)',
              backgroundSize: '400% 100%',
              animation: 'shimmer 1.4s ease infinite',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <section
      aria-label="Products"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 24,
        padding: 24,
      }}
    >
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAdd={onAdd} />
      ))}
    </section>
  )
}

/**
 * Cart Page / Sheet
 */
function CartPage({ open, items, onClose, onInc, onDec, onClear, onCheckout }) {
  const total = items.reduce((acc, it) => acc + it.price * it.qty, 0)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cart"
      style={{
        position: 'absolute',
        inset: 0,
        background: open ? 'rgba(17,24,39,0.4)' : 'transparent',
        pointerEvents: open ? 'auto' : 'none',
        transition: theme.transition,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 1200,
          maxWidth: '92%',
          height: 720,
          background: theme.surface,
          borderTopLeftRadius: theme.radius,
          borderTopRightRadius: theme.radius,
          boxShadow: '0 -16px 40px rgba(0,0,0,0.18)',
          transform: `translateY(${open ? '0' : '24px'})`,
          opacity: open ? 1 : 0,
          transition: theme.transition,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(17,24,39,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, color: theme.text }}>Your Cart</h2>
          <button
            aria-label="Close Cart"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 22,
              color: theme.muted,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {items.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.muted,
                fontSize: 20,
              }}
            >
              Your cart is empty.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map(it => (
                <li
                  key={it.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 200px 200px',
                    gap: 16,
                    padding: '16px 20px',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(17,24,39,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <img
                      src={it.img}
                      alt={it.name}
                      width={72}
                      height={72}
                      style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: theme.text }}>{it.name}</div>
                      <div style={{ color: theme.muted }}>${it.price.toFixed(2)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <button
                      aria-label={`Decrease ${it.name}`}
                      onClick={() => onDec(it.id)}
                      style={qtyBtnStyle()}
                    >
                      −
                    </button>
                    <div
                      aria-live="polite"
                      style={{
                        minWidth: 40,
                        textAlign: 'center',
                        fontWeight: 700,
                        color: theme.text,
                      }}
                    >
                      {it.qty}
                    </div>
                    <button
                      aria-label={`Increase ${it.name}`}
                      onClick={() => onInc(it.id)}
                      style={qtyBtnStyle('inc')}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 800, color: theme.text }}>
                    ${(it.price * it.qty).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          style={{
            padding: 20,
            borderTop: '1px solid rgba(17,24,39,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 20, color: theme.text }}>
            Total:{' '}
            <span style={{ fontWeight: 900, color: theme.primary }}>${total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              aria-label="Clear Cart"
              onClick={onClear}
              style={{
                background: '#fff',
                color: theme.error,
                border: `2px solid ${theme.error}`,
                padding: '10px 16px',
                borderRadius: theme.radiusSm,
                cursor: 'pointer',
                transition: theme.transition,
                fontWeight: 700,
              }}
            >
              Clear Cart
            </button>
            <button
              aria-label="Checkout"
              onClick={onCheckout}
              style={{
                background: theme.secondary,
                color: '#111827',
                border: 'none',
                padding: '12px 18px',
                borderRadius: theme.radiusSm,
                cursor: 'pointer',
                transition: theme.transition,
                fontWeight: 800,
                boxShadow: theme.shadow,
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function qtyBtnStyle(type) {
  return {
    background: type === 'inc' ? theme.primary : '#fff',
    color: type === 'inc' ? '#fff' : theme.text,
    border: type === 'inc' ? 'none' : '2px solid rgba(17,24,39,0.12)',
    width: 40,
    height: 40,
    borderRadius: 12,
    cursor: 'pointer',
    transition: theme.transition,
    fontSize: 18,
    fontWeight: 900,
    boxShadow: type === 'inc' ? theme.shadow : 'none',
  }
}

/**
 * PUBLIC_INTERFACE
 * Main App component
 * Renders the Ocean Shop browsing view, manages cart state (persisted to localStorage),
 * and exposes cart UI via a modal sheet. No props required.
 */
function App() {
  const [products] = useState(PRODUCTS)
  const [cart, setCart] = useState(loadCart)
  const [cartOpen, setCartOpen] = useState(false)
  const { toasts, show } = useToasts()

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const cartCount = useMemo(() => cart.reduce((acc, c) => acc + c.qty, 0), [cart])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...product, qty: 1 }]
    })
    show(`${product.name} added to cart`, 'success')
  }

  const inc = (id) => setCart(prev => prev.map(i => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))
  const dec = (id) =>
    setCart(prev =>
      prev
        .map(i => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter(i => i.qty > 0),
    )
  const clear = () => {
    setCart([])
    show('Cart cleared', 'info')
  }
  const checkout = () => {
    setCart([])
    setCartOpen(false)
    show('Checkout complete. Thank you!', 'success', 2500)
  }

  // Tizen remote keys: open cart on Enter, back to close cart
  useTizenKeys({
    onEnter: () => setCartOpen(true),
    onBack: () => setCartOpen(false),
  })

  return (
    <div
      className="tv-app"
      style={{
        width: 1920,
        height: 1080,
        background: theme.background,
        color: theme.text,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopBar cartCount={cartCount} />
      <main style={{ flex: 1, overflow: 'hidden auto' }}>
        <ProductGrid products={products} onAdd={addToCart} />
      </main>
      <BottomBar cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
      <CartPage
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onInc={inc}
        onDec={dec}
        onClear={clear}
        onCheckout={checkout}
      />
      <Toasts toasts={toasts} />
      <style>{globalKeyframes}</style>
    </div>
  )
}

const globalKeyframes = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`

export default App
