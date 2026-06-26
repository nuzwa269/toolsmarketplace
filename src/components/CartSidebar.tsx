'use client'

import { useCart } from '@/contexts/CartContext'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CartSidebar() {
  const { items, remove, clear, total, count } = useCart()
  const { t } = useLang()
  const { user } = useAuth()
  const { show } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (!user) { show(t('toast_login_required'), 'warning'); router.push('/auth/login'); return }
    if (items.length === 0) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: order, error } = await supabase
        .from('orders')
        .insert({ buyer_id: user.id, total_amount: total })
        .select()
        .single()

      if (error) throw error

      const orderItems = items.map(i => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        price: i.product.price,
        download_url: i.product.download_url
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      // فروخت کی تعداد بڑھائیں
      for (const item of items) {
        await supabase.rpc('', {}).catch(() => {}) // آپسٹ موہوجی
        await supabase.from('products').update({
          sales_count: item.product.sales_count + 1
        }).eq('id', item.product.id)
      }

      clear()
      setOpen(false)
      show(t('toast_checkout'), 'success')
      router.push('/dashboard')
    } catch {
      show('Error processing order', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={`cart-over ${open ? 'open' : ''}`} onClick={() => setOpen(false)}></div>
      <aside className={`cart-side ${open ? 'open' : ''}`}>
        <div className="p-6 flex items-center justify-between" style={{borderBottom:'1px solid var(--border)'}}>
          <h3 className="font-bold text-lg urdu">{t('cart_title')}</h3>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'var(--card)'}}>
            <i className="fas fa-times text-sm" style={{color:'var(--fg-m)'}}></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <i className="fas fa-shopping-cart text-4xl mb-4" style={{color:'var(--border)'}}></i>
              <p className="urdu" style={{color:'var(--fg-m)'}}>{t('cart_empty')}</p>
              <p className="text-sm urdu mt-1" style={{color:'var(--fg-s)'}}>{t('cart_empty_hint')}</p>
            </div>
          ) : items.map(item => (
            <div key={item.product.id} className="flex gap-4 py-4" style={{borderBottom:'1px solid var(--border)'}}>
              <img src={item.product.image_url || '/placeholder.svg'} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{item.product.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className={`price-t text-base ${item.product.price===0?'free':''}`}>
                    {item.product.price === 0 ? t('free_text') : `$${item.product.price}`}
                  </span>
                  <button onClick={() => remove(item.product.id)} className="text-red-400 hover:text-red-300 text-xs">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-6" style={{borderTop:'1px solid var(--border)'}}>
            <div className="flex items-center justify-between mb-4">
              <span className="urdu" style={{color:'var(--fg-m)'}}>{t('cart_total_label')}</span>
              <span className="text-2xl font-bold text-amber-400">{total===0 ? t('cart_free') : `$${total.toFixed(2)}`}</span>
            </div>
            <button onClick={handleCheckout} disabled={loading} className="btn-p w-full py-3 text-base disabled:opacity-50">
              <i className="fas fa-credit-card ml-2"></i>
              {loading ? '...' : total === 0 ? t('cart_free_download') : t('cart_checkout')}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
