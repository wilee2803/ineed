'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ListerRegisterPage() {
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
      options: {
        data: { full_name: form.full_name, role: 'lister' }
      }
    })

    if (err || !data.user) {
      setError(err?.message ?? 'Registrierung fehlgeschlagen')
      setLoading(false)
      return
    }

    // Profil auf lister setzen
    await supabase.from('profiles').update({ role: 'lister', phone: form.phone || null })
      .eq('id', data.user.id)

    router.push('/lister')
  }

  const inputClass = "w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5"

  return (
    <div className="min-h-screen bg-[#0e0e1a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-black tracking-tight text-white mb-1">
            i<span className="text-indigo-400">need</span>
          </div>
          <div className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Lister Registrierung</div>
        </div>

        <form onSubmit={handleRegister} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 space-y-4">
          <h1 className="text-lg font-bold text-white mb-2">Konto erstellen</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className={labelClass}>Name</label>
            <input value={form.full_name} onChange={e => set('full_name', e.target.value)}
              required placeholder="Max Mustermann" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>E-Mail</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              required placeholder="max@example.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Telefon (optional)</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+43 123 456 789" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Passwort</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              required minLength={8} placeholder="Min. 8 Zeichen" className={inputClass} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            {loading ? 'Wird registriert…' : 'Registrieren'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          Bereits registriert?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline">Einloggen</Link>
        </p>
      </div>
    </div>
  )
}
