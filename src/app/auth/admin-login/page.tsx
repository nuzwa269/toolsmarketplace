'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function AdminLoginPage() {
  const { t } = useLang()
  const { show } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // چیک کریں کہ یوزر ایڈمن ہے یا نہیں
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()

      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut()
        show(t('admin_wrong_role'), 'error')
        return
      }

      router.push('/admin')
    } catch (err: any) {
      show(err.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-32">
        <div className="rounded-2xl p-8" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shield-alt text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold urdu">{t('admin_login_title')}</h1>
            <p className="text-sm mt-2 urdu" style={{color:'var(--fg-s)'}}>{t('admin_login_hint')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{color:'var(--fg-m)'}}>{t('login_email')}</label>
              <input type="email" className="inp" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{color:'var(--fg-m)'}}>{t('login_password')}</label>
              <input type="password" className="inp" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-p w-full py-3 disabled:opacity-50">
              {loading ? '...' : t('login_btn')}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <Link href="/auth/login" className="block text-sm text-amber-400 hover:underline">{t('nav_login')} (User)</Link>
            <Link href="/" className="block text-sm" style={{color:'var(--fg-s)'}}>
              <i className="fas fa-arrow-right ml-1"></i> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
