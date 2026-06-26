'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/')
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
          <h1 className="text-2xl font-bold mb-6 urdu text-center">{t('login_title')}</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('login_email')}</label>
              <input type="email" className="inp" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1 urdu" style={{color:'var(--fg-m)'}}>{t('login_password')}</label>
              <input type="password" className="inp" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-p w-full py-3 disabled:opacity-50">
              {loading ? '...' : t('login_btn')}
            </button>
          </form>
          <p className="text-sm text-center mt-6 urdu" style={{color:'var(--fg-m)'}}>
            {t('login_no_account')} <Link href="/auth/signup" className="text-amber-400 font-semibold hover:underline">{t('nav_signup')}</Link>
          </p>
        </div>
      </div>
    </>
  )
}
