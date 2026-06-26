'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase'
import { Product } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AdminProductDetailPage() {
  const { profile, loading: authLoading } = useAuth()
  const { t, catLabel, productDesc, productName } = useLang()
  const { show } = useToast()
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!profile || profile.role !== 'admin') { router.push('/'); return }
  }, [profile, authLoading])

  useEffect(() => {
    if (profile?.role !== 'admin') return
    const supabase = createClient()
    supabase.from('products').select('*, profiles(*)').eq('id', productId).single()
      .then(({ data }) => setProduct(data))
  }, [profile, productId])

  if (authLoading || !profile || profile.role !== 'admin' || !product) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}>
      <i className="fas fa-spinner fa-spin text-3xl text-amber-400"></i>
    </div>
  )

  async function handleApprove() {
    const supabase = createClient()
    await supabase.from('products').update({ is_approved: true }).eq('id', productId)
    setProduct(prev => prev ? { ...prev, is_approved: true } : null)
    show(t('admin_product_approved_msg'), 'success')
  }

  async function handleReject() {
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    show(t('admin_product_rejected_msg'), 'warning')
    router.push('/admin/products')
  }

  const name = productName(product)
  const desc = productDesc(product)

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/products" className="btn-o btn-sm">
            <i className="fas fa-arrow-right mr-1"></i>
          </Link>
          <h1 className="text-2xl font-bold">Product Review</h1>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
          {product.image_url && (
            <img src={product.image_url} alt={name} className="w-full h-64 object-cover" />
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge badge-${product.category}`}>{catLabel(product.category)}</span>
                  <span className={`badge ${product.is_approved ? 'badge-free' : 'bg-yellow-500/15 text-yellow-400'}`}>
                    {product.is_approved ? 'Approved' : 'Pending Review'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">{name}</h2>
                {product.name_en && (
                  <p className="text-sm" style={{color:'var(--fg-s)'}}>{product.name_en}</p>
                )}
              </div>
              <span className={`price-t text-3xl ${product.price===0?'free':''}`}>
                {product.price === 0 ? t('free_text') : `$${product.price}`}
              </span>
            </div>

            <p className="urdu text-lg leading-loose mb-6" style={{color:'var(--fg-m)'}}>{desc}</p>
            {product.description_en && (
              <p className="text-base leading-relaxed mb-6" style={{color:'var(--fg-m)'}}>{product.description_en}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map(tag => (
                <span key={tag} className="rounded-lg px-3 py-1 text-xs" style={{background:'var(--bg)',border:'1px solid var(--border)',color:'var(--fg-m)'}}>#{tag}</span>
              ))}
            </div>

            {/* سیلر کی معلومات */}
            <div className="rounded-xl p-4 mb-6 flex items-center gap-4" style={{background:'var(--bg)',border:'1px solid var(--border)'}}>
              <div className="seller-av w-11 h-11 text-sm">
                {product.profiles?.full_name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '??'}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{product.profiles?.full_name || '—'}</div>
                <div className="text-sm urdu" style={{color:'var(--fg-s)'}}>{product.profiles?.university || ''}</div>
              </div>
              <Link href={`/admin/students/${product.seller_id}`} className="btn-o btn-sm text-xs">View Seller</Link>
            </div>

            {/* لنکس */}
            <div className="rounded-xl p-4 mb-6" style={{background:'var(--bg)',border:'1px solid var(--border)'}}>
              <div className="text-sm font-medium mb-2" style={{color:'var(--fg-m)'}}>Download URL:</div>
              <a href={product.download_url} target="_blank" rel="noopener" className="text-amber-400 text-sm hover:underline break-all">
                {product.download_url}
              </a>
            </div>

            {/* ایکشن بٹنز */}
            {!product.is_approved && (
              <div className="flex gap-3">
                <button onClick={handleApprove} className="btn-p flex-1 py-3 text-base flex items-center justify-center gap-2">
                  <i className="fas fa-check-circle"></i> {t('admin_product_approve')}
                </button>
                <button onClick={handleReject} className="flex-1 py-3 rounded-xl font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors bg-transparent cursor-pointer text-base flex items-center justify-center gap-2"
                  style={{fontFamily:'inherit'}}>
                  <i className="fas fa-times-circle"></i> {t('admin_product_reject')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
