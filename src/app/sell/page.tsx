'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SellPage() {
  const { t } = useLang()
  const { user } = useAuth()
  const { show } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', name_en: '', category: '', price: 0,
    description: '', description_en: '', download_url: '',
    image_url: '', tags: ''
  })

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-32 text-center">
          <i className="fas fa-lock text-4xl mb-4" style={{color:'var(--border)'}}></i>
          <p className="urdu text-lg" style={{color:'var(--fg-m)'}}>{t('toast_login_required')}</p>
        </div>
        <Footer />
      </>
    )
  }

  function update(k: string, v: string | number) { setForm(prev => ({ ...prev, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.category || !form.name || !form.description || !form.download_url) return
    setLoading(true)

    try {
      const supabase = createClient()
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []

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
        tags
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
              <input type="number" className="inp" min={0} required value={form.price} onChange={e => update('price', parseInt(e.target.value)||0)} placeholder={t('sell_price_hint')} />
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
