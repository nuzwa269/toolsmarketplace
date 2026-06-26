'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SellPage() {
  const { t } = useLang()
  const { user, profile } = useAuth()
  const { show } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', name_en: '', category: '', price: 0,
    description: '', description_en: '', download_url: '',
    image_url: '', tags: ''
  })

  function update(k: string, v: string | number) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  // لاگ ان نہیں
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-32 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{background:'rgba(245,158,11,0.1)'}}>
            <i className="fas fa-lock text-3xl text-amber-400"></i>
          </div>
          <p className="urdu text-lg" style={{color:'var(--fg-m)'}}>{t('toast_login_required')}</p>
          <Link href="/auth/signup" className="btn-p inline-block mt-6">{t('nav_signup')}</Link>
        </div>
        <Footer />
      </>
    )
  }

  // ایڈمن ہے تو ہر حال میں اجازت ہے
  const isAdmin = profile?.role === 'admin'

  // سیلر نہیں ہے اور ایڈمن بھی نہیں
  if (profile && !profile.is_approved_seller && !isAdmin) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-32 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{background:'rgba(245,158,11,0.1)'}}>
            <i className="fas fa-hourglass-half text-3xl text-yellow-400"></i>
          </div>
          <h2 className="text-2xl font-bold mb-3 urdu">{t('admin_not_seller')}</h2>
          <p className="urdu mb-6" style={{color:'var(--fg-m)'}}>{t('admin_not_seller_hint')}</p>
          {profile.is_rejected && profile.reject_reason && (
            <div className="rounded-xl p-4 mb-6 text-right" style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)'}}>
              <p className="text-sm text-red-400 font-semibold mb-1">Reason:</p>
              <p className="text-sm text-red-300 urdu">{profile.reject_reason}</p>
            </div>
          )}
          <Link href="/" className="btn-o inline-block">{t('admin_contact')}</Link>
        </div>
        <Footer />
      </>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.category || !form.name || !form.description || !form.download_url) return
    setLoading(true)

    try {
      const supabase = createClient()
      const tags = form.tags ? form.tags.split(',').map(tg => tg.trim()).filter(Boolean) : []

      const { error } = await supabase.from('products').insert({
        seller_id: user.id,
        name: form.name,
        name_en: form.name_en || null,
        description: form.description,
        description_en: form.description_en || null,
        category: form.category,
        price: form.price,
        download_url: form.download_url,
        image_url: form.image_url || null,
        tags,
        is_approved: isAdmin // ایڈمن کی پروڈکٹ خود منظور
      })

      if (error) throw error
      show(t('toast_listed'), 'success')
      router.push('/dashboard')
    } catch {
      show('Error creating product', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24">
        <h1 className="text-3xl font-bold mb-8 urdu">{t('sell_title')}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('sell_name')}</label>
            <input className="inp" required value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{color:'var(--fg-m)'}}>{t('sell_name_en')}</label>
            <input className="inp" value={form.name_en} onChange={e => update('name_en', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('sell_category')}</label>
              <select className="inp" required value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="">{t('sell_select_cat')}</option>
                <option value="extension">{t('cat_labels_extension')}</option>
                <option value="app">{t('cat_labels_app')}</option>
                <option value="tool">{t('cat_labels_tool')}</option>
                <option value="website">{t('cat_labels_website')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('sell_price')}</label>
              <input type="number" className="inp" min={0} required value={form.price} onChange={e => update('price', parseInt(e.target.value) || 0)} placeholder={t('sell_price_hint')} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('sell_desc')}</label>
            <textarea className="inp" rows={4} required value={form.description} onChange={e => update('description', e.target.value)}></textarea>
          </div>
          <div>
            <label className="block text-sm mb-1" style={{color:'var(--fg-m)'}}>{t('sell_desc_en')}</label>
            <textarea className="inp" rows={4} value={form.description_en} onChange={e => update('description_en', e.target.value)}></textarea>
          </div>
          <div>
            <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('sell_link')}</label>
            <input type="url" className="inp" required value={form.download_url} onChange={e => update('download_url', e.target.value)} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('sell_image')}</label>
            <input type="url" className="inp" value={form.image_url} onChange={e => update('image_url', e.target.value)} placeholder="https://imgur.com/..." />
          </div>
          <div>
            <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('sell_tags')}</label>
            <input className="inp" value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="chrome, productivity, dark-mode" />
          </div>
          <button type="submit" disabled={loading} className="btn-p w-full py-3 text-base mt-2 disabled:opacity-50">
            <i className="fas fa-paper-plane ml-2"></i>
            {loading ? '...' : t('sell_submit')}
          </button>
        </form>
      </div>
      <Footer />
    </>
  )
}
