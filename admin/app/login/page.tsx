'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err || !data.user) {
      setError(err?.message ?? 'Login fehlgeschlagen')
      setLoading(false)
      return
    }

    // Rolle prüfen
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Kein Admin-Zugang.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#0e0e1a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-black tracking-tight text-white mb-1">
            i<span className="text-indigo-400">need</span>
          </div>
          <div className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Admin Panel</div>
        </div>

        <form onSubmit={handleLogin} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 space-y-4">
          <h1 className="text-lg font-bold text-white mb-6">Anmelden</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              E-Mail
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="admin@ineed.app"
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Passwort
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            {loading ? 'Wird angemeldet…' : 'Einloggen'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          🔒 Zugang nur für autorisierte Administratoren
        </p>
      </div>
    </div>
  )
}
