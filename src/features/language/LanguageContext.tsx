import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { translations, type Locale, type TranslationKey } from './translations'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'kulu_locale'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'am'
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    return saved === 'en' || saved === 'am' ? saved : 'am'
  })

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next === 'am' ? 'am' : 'en'
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'am' ? 'am' : 'en'
  }, [locale])

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text: string = translations[locale][key] ?? translations.en[key] ?? key
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v))
        })
      }
      return text
    },
    [locale]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
