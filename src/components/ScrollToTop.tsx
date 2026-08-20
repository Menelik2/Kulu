import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets window scroll when the route changes so new pages open at the top.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // Instant jump avoids showing the previous page's bottom first
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    // Also reset any nested scroll containers if present
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, search])

  return null
}
