import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'kulu_pwa_install_dismissed'
const DISMISS_DAYS = 14

export type InstallMode = 'native' | 'ios' | 'manual'

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const ts = Number(raw)
    if (Number.isNaN(ts)) return false
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    nav.standalone === true ||
    document.referrer.includes('android-app://')
  )
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // iPadOS 13+ may report as Mac — check touch points
  const iPadOs =
    navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1
  return /iphone|ipad|ipod/i.test(ua) || iPadOs
}

/**
 * Show install CTA on every browser that is not already running as an installed app.
 * - Chromium (Chrome, Edge, Samsung, Opera, Brave): native beforeinstallprompt when available
 * - iOS Safari: Share → Add to Home Screen instructions
 * - Firefox / others: manual install tip (menu → Install / Add to Home Screen)
 */
export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [mode, setMode] = useState<InstallMode>('manual')
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isStandalone() || wasDismissedRecently()) return

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setMode('native')
      setShowBanner(true)
    }

    const onInstalled = () => {
      setDeferred(null)
      setShowBanner(false)
    }

    window.addEventListener('beforeinstallprompt', onBip)
    window.addEventListener('appinstalled', onInstalled)

    // Always surface a banner after a short delay so non-Chromium browsers still see install help
    const delay = window.setTimeout(() => {
      if (isStandalone() || wasDismissedRecently()) return
      setShowBanner((already) => {
        if (already) return true
        if (isIos()) {
          setMode('ios')
        } else {
          setMode((m) => (m === 'native' ? 'native' : 'manual'))
        }
        return true
      })
    }, 1800)

    return () => {
      window.clearTimeout(delay)
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
    setShowBanner(false)
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return false
    setInstalling(true)
    try {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      setDeferred(null)
      if (outcome === 'accepted') {
        setShowBanner(false)
      }
      return outcome === 'accepted'
    } catch {
      return false
    } finally {
      setInstalling(false)
    }
  }, [deferred])

  return {
    showBanner,
    mode,
    canNativeInstall: mode === 'native' && !!deferred,
    installing,
    promptInstall,
    dismiss,
  }
}
