'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Lang } from '@/lib/types'
import { t, getCatLabel, getProductDesc, getProductName } from '@/i18n/translations'

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, replacements?: Record<string, string | number>) => string
  catLabel: (cat: string) => string
  productDesc: (product: { description: string; description_en: string | null }) => string
  productName: (product: { name: string; name_en: string | null }) => string
  isRtl: boolean
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ur')

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    document.documentElement.lang = l
    document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr'
  }, [])

  const tf = useCallback((key: string, replacements?: Record<string, string | number>) => t(lang, key, replacements), [lang])
  const catLabel = useCallback((cat: string) => getCatLabel(lang, cat), [lang])
  const productDesc = useCallback((p: { description: string; description_en: string | null }) => getProductDesc(p, lang), [lang])
  const productName = useCallback((p: { name: string; name_en: string | null }) => getProductName(p, lang), [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: tf, catLabel, productDesc, productName, isRtl: lang === 'ur' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be inside LanguageProvider')
  return ctx
}
