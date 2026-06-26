'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function SignupPage() {
  const { t } = useLang()
  const { show } = useToast()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', university: '' })
  const [loading, setLoading] = useState(false)

  function update(k: string, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } }
      })
      if (error) throw error

      // پروفائل اپڈیٹ (یونیورسٹی)
      if (form.university) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await supabase.from('profiles').update({ university: form.university }).eq('id', user.id)
      }

      show('Account created!', 'success')
      router.push('/')
    } catch (err: any) {
      show(err.message || 'Signup failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-32">
        <div className="rounded-2xl p-8" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
          <h1 className="text-2xl font-bold mb-6 urdu text-center">{t('signup_title')}</h1>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('signup_name')}</label>
              <input className="inp" required value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('signup_university')}</label>
              <input className="inp" value={form.university} onChange={e => update('university', e.target.value)} placeholder="FAST NUCES" />
            </div>
            <div>
              <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('login_email')}</label>
              <input type="email" className="inp" required value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('login_password')}</label>
              <input type="password" className="inp" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-p w-full py-3 disabled:opacity-50">
              {loading ? '...' : t('signup_btn')}
            </button>
          </form>
          <p className="text-sm text-center mt-6 urdu" style={{color:'var(--fg-m)'}}>
            {t('signup_has_account')} <Link href="/auth/login" className="text-amber-400 font-semibold hover:underline">{t('nav_login')}</Link>
          </p>
        </div>
      </div>
    </>
  )
}
