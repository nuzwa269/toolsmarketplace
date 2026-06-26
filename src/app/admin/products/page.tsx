'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase'
import { Product, Profile } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AdminProductsPage() {
  const { profile, loading: authLoading } = useAuth()
  const { t, catLabel } = useLang()
  const { show } = useToast()
  const router = useRouter()
  const [products, setProducts] = useState<(Product & { profiles?: Profile })[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  useEffect(() => {
    if (authLoading) return
    if (!profile || profile.role !== 'admin') { router.push('/'); return }
  }, [profile, authLoading])

  useEffect(() => {
    if (profile?.role !== 'admin') return
    fetchProducts()
  }, [profile])

  async function fetchProducts() {
    const supabase = createClient()
    const { data } = await supabase.from('products').select('*, profiles(*)').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  async function toggleApproval(id: string, currentApproved: boolean) {
    const supabase = createClient()
    await supabase.from('products').update({ is_approved: !currentApproved }).eq('id', id)
    setProducts(function(prev) {
      return prev.map(function(p) {
        if (p.id === id) {
          return Object.assign({}, p, { is_approved: !currentApproved })
        }
        return p
      })
    })
    if (currentApproved) {
      show(t('admin_product_rejected_msg'), 'warning')
    } else {
      show(t('admin_product_approved_msg'), 'success')
    }
  }

  if (authLoading || !profile || profile.role !== 'admin') return null

  var filtered = products
  if (filter === 'pending') {
    filtered = filtered.filter(function(p) { return !p.is_approved })
  } else if (filter === 'approved') {
    filtered = filtered.filter(function(p) { return p.is_approved })
  }

  var pendingCount = products.filter(function(p) { return !p.is_approved }).length
  var approvedCount = products.filter(function(p) { return p.is_approved }).length

  var tabs = [
    { key: 'all' as const, label: t('cat_all'), count: products.length },
    { key: 'pending' as const, label: t('admin_pending'), count: pendingCount },
    { key: 'approved' as const, label: t('admin_approved'), count: approvedCount },
  ]

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="btn-o btn-sm">
            <i className="fas fa-arrow-right mr-1"></i>
          </Link>
          <h1 className="text-3xl font-bold">{t('admin_products')}</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(function(tab) {
            return (
              <button
                key={tab.key}
                onClick={function() { setFilter(tab.key) }}
                className={'cat-tab text-xs ' + (filter === tab.key ? 'active' : '')}
              >
                {tab.label} ({tab.count})
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-box-open text-4xl mb-4" style={{color:'var(--border)'}}></i>
            <p style={{color:'var(--fg-m)'}}>No products found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(function(p) {
              return (
                <div key={p.id} className="rounded-2xl p-4 flex items-center gap-4" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
                  {p.image_url && (
                    <img src={p.image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="flex items-center gap-3 text-sm" style={{color:'var(--fg-s)'}}>
                      <span className={'badge badge-' + p.category}>{catLabel(p.category)}</span>
                      <span className={'price-t text-sm ' + (p.price === 0 ? 'free' : '')}>
                        {p.price === 0 ? t('free_text') : '$' + p.price}
                      </span>
                      <span>by {p.profiles?.full_name || '—'}</span>
                    </div>
                  </div>
                  <span className={'badge ' + (p.is_approved ? 'badge-free' : 'bg-yellow-500/15 text-yellow-400')}>
                    {p.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  <Link
                    href={'/admin/products/' + p.id}
                    className="btn-o btn-sm hidden sm:inline-block"
                  >
                    Review
                  </Link>
                  <button
                    onClick={function() { toggleApproval(p.id, p.is_approved) }}
                    className="btn-sm px-4 py-2 rounded-lg font-semibold text-sm transition-colors border-none cursor-pointer"
                    style={{
                      fontFamily: 'inherit',
                      color: p.is_approved ? '#f87171' : '#34d399',
                      background: p.is_approved ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'
                    }}
                  >
                    <i className={'fas ' + (p.is_approved ? 'fa-times-circle' : 'fa-check-circle') + ' mr-1'}></i>
                    {p.is_approved ? t('admin_product_reject') : t('admin_product_approve')}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
