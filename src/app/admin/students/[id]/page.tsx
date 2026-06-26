'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase'
import { Profile, Product, AdminNote } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function StudentDetailPage() {
  const { profile, loading: authLoading } = useAuth()
  const { t } = useLang()
  const { show } = useToast()
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [notes, setNotes] = useState<AdminNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!profile || profile.role !== 'admin') { router.push('/'); return }
  }, [profile, authLoading])

  useEffect(() => {
    if (profile?.role !== 'admin') return
    const supabase = createClient()

    supabase.from('profiles').select('*').eq('id', studentId).single()
      .then(({ data }) => setStudent(data))

    supabase.from('products').select('*').eq('seller_id', studentId).order('created_at', { ascending: false })
      .then(({ data }) => setProducts(data || []))

    supabase.from('admin_notes').select('*, profiles(full_name)').eq('student_id', studentId).order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data || []))
  }, [profile, studentId])

  if (authLoading || !profile || profile.role !== 'admin' || !student) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}>
      <i className="fas fa-spinner fa-spin text-3xl text-amber-400"></i>
    </div>
  )

  const initials = student.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'
  const status = student.is_approved_seller ? 'approved' : student.is_rejected ? 'rejected' : 'pending'
  const statusColors: Record<string, string> = {
    approved: 'bg-emerald-500/15 text-emerald-400',
    rejected: 'bg-red-500/15 text-red-400',
    pending: 'bg-yellow-500/15 text-yellow-400'
  }
  const statusKeys: Record<string, string> = {
    approved: 'admin_status_approved',
    rejected: 'admin_status_rejected',
    pending: 'admin_status_pending'
  }

  async function handleApprove() {
    if (!confirm(t('admin_approve_confirm'))) return
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      is_approved_seller: true, is_rejected: false, reject_reason: null
    }).eq('id', studentId)
    setStudent(prev => prev ? { ...prev, is_approved_seller: true, is_rejected: false, reject_reason: null } : null)
    show(t('admin_approved_msg'), 'success')
    setActionLoading(false)
  }

  function openRejectModal() {
    setRejectReason('')
    setShowRejectModal(true)
  }

  async function handleReject() {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      is_approved_seller: false, is_rejected: true, reject_reason: rejectReason || null
    }).eq('id', studentId)
    setStudent(prev => prev ? { ...prev, is_approved_seller: false, is_rejected: true, reject_reason: rejectReason || null } : null)
    setShowRejectModal(false)
    show(t('admin_rejected_msg'), 'warning')
    setActionLoading(false)
  }

  async function handleRevoke() {
    if (!confirm(t('admin_revoke_confirm'))) return
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({
      is_approved_seller: false, is_rejected: false, reject_reason: null
    }).eq('id', studentId)
    setStudent(prev => prev ? { ...prev, is_approved_seller: false, is_rejected: false, reject_reason: null } : null)
    show(t('admin_revoked_msg'), 'warning')
    setActionLoading(false)
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim() || !profile) return
    const supabase = createClient()
    const { data } = await supabase.from('admin_notes').insert({
      admin_id: profile.id, student_id: studentId, note: newNote.trim()
    }).select('*, profiles(full_name)').single()
    if (data) setNotes(prev => [data, ...prev])
    setNewNote('')
    show('Note added', 'success')
  }

  const infoRows = [
    { label: t('admin_name'), value: student.full_name },
    { label: 'ID', value: student.id },
    { label: t('admin_email'), value: student.id.slice(0, 8) + '@user.supabase' },
    { label: t('admin_phone'), value: student.phone || '—' },
    { label: t('admin_university'), value: student.university || '—' },
    { label: t('admin_bank'), value: student.bank_account || '—' },
    { label: t('admin_registered'), value: new Date(student.created_at).toLocaleString() },
  ]

  const totalSales = products.reduce((s, p) => s + p.sales_count, 0)

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/students" className="btn-o btn-sm">
            <i className="fas fa-arrow-right mr-1"></i>
          </Link>
          <h1 className="text-2xl font-bold">{t('admin_student_detail')}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* بائیں کالم */}
          <div className="lg:col-span-2 space-y-6">
            {/* پروفائل کارڈ */}
            <div className="rounded-2xl p-6" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-black font-bold text-xl flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{student.full_name || '—'}</h2>
                  <p className="text-sm" style={{color:'var(--fg-s)'}}>{student.university || ''}</p>
                  <span className={`badge ${statusColors[status]} mt-2 inline-block`}>
                    {t(statusKeys[status])}
                  </span>
                </div>
              </div>

              {student.reject_reason && (
                <div className="rounded-xl p-4 mb-4" style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)'}}>
                  <div className="text-sm font-semibold text-red-400 mb-1">Rejection Reason:</div>
                  <p className="text-sm text-red-300">{student.reject_reason}</p>
                </div>
              )}

              <h3 className="font-semibold mb-3">{t('admin_personal_info')}</h3>
              <div className="space-y-0">
                {infoRows.map((row, i) => (
                  <div key={i} className="flex items-start gap-3 py-3" style={{borderBottom:'1px solid var(--border)'}}>
                    <span className="text-sm font-medium w-32 flex-shrink-0" style={{color:'var(--fg-m)'}}>{row.label}</span>
                    <span className="text-sm break-all">{row.value}</span>
                  </div>
                ))}
              </div>

              {student.skills && student.skills.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2" style={{color:'var(--fg-m)'}}>{t('admin_skills')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, i) => (
                      <span key={i} className="rounded-lg px-3 py-1 text-xs" style={{background:'var(--bg)',border:'1px solid var(--border)',color:'var(--fg-m)'}}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {student.bio && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2" style={{color:'var(--fg-m)'}}>{t('admin_bio')}</h4>
                  <p className="text-sm urdu" style={{color:'var(--fg-m)'}}>{student.bio}</p>
                </div>
              )}
            </div>

            {/* سٹوڈنٹ کی پروڈکٹس */}
            <div className="rounded-2xl p-6" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
              <h3 className="font-bold mb-4">{t('admin_products_count')} ({products.length})</h3>
              {products.length === 0 ? (
                <p className="text-sm py-4" style={{color:'var(--fg-s)'}}>No products</p>
              ) : (
                <div className="space-y-3">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:'var(--bg)'}}>
                      {p.image_url && (
                        <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs" style={{color:'var(--fg-s)'}}>
                          ${p.price} · {t('sales_text', {count: p.sales_count})}
                        </div>
                      </div>
                      <span className={`badge ${p.is_approved ? 'badge-free' : 'bg-yellow-500/15 text-yellow-400'}`}>
                        {p.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* دائیں کالم */}
          <div className="space-y-6">
            {/* ایکشن بٹنز */}
            <div className="rounded-2xl p-6" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
              <h3 className="font-bold mb-4">{t('admin_status')}</h3>
              <div className="space-y-3">
                {!student.is_approved_seller && !student.is_rejected && (
                  <button onClick={handleApprove} disabled={actionLoading} className="btn-p w-full py-3 flex items-center justify-center gap-2">
                    <i className="fas fa-check-circle"></i> {t('admin_approve')}
                  </button>
                )}
                {!student.is_approved_seller && (
                  <button onClick={openRejectModal} disabled={actionLoading}
                    className="w-full py-3 rounded-xl font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors disabled:opacity-50 bg-transparent cursor-pointer text-sm"
                    style={{fontFamily:'inherit'}}>
                    <i className="fas fa-times-circle mr-2"></i>{t('admin_reject')}
                  </button>
                )}
                {student.is_approved_seller && (
                  <button onClick={handleRevoke} disabled={actionLoading}
                    className="w-full py-3 rounded-xl font-semibold text-orange-400 border border-orange-400/30 hover:bg-orange-400/10 transition-colors disabled:opacity-50 bg-transparent cursor-pointer text-sm"
                    style={{fontFamily:'inherit'}}>
                    <i className="fas fa-ban mr-2"></i>{t('admin_revoke')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="rounded-xl p-3 text-center" style={{background:'var(--bg)'}}>
                  <div className="text-lg font-bold">{products.length}</div>
                  <div className="text-[10px]" style={{color:'var(--fg-s)'}}>{t('admin_products_count')}</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{background:'var(--bg)'}}>
                  <div className="text-lg font-bold">{totalSales}</div>
                  <div className="text-[10px]" style={{color:'var(--fg-s)'}}>{t('admin_sales_count')}</div>
                </div>
              </div>
            </div>

            {/* ایڈمن نوٹس */}
            <div className="rounded-2xl p-6" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
              <h3 className="font-bold mb-4">{t('admin_notes')}</h3>

              <form onSubmit={handleAddNote} className="mb-4">
                <textarea className="inp text-sm mb-2" rows={3}
                  placeholder={t('admin_note_placeholder')}
                  value={newNote} onChange={e => setNewNote(e.target.value)}>
                </textarea>
                <button type="submit" className="btn-p btn-sm w-full">
                  <i className="fas fa-plus mr-1"></i> {t('admin_add_note')}
                </button>
              </form>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{color:'var(--fg-s)'}}>No notes</p>
                ) : notes.map(n => (
                  <div key={n.id} className="rounded-xl p-3" style={{background:'var(--bg)'}}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{n.profiles?.full_name || 'Admin'}</span>
                      <span className="text-[10px]" style={{color:'var(--fg-s)'}}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm" style={{color:'var(--fg-m)'}}>{n.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* رد کرنے کا موڈل */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{background:'var(--overlay)',backdropFilter:'blur(8px)'}}
          onClick={() => setShowRejectModal(false)}>
          <div className="rounded-2xl p-6 w-full max-w-md"
            style={{background:'var(--bg-el)',border:'1px solid var(--border)'}}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{t('admin_reject')}</h3>
            <textarea className="inp mb-4" rows={4}
              placeholder={t('admin_enter_reason')}
              value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
            </textarea>
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="btn-o flex-1 py-2">
                {t('cat_all')}
              </button>
              <button onClick={handleReject} disabled={actionLoading}
                className="flex-1 py-2 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 border-none cursor-pointer"
                style={{fontFamily:'inherit'}}>
                {actionLoading ? '...' : t('admin_reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
