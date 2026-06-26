'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AdminStudentsPage() {
  const { profile, loading: authLoading } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [students, setStudents] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    if (authLoading) return
    if (!profile || profile.role !== 'admin') { router.push('/'); return }
  }, [profile, authLoading])

  useEffect(() => {
    if (profile?.role !== 'admin') return
    const supabase = createClient()
    supabase.from('profiles').select('*').neq('role', 'admin').order('created_at', { ascending: false })
      .then(({ data }) => setStudents(data || []))
  }, [profile])

  if (authLoading || !profile || profile.role !== 'admin') return null

  let filtered = students
  if (filter === 'pending') filtered = filtered.filter(s => !s.is_approved_seller && !s.is_rejected)
  else if (filter === 'approved') filtered = filtered.filter(s => s.is_approved_seller)
  else if (filter === 'rejected') filtered = filtered.filter(s => s.is_rejected && !s.is_approved_seller)

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(s =>
      s.full_name?.toLowerCase().includes(q) ||
      s.university?.toLowerCase().includes(q) ||
      s.id.includes(q)
    )
  }

  const tabs = [
    { key: 'all' as const, label: t('cat_all'), count: students.length },
    { key: 'pending' as const, label: t('admin_pending'), count: students.filter(s => !s.is_approved_seller && !s.is_rejected).length },
    { key: 'approved' as const, label: t('admin_approved'), count: students.filter(s => s.is_approved_seller).length },
    { key: 'rejected' as const, label: t('admin_rejected'), count: students.filter(s => s.is_rejected && !s.is_approved_seller).length },
  ]

  function getStatus(s: Profile): string {
    if (s.is_approved_seller) return 'approved'
    if (s.is_rejected) return 'rejected'
    return 'pending'
  }

  const statusColors: Record<string, string> = {
    approved: 'bg-emerald-500/15 text-emerald-400',
    rejected: 'bg-red-500/15 text-red-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
  }

  const statusKeys: Record<string, string> = {
    approved: 'admin_status_approved',
    rejected: 'admin_status_rejected',
    pending: 'admin_status_pending',
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="btn-o btn-sm"><i className="fas fa-arrow-right mr-1"></i></Link>
          <h1 className="text-3xl font-bold">{t('admin_students')}</h1>
        </div>

        {/* سرچ اور فلٹر */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input className="inp flex-1" placeholder={t('admin_search_students')} value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`cat-tab text-xs ${filter === tab.key ? 'active' : ''}`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* سٹوڈنٹس ٹیبل */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-users text-4xl mb-4" style={{color:'var(--border)'}}></i>
            <p style={{color:'var(--fg-m)'}}>No students found</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
            {/* ڈیسک ٹاپ ہیڈر */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold" style={{color:'var(--fg-s)',borderBottom:'1px solid var(--border)',background:'var(--bg)'}}>
              <div className="col-span-3">{t('admin_name')}</div>
              <div className="col-span-2">{t('admin_email')}</div>
              <div className="col-span-2">{t('admin_university')}</div>
              <div className="col-span-2">{t('admin_status')}</div>
              <div className="col-span-1">{t('admin_registered')}</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {filtered.map(s => (
              <Link key={s.id} href={`/admin/students/${s.id}`}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 items-center transition-colors hover:opacity-80"
                style={{borderBottom:'1px solid var(--border)'}}>
                <div className="sm:col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                    {s.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '??'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{s.full_name || '—'}</div>
                    <div className="text-xs sm:hidden" style={{color:'var(--fg-s)'}}>{s.university}</div>
                  </div>
                </div>
                <div className="sm:col-span-2 text-sm truncate hidden sm:block" style={{color:'var(--fg-m)'}}>{s.id.slice(0,8)}@...</div>
                <div className="sm:col-span-2 text-sm truncate hidden sm:block" style={{color:'var(--fg-m)'}}>{s.university || '—'}</div>
                <div className="sm:col-span-2">
                  <span className={`badge ${statusColors[getStatus(s)]}`}>{t(statusKeys[getStatus(s)])}</span>
                </div>
                <div className="sm:col-span-1 text-sm hidden sm:block" style={{color:'var(--fg-s)'}}>
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
                <div className="sm:col-span-2 text-right">
                  <span className="btn-o btn-sm text-xs">{t('admin_student_detail')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
