import { useState } from 'react'

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary (functional) — catches render errors synchronously and shows fallback UI.
 * Note: This is a minimal boundary; for full coverage, prefer class-based error boundaries.
 */
export default function ErrorBoundary({ children }) {
  const [err, setErr] = useState(null)
  try {
    return children
  } catch (e) {
    setErr(e)
  }
  if (!err) return null
  console.error('App crashed:', err)
  return (
    <div style={{ padding: 24 }}>
      <h2>Something went wrong</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{String(err?.stack || err)}</pre>
    </div>
  )
}
