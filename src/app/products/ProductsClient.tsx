'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/types'
import { useLang } from '@/contexts/LanguageContext'
import ProductCard from '@/components/ProductCard'

const categories = ['all', 'extension', 'app', 'tool', 'website']

export default function ProductsClient({
  products, initialCat, initialQ, initialSort
}: {
  products: Product[]
  initialCat: string
  initialQ: string
  initialSort: string
}) {
  const { t, catLabel } = useLang()
  const router = useRouter()
  const [cat, setCat] = useState(initialCat)
  const [sort, setSort] = useState(initialSort)
  const [q, setQ] = useState(initialQ)

  function applyFilters(newCat?: string, newSort?: string) {
    const params = new URLSearchParams()
    if (newCat || cat) params.set('cat', newCat || cat)
    if (newSort || sort) params.set('sort', newSort || sort)
    if (q) params.set('q', q)
    router.push(`/products?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilters()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
      <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2">
        {categories.map(c => (
          <button
            key={c}
            className={`cat-tab ${cat === c ? 'active' : ''}`}
            onClick={() => { setCat(c); applyFilters(c, sort) }}
          >
            {c === 'all' ? t('cat_all') : catLabel(c)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <p className="text-sm urdu" style={{color:'var(--fg-m)'}}>
          {t('result_text', { count: products.length })}
        </p>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <input className="inp text-sm w-48" placeholder={t('search_placeholder')} value={q} onChange={e => setQ(e.target.value)} />
          </form>
          <select className="inp text-sm w-auto" value={sort} onChange={e => { setSort(e.target.value); applyFilters(cat, e.target.value) }}>
            <option value="latest">{t('sort_latest')}</option>
            <option value="popular">{t('sort_popular')}</option>
            <option value="price-low">{t('sort_price_low')}</option>
            <option value="price-high">{t('sort_price_high')}</option>
            <option value="rating">{t('sort_rating')}</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <i className="fas fa-search text-4xl mb-4" style={{color:'var(--border)'}}></i>
          <p className="text-lg urdu" style={{color:'var(--fg-m)'}}>{t('no_results')}</p>
          <p className="text-sm urdu mt-2" style={{color:'var(--fg-s)'}}>{t('no_results_hint')}</p>
        </div>
      ) : (
        <div className="p-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
