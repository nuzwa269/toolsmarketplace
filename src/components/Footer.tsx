'use client'

import { useLang } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLang()

  const links = [
    { label: t('cat_labels_extension'), href: '/products?cat=extension' },
    { label: t('cat_labels_app'), href: '/products?cat=app' },
    { label: t('cat_labels_tool'), href: '/products?cat=tool' },
    { label: t('cat_labels_website'), href: '/products?cat=website' },
  ]

  return (
    <footer style={{borderTop:'1px solid var(--border)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center">
                <i className="fas fa-cube text-black text-xs"></i>
              </div>
              <span className="font-bold">ToolsMarketPlace</span>
            </div>
            <p className="text-sm urdu" style={{color:'var(--fg-s)'}}>{t('footer_desc')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">{t('footer_platform')}</h4>
            <ul className="space-y-2 text-sm" style={{color:'var(--fg-m)'}}>
              {links.map(l => <li key={l.href}><a href={l.href} className="hover:text-amber-400 transition-colors urdu">{l.label}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm urdu">{t('footer_help')}</h4>
            <ul className="space-y-2 text-sm urdu" style={{color:'var(--fg-m)'}}>
              <li><a href="#" className="hover:text-amber-400 transition-colors">{t('nav_sell')}?</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">{t('cart_checkout')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm urdu">{t('footer_connect')}</h4>
            <div className="flex items-center gap-3">
              {['twitter','github','discord','youtube'].map(s => (
                <a key={s} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:text-amber-400 hover:border-amber-500/30"
                  style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--fg-m)'}}>
                  <i className={`fab fa-${s} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 text-center text-sm" style={{borderTop:'1px solid var(--border)',color:'var(--fg-s)'}}>
          2026 ToolsMarketPlace — {t('footer_rights')}
        </div>
      </div>
    </footer>
  )
}
