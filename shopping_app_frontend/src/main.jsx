import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import InitPlaceholder from './components/InitPlaceholder.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// PUBLIC_INTERFACE
// Entrypoint: mounts React app into #root
const mountEl = document.getElementById('root')

function renderInto(el) {
  createRoot(el).render(
    <StrictMode>
      <InitPlaceholder />
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  )
}

if (!mountEl) {
  // In rare cases if the preview serves a different HTML, create and append a root.
  const el = document.createElement('div')
  el.id = 'root'
  document.body.appendChild(el)
  console.warn('Root element missing; created #root dynamically.')
  renderInto(el)
} else {
  renderInto(mountEl)
}
