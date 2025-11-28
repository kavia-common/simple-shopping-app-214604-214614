import { useEffect, useState } from 'react'

// PUBLIC_INTERFACE
export default function InitPlaceholder() {
  /** Visible for a single frame to confirm the render pipeline, then hides. */
  const [hide, setHide] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setHide(true))
    return () => cancelAnimationFrame(id)
  }, [])
  if (hide) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#111827',
        background: 'rgba(249,250,251,0.6)',
        zIndex: 9999,
        fontWeight: 700,
      }}
      aria-live="polite"
    >
      Loading Ocean Shop…
    </div>
  )
}
