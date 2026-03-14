import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  draft:          { label: 'Entwurf',         color: 'bg-gray-100 text-gray-600' },
  pending_review: { label: 'In Prüfung',      color: 'bg-yellow-100 text-yellow-700' },
  active:         { label: 'Aktiv',            color: 'bg-green-100 text-green-700' },
  paused:         { label: 'Pausiert',         color: 'bg-blue-100 text-blue-700' },
  rejected:       { label: 'Abgelehnt',        color: 'bg-red-100 text-red-700' },
  sold:           { label: 'Verkauft',         color: 'bg-purple-100 text-purple-700' },
  rented:         { label: 'Vermietet',        color: 'bg-purple-100 text-purple-700' },
}

export default async function ListerDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single()
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, listing_type, price, status, address_city, rooms, size_sqm, created_at')
    .eq('lister_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0e0e1a]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black tracking-tight text-white">
            i<span className="text-indigo-400">need</span>
          </div>
          <span className="text-xs text-gray-500 font-medium">Lister Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{profile?.full_name}</span>
          <Link href="/lister/listings/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            + Neues Inserat
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Inserate gesamt', value: listings?.length ?? 0 },
            { label: 'Aktiv', value: listings?.filter(l => l.status === 'active').length ?? 0 },
            { label: 'In Prüfung', value: listings?.filter(l => l.status === 'pending_review').length ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Listings */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Meine Inserate</h2>
        </div>

        {!listings?.length ? (
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-16 text-center">
            <div className="text-4xl mb-4">🏠</div>
            <div className="text-white font-semibold mb-2">Noch keine Inserate</div>
            <div className="text-gray-500 text-sm mb-6">Erstelle dein erstes Inserat und erreiche tausende Suchende.</div>
            <Link href="/lister/listings/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors">
              Jetzt inserieren
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map(l => {
              const s = STATUS_LABEL[l.status] ?? { label: l.status, color: 'bg-gray-100 text-gray-600' }
              return (
                <div key={l.id} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-semibold">{l.title}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                      <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                        {l.listing_type === 'rent' ? 'Miete' : 'Kauf'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {l.address_city} · {l.rooms} Zi. · {l.size_sqm} m²
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {Number(l.price).toLocaleString('de-AT')} €
                      {l.listing_type === 'rent' && <span className="text-gray-500 font-normal text-sm">/Mo</span>}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(l.created_at).toLocaleDateString('de-AT')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
