'use client'

import { useState } from 'react'
import { Product, Review } from '@/lib/types'
import { useLang } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Stars } from '@/components/ProductCard'
import { createClient } from '@/lib/supabase'

export default function ProductDetailClient({ product, reviews: initialReviews }: { product: Product; reviews: Review[] }) {
  const { lang, t, catLabel, productDesc, productName } = useLang()
  const { add } = useCart()
  const { user } = useAuth()
  const { show } = useToast()
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const name = productName(product)
  const desc = productDesc(product)
  const initials = product.profiles?.full_name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '??'

  function handleAdd() {
    add(product)
    show(t('toast_added'), 'success')
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { show(t('toast_login_required'), 'warning'); return }
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data } = await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: user.id,
        rating,
        comment: comment || null
      }).select('*, profiles(*)').single()

      if (data) setReviews(prev => [data, ...prev])
      show(t('toast_review'), 'success')
      setComment('')
    } catch {
      show('Error submitting review', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const userReview = reviews.find(r => r.user_id === user?.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
      <div className="rounded-2xl overflow-hidden" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
        {product.image_url && (
          <img src={product.image_url} alt={name} className="w-full h-64 sm:h-80 object-cover" />
        )}

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge badge-${product.category}`}>{catLabel(product.category)}</span>
                {product.is_featured && <span className="badge badge-featured"><i className="fas fa-star text-[8px]"></i></span>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{name}</h1>
              <div className="flex items-center gap-2">
                <Stars rating={product.rating} />
                <span style={{color:'var(--fg-s)'}} className="text-sm">{product.rating} ({product.review_count})</span>
                <span style={{color:'var(--fg-s)'}} className="text-sm mr-4">{t('sales_text', {count: product.sales_count})}</span>
              </div>
            </div>
            <span className={`price-t text-3xl ${product.price===0?'free':''}`}>
              {product.price === 0 ? t('free_text') : `$${product.price}`}
            </span>
          </div>

          <p className="urdu text-lg leading-loose mb-6" style={{color:'var(--fg-m)'}}>{desc}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {product.tags.map(tag => (
              <span key={tag} className="rounded-lg px-3 py-1 text-xs" style={{background:'var(--bg)',border:'1px solid var(--border)',color:'var(--fg-m)'}}>#{tag}</span>
            ))}
          </div>

          {/* سیلر */}
          <div className="rounded-xl p-4 mb-6 flex items-center gap-4" style={{background:'var(--bg)',border:'1px solid var(--border)'}}>
            <div className="seller-av w-11 h-11 text-sm">{initials}</div>
            <div className="flex-1">
              <div className="font-semibold">{product.profiles?.full_name || '—'}</div>
              <div className="text-sm urdu" style={{color:'var(--fg-s)'}}>{product.profiles?.university || ''}</div>
            </div>
            <div className="text-left">
              <div className="text-xs urdu" style={{color:'var(--fg-s)'}}>{t('modal_total_sales')}</div>
              <div className="font-bold text-amber-400">{product.sales_count}</div>
            </div>
          </div>

          {/* اعداد */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[{ v: product.sales_count, l: t('sales_label') }, { v: product.rating, l: t('rating_label') }, { v: product.review_count, l: t('reviews_label') }].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{background:'var(--bg)'}}>
                <div className="text-lg font-bold">{s.v}</div>
                <div className="text-[10px]" style={{color:'var(--fg-s)'}}>{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-10">
            <button onClick={handleAdd} className="btn-p flex-1 py-3 text-base">
              <i className="fas fa-cart-plus ml-2"></i>
              {product.price === 0 ? t('modal_get_free') : t('modal_add_cart')}
            </button>
          </div>

          {/* ریویوز */}
          <div style={{borderTop:'1px solid var(--border)'}} className="pt-8">
            <h3 className="text-xl font-bold mb-6">{t('reviews_label')} ({reviews.length})</h3>

            {user && !userReview && (
              <form onSubmit={handleReview} className="rounded-xl p-5 mb-8" style={{background:'var(--bg)',border:'1px solid var(--border)'}}>
                <h4 className="font-semibold mb-3">{t('modal_write_review')}</h4>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} type="button" onClick={() => setRating(i)} className="text-2xl" style={{color: i <= rating ? '#F59E0B' : 'var(--border)'}}>
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                </div>
                <textarea className="inp mb-3" rows={3} placeholder={t('modal_your_review')} value={comment} onChange={e => setComment(e.target.value)}></textarea>
                <button type="submit" disabled={submitting} className="btn-p btn-sm">{submitting ? '...' : t('modal_submit_review')}</button>
              </form>
            )}

            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="rounded-xl p-4" style={{background:'var(--bg)',border:'1px solid var(--border)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="seller-av">{r.profiles?.full_name?.[0] || '?'}</div>
                      <span className="font-medium text-sm">{r.profiles?.full_name || '—'}</span>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment && <p className="text-sm urdu" style={{color:'var(--fg-m)'}}>{r.comment}</p>}
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm urdu" style={{color:'var(--fg-s)'}}>No reviews yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
