import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets window scroll when the route changes so new pages open at the top. */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, search])

  return null
}
