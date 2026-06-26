'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const { isDark, toggle } = useTheme()
  const { count } = useCart()
  const { user, signOut, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/products?q=${encodeURIComponent(search)}`)
  }

  return (
    <nav className={`nav-glass fixed top-0 left-0 right-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center">
            <i className="fas fa-cube text-black text-sm"></i>
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">toolsmarketplace</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
          <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{color:'var(--fg-s)'}}></i>
          <input
            type="text"
            className="inp pr-10 text-sm"
            placeholder={t('search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="lang-wrap">
            <button className={`lang-btn ${lang==='ur'?'active':''}`} onClick={() => setLang('ur')}>اردو</button>
            <button className={`lang-btn ${lang==='en'?'active':''}`} onClick={() => setLang('en')}>EN</button>
          </div>

          <button className="theme-btn" onClick={toggle} aria-label="Toggle theme">
            <i className={isDark ? 'fas fa-moon' : 'fas fa-sun'}></i>
          </button>

          {user ? (
            <>
              <Link href="/sell" className="btn-p btn-sm hidden sm:flex items-center gap-2 pulse-r">
                <i className="fas fa-plus text-xs"></i>
                <span>{t('nav_sell')}</span>
              </Link>
              <Link href="/sell" className="btn-p btn-sm sm:hidden w-9 h-9 p-0 flex items-center justify-center rounded-full">
                <i className="fas fa-plus text-xs"></i>
              </Link>
              <Link href="/dashboard" className={`btn-o btn-sm hidden sm:flex items-center gap-2 ${pathname==='/dashboard'?'!border-amber-500/50 !text-amber-400':''}`}>
                <i className="fas fa-th-large text-xs"></i>
                <span>{t('nav_dashboard')}</span>
              </Link>
              <button onClick={signOut} className="btn-o btn-sm px-3" title={t('nav_logout')}>
                <i className="fas fa-sign-out-alt text-xs"></i>
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/auth/login" className="btn-o btn-sm hidden sm:block">{t('nav_login')}</Link>
              <Link href="/auth/signup" className="btn-p btn-sm">{t('nav_signup')}</Link>
            </>
          ) : null}
          
          <button onClick={() => { document.querySelector('.cart-side')?.classList.toggle('open'); document.querySelector('.cart-over')?.classList.toggle('open'); }}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{background:'var(--card)',border:'1px solid var(--border)'}}>
            <i className="fas fa-shopping-cart text-sm" style={{color:'var(--fg-m)'}}></i>
            {count > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
