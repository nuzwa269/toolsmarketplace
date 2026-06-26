'use client'

import { Product } from '@/lib/types'
import { useLang } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function HomeClient({
  featured, latest, productCount, userCount
}: {
  featured: Product[]
  latest: Product[]
  productCount: number
  userCount: number
}) {
  const { t } = useLang()
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // پارٹیکل سسٹم
    const canvas = document.getElementById('particles') as HTMLCanvasElement
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')!
    const parent = canvas.parentElement!

    function resize() { canvas.width = parent.offsetWidth; canvas.height = parent.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const pts = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      s: Math.random() * 2 + 0.5,
      o: Math.random() * 0.4 + 0.1
    }))

    let mouse = { x: -999, y: -999 }
    parent.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    })

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const dx = mouse.x - p.x, dy = mouse.y - p.y
        const d = Math.sqrt(dx * dx + dy * dy)
        const g = d < 150 ? (1 - d / 150) * 0.6 : 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.1, p.s + g * 2), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,158,11,${p.o + g})`
        ctx.fill()

        for (let j = i + 1; j < pts.length; j++) {
          const p2 = pts[j]
          const dd = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2)
          if (dd < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(245,158,11,${0.06 * (1 - dd / 120)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      })
      requestAnimationFrame(frame)
    }
    frame()

    // ریویل آبزرور
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))

    return () => { window.removeEventListener('resize', resize) }
  }, [])

  return (
    <>
      {/* ہیرو */}
      <header ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden hero-grad">
        <div className="hero-grid absolute inset-0"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <canvas id="particles" className="absolute inset-0 w-full h-full pointer-events-none"></canvas>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm urdu" style={{color:'var(--fg-m)'}}>{t('hero_badge')}</span>
          </div>

          <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="block">{t('hero_title_1')}</span>
            <span className="block bg-gradient-to-l from-amber-400 via-amber-500 to-emerald-400 bg-clip-text text-transparent">{t('hero_title_2')}</span>
          </h1>

          <p className="urdu text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{color:'var(--fg-m)'}}>{t('hero_desc')}</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/products" className="btn-p text-base px-8 py-3">
              <i className="fas fa-compass ml-2"></i>{t('hero_btn_explore')}
            </Link>
            <Link href="/sell" className="btn-o text-base px-8 py-3">
              <i className="fas fa-rocket ml-2"></i>{t('hero_btn_sell')}
            </Link>
          </div>

          <div className="stats-g grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">
            {[
              { val: `${userCount}+`, label: t('stat_students'), color: 'text-amber-400' },
              { val: `${productCount}+`, label: t('stat_products'), color: 'text-emerald-400' },
              { val: '$47K', label: t('stat_earnings'), color: 'text-pink-400' },
              { val: '4.8', label: t('stat_rating'), color: 'text-indigo-400' },
            ].map((s, i) => (
              <div key={i} className="stat-n rounded-2xl p-4" style={{background:'var(--card)',border:'1px solid var(--border)',animationDelay:`${i*0.1}s`}}>
                <div className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-sm mt-1 urdu" style={{color:'var(--fg-s)'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* فیچرڈ */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 reveal">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <i className="fas fa-star text-amber-400"></i> {t('featured_label')}
          </h2>
          <div className="p-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* تازہ ترین */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 reveal">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{t('sort_latest')}</h2>
          <Link href="/products" className="btn-o btn-sm">{t('hero_btn_explore')} <i className="fas fa-arrow-right mr-1"></i></Link>
        </div>
        <div className="p-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latest.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* فیچر سیکشن */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 reveal">
        <div className="rounded-3xl p-8 sm:p-12" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
          <div className="max-w-2xl">
            <span className="badge badge-featured mb-4"><i className="fas fa-star text-[10px]"></i> {t('featured_label')}</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 urdu">{t('feature_title')}</h2>
            <p className="urdu leading-loose mb-8" style={{color:'var(--fg-m)'}}>{t('feature_desc')}</p>
            <ul className="space-y-4">
              {[t('feature_1'), t('feature_2'), t('feature_3'), t('feature_4')].map((f, i) => (
                <li key={i} className="flex items-center gap-3 urdu" style={{color:'var(--fg)'}}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{background:'rgba(245,158,11,0.15)'}}>
                    <i className="fas fa-check text-amber-400 text-[10px]"></i>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
