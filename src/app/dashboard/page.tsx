'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase'
import { Product, Order } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DashboardPage() {
  const { user } = useAuth()
  const { t, lang, catLabel, productDesc, productName } = useLang()
  const { show } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'products' | 'orders'>('products')

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    supabase.from('products').select('*, profiles(*)').eq('seller_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setProducts(data || []))

    supabase.from('orders').select('*, order_items(*)').eq('buyer_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []))
  }, [user])

  async function deleteProduct(id: string) {
    if (!confirm(t('delete_confirm'))) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    show('Deleted', 'success')
  }

  if (!user) return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-32 text-center">
        <p className="urdu text-lg" style={{color:'var(--fg-m)'}}>{t('toast_login_required')}</p>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <h1 className="text-3xl font-bold mb-8 urdu">{t('dashboard_title')}</h1>

        <div className="flex gap-3 mb-8">
          <button onClick={() => setTab('products')} className={`cat-tab ${tab==='products'?'active':''}`}>{t('dashboard_my_products')}</button>
          <button onClick={() => setTab('orders')} className={`cat-tab ${tab==='orders'?'active':''}`}>{t('dashboard_my_orders')}</button>
        </div>

        {tab === 'products' && (
          <div>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="urdu" style={{color:'var(--fg-m)'}}>{t('dashboard_no_products')}</p>
                <Link href="/sell" className="btn-p inline-block mt-4">{t('nav_sell')}</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map(p => (
                  <div key={p.id} className="rounded-xl p-4 flex items-center gap-4" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
                    {p.image_url && <img src={p.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{productName(p)}</h3>
                      <div className="flex items-center gap-3 text-sm" style={{color:'var(--fg-s)'}}>
                        <span className={`badge badge-${p.category}`}>{catLabel(p.category)}</span>
                        <span className={`price-t text-sm ${p.price===0?'free':''}`}>{p.price===0 ? t('free_text') : `$${p.price}`}</span>
                        <span>{t('sales_text',{count:p.sales_count})}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-300 p-2">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="urdu" style={{color:'var(--fg-m)'}}>{t('dashboard_no_orders')}</p>
                <Link href="/products" className="btn-o inline-block mt-4">{t('hero_btn_explore')}</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="rounded-xl p-5" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{t('order_id')}{o.id.slice(0,8)}</span>
                      <span className="text-sm" style={{color:'var(--fg-s)'}}>{new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-2">
                      {o.order_items?.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1" style={{borderBottom:'1px solid var(--border)'}}>
                          <span>{item.product_name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-amber-400 font-semibold">${item.price}</span>
                            {item.download_url && (
                              <a href={item.download_url} target="_blank" rel="noopener" className="text-emerald-400 hover:underline text-xs">
                                <i className="fas fa-download mr-1"></i>{t('order_download')}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-amber-400">${o.total_amount}</span>
                      <span className="badge badge-app">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
