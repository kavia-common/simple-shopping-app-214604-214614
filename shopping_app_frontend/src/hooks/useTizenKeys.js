import { useEffect } from 'react';

/**
 * PUBLIC_INTERFACE
 * useTizenKeys
 * Adds TV-remote friendly keyboard handlers (arrows, Enter, Back).
 * handlers: { onLeft?, onRight?, onUp?, onDown?, onEnter?, onBack? }
 */
export function useTizenKeys(handlers) {
  useEffect(() => {
    function handleKeyDown(e) {
      try {
        const code = typeof e.keyCode === 'number' ? e.keyCode : e.which
        switch (code) {
          case 37: // LEFT
            handlers?.onLeft?.()
            e.preventDefault()
            break
          case 38: // UP
            handlers?.onUp?.()
            e.preventDefault()
            break
          case 39: // RIGHT
            handlers?.onRight?.()
            e.preventDefault()
            break
          case 40: // DOWN
            handlers?.onDown?.()
            e.preventDefault()
            break
          case 13: // ENTER
            handlers?.onEnter?.()
            e.preventDefault()
            break
          case 10009: // BACK
            handlers?.onBack?.()
            e.preventDefault()
            break
          default:
            break
        }
      } catch (err) {
        // Do not allow key handling to break the app render
        console.warn('Key handling error:', err)
      }
    }

    try {
      window.addEventListener('keydown', handleKeyDown)
    } catch (err) {
      console.warn('Unable to attach keydown listener:', err)
    }
    return () => {
      try {
        window.removeEventListener('keydown', handleKeyDown)
      } catch {}
    }
  }, [handlers]);
}
