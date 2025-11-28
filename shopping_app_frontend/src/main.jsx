import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// PUBLIC_INTERFACE
// Entrypoint: mounts React app into #root
const mountEl = document.getElementById('root')
if (!mountEl) {
  // In rare cases if the preview serves a different HTML, create and append a root.
  const el = document.createElement('div')
  el.id = 'root'
  document.body.appendChild(el)
  console.warn('Root element missing; created #root dynamically.')
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
} else {
  createRoot(mountEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
