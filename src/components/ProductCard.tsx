'use client'

import Link from 'next/link'
import { Product } from '@/lib/types'
import { useLang } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'

export default function ProductCard({ product }: { product: Product }) {
  const { lang, t, catLabel, productDesc, productName } = useLang()
  const { add } = useCart()
  const { show } = useToast()
  const { user } = useAuth()

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    add(product)
    show(t('toast_added'), 'success')
  }

  const name = productName(product)
  const desc = productDesc(product)
  const initials = product.profiles?.full_name
    ? product.profiles.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0,2)
    : '??'

  return (
    <Link href={`/products/${product.id}`} className="p-card shimmer block">
      <div className="card-img">
        <img src={product.image_url || '/placeholder.svg'} alt={name} loading="lazy" />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`badge badge-${product.category}`}>{catLabel(product.category)}</span>
          {product.is_featured && <span className="badge badge-featured"><i className="fas fa-star text-[8px]"></i> {t('featured_label')}</span>}
        </div>
        {product.price === 0 && <div className="absolute top-3 left-3"><span className="badge badge-free">{t('free_text')}</span></div>}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg leading-tight">{name}</h3>
          <span className={`price-t ${product.price===0?'free':''}`}>{product.price===0 ? t('free_text') : `$${product.price}`}</span>
        </div>
        <p className="text-sm urdu mb-4" style={{color:'var(--fg-m)',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{desc}</p>
        <div className="flex items-center gap-1 mb-3">
          <Stars rating={product.rating} />
          <span className="text-xs mr-1" style={{color:'var(--fg-s)'}}>({product.review_count})</span>
          <span className="text-xs mr-auto" style={{color:'var(--fg-s)'}}>{t('sales_text', {count: product.sales_count})}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="seller-av">{initials}</div>
            <div>
              <div className="text-xs font-medium">{product.profiles?.full_name || '—'}</div>
              <div className="text-[10px]" style={{color:'var(--fg-s)'}}>{product.profiles?.university || ''}</div>
            </div>
          </div>
          <button onClick={handleAdd} className="btn-p btn-sm flex items-center gap-1">
            <i className="fas fa-cart-plus text-[10px]"></i>
            <span>{product.price===0 ? t('btn_free_get') : t('btn_cart_add')}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => {
        if (i <= Math.floor(rating)) return <i key={i} className="fas fa-star"></i>
        if (i - 0.5 <= rating) return <i key={i} className="fas fa-star-half-alt"></i>
        return <i key={i} className="fas fa-star empty"></i>
      })}
    </span>
  )
}

export { Stars }
