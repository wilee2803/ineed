'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'

export default function SeekerRegisterPage() {
  const t = useTranslations('seeker.register')
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: 'seeker' } }
    })

    if (err || !data.user) {
      setError(err?.message ?? t('error_generic'))
      setLoading(false)
      return
    }

    if (form.phone) {
      await supabase.from('profiles').update({ phone: form.phone }).eq('id', data.user.id)
    }

    router.push(`/${locale}/seeker`)
  }

  const inputClass = "w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5"

  return (
    <div className="min-h-screen bg-[#0e0e1a] flex items-center justify-center px-4">
      <div className="absolute top-4 right-4"><LocaleSwitcher /></div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-black tracking-tight text-white mb-1">
            i<span className="text-violet-400">need</span>
          </div>
          <div className="text-xs text-violet-400 font-bold tracking-widest uppercase">{t('title')}</div>
        </div>

        <form onSubmit={handleRegister} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 space-y-4">
          <h1 className="text-lg font-bold text-white mb-2">{t('heading')}</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>{t('name')}</label>
            <input value={form.full_name} onChange={e => set('full_name', e.target.value)}
              required placeholder={t('name_placeholder')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t('email')}</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              required placeholder="max@example.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t('phone')}</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder={t('phone_placeholder')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t('password')}</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              required minLength={8} placeholder={t('password_placeholder')} className={inputClass} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            {loading ? t('submitting') : t('submit')}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 mt-4 space-y-2">
          <p>
            {t('already_registered')}{' '}
            <Link href={`/${locale}/login`} className="text-violet-400 hover:underline">{t('sign_in')}</Link>
          </p>
          <p>
            {t('is_lister')}{' '}
            <Link href={`/${locale}/lister/register`} className="text-indigo-400 hover:underline">{t('register_as_lister')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
