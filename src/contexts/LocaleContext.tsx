import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { en } from '@/translations/en'
import { ar } from '@/translations/ar'
import { fr } from '@/translations/fr'

export type Locale = 'en' | 'ar' | 'fr'
type TranslationKeys = typeof en

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (path: string, params?: Record<string, string | number>) => string
  dir: 'ltr' | 'rtl'
  isRTL: boolean
}

const translations: Record<Locale, TranslationKeys> = { en, ar, fr }

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof current === 'string' ? current : path
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return key in params ? String(params[key]) : `{{${key}}}`
  })
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale')
    return (saved === 'en' || saved === 'ar' || saved === 'fr') ? saved : 'ar'
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }, [])

  const t = useCallback((path: string, params?: Record<string, string | number>): string => {
    const text = getNestedValue(translations[locale] as unknown as Record<string, unknown>, path)
    return interpolate(text, params)
  }, [locale])

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr'
  const isRTL = locale === 'ar'

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = locale
  }, [dir, locale])

  const value = useMemo(
    () => ({ locale, setLocale, t, dir, isRTL }),
    [locale, setLocale, t, dir, isRTL],
  )

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
