'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { createClient } from '@/lib/supabase'
import { Profile, Product, Order } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [students, setStudents] = useState<Profile[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/admin-login'); return }
    if (profile && profile.role !== 'admin') { router.push('/'); return }
  }, [user, profile, authLoading])

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return
    const supabase = createClient()

    supabase.from('profiles').select('*').neq('role', 'admin').order('created_at', { ascending: false })
      .then(({ data }) => setStudents(data || []))

    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setProducts(data || []))

    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []))
  }, [user, profile])

  if (authLoading || !profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}>
      <i className="fas fa-spinner fa-spin text-3xl text-amber-400"></i>
    </div>
  )

  if (profile.role !== 'admin') return null

  const pendingCount = students.filter(s => !s.is_approved_seller && !s.is_rejected).length
  const approvedCount = students.filter(s => s.is_approved_seller).length
  const rejectedCount = students.filter(s => s.is_rejected && !s.is_approved_seller).length
  const unapprovedProducts = products.filter(p => !p.is_approved).length
  const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0)

  const stats = [
    { icon: 'fas fa-users', label: t('admin_total_students'), value: students.length, color: 'text-amber-400' },
    { icon: 'fas fa-clock', label: t('admin_pending'), value: pendingCount, color: 'text-yellow-400' },
    { icon: 'fas fa-check-circle', label: t('admin_approved'), value: approvedCount, color: 'text-emerald-400' },
    { icon: 'fas fa-times-circle', label: t('admin_rejected'), value: rejectedCount, color: 'text-red-400' },
    { icon: 'fas fa-box', label: t('admin_total_products'), value: products.length, color: 'text-indigo-400' },
    { icon: 'fas fa-exclamation-triangle', label: t('admin_unapproved_products'), value: unapprovedProducts, color: 'text-orange-400' },
    { icon: 'fas fa-dollar-sign', label: t('admin_total_revenue'), value: `$${totalRevenue}`, color: 'text-pink-400' },
    { icon: 'fas fa-shopping-bag', label: 'Total Orders', value: orders.length, color: 'text-cyan-400' },
  ]

  const recentStudents = students.slice(0, 5)
  const recentProducts = products.filter(p => !p.is_approved).slice(0, 5)

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        {/* ہیڈر */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <i className="fas fa-shield-alt text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('admin_title')}</h1>
            <p className="text-sm" style={{color:'var(--fg-s)'}}>admin@toola.market</p>
          </div>
        </div>

        <!-- اعداد و شمار -->
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl p-5" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
              <i className={`${s.icon} text-lg mb-2 ${s.color}`}></i>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm mt-1" style={{color:'var(--fg-s)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <!-- نیویگیشن کارڈز -->
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <Link href="/admin/students" className="rounded-2xl p-6 flex items-center gap-4 transition-all hover:scale-[1.02]" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <i className="fas fa-user-graduate text-amber-400 text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg">{t('admin_students')}</h3>
              <p className="text-sm" style={{color:'var(--fg-s)'}}>{students.length} students · {pendingCount} pending</p>
            </div>
            <i className="fas fa-chevron-right mr-auto" style={{color:'var(--fg-s)'}}></i>
          </Link>

          <Link href="/admin/products" className="rounded-2xl p-6 flex items-center gap-4 transition-all hover:scale-[1.02]" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <i className="fas fa-box text-indigo-400 text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg">{t('admin_products')}</h3>
              <p className="text-sm" style={{color:'var(--fg-s)'}}>{products.length} products · {unapprovedProducts} unapproved</p>
            </div>
            <i className="fas fa-chevron-right mr-auto" style={{color:'var(--fg-s)'}}></i>
          </Link>
        </div>

        <!-- حالیہ سٹوڈنٹس -->
        <div className="rounded-2xl p-6 mb-6" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">{t('admin_students')} (Recent)</h3>
            <Link href="/admin/students" className="text-amber-400 text-sm hover:underline">View All</Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-center py-8" style={{color:'var(--fg-s)'}}>No students yet</p>
          ) : (
            <div className="space-y-3">
              {recentStudents.map(s => (
                <Link key={s.id} href={`/admin/students/${s.id}`} className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:opacity-80" style={{background:'var(--bg)'}}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-black font-bold text-sm">
                    {s.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{s.full_name || '—'}</div>
                    <div className="text-xs truncate" style={{color:'var(--fg-s)'}}>{s.university || '—'}</div>
                  </div>
                  <StatusBadge status={getStudentStatus(s)} t={t} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <!-- غیر تصدیق شدہ پروڈکٹس -->
        {recentProducts.length > 0 && (
          <div className="rounded-2xl p-6" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{t('admin_unapproved_products')}</h3>
              <Link href="/admin/products" className="text-amber-400 text-sm hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentProducts.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl" style={{background:'var(--bg)'}}>
                  {p.image_url && <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="text-xs" style={{color:'var(--fg-s)'}}>{p.category} · ${p.price}</div>
                  </div>
                  <Link href={`/admin/products/${p.id}`} className="btn-o btn-sm">Review</Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

function getStudentStatus(s: Profile): string {
  if (s.is_approved_seller) return 'approved'
  if (s.is_rejected) return 'rejected'
  return 'pending'
}

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, { color: string; key: string }> = {
    approved: { color: 'bg-emerald-500/15 text-emerald-400', key: 'admin_status_approved' },
    rejected: { color: 'bg-red-500/15 text-red-400', key: 'admin_status_rejected' },
    pending: { color: 'bg-yellow-500/15 text-yellow-400', key: 'admin_status_pending' },
  }
  const info = map[status] || { color: 'bg-stone-500/15 text-stone-400', key: 'admin_status_normal' }
  return <span className={`badge ${info.color}`}>{t(info.key)}</span>
}
