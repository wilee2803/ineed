import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'

const STATUS_COLOR: Record<string, string> = {
  draft:          'bg-gray-100 text-gray-600',
  pending_review: 'bg-yellow-100 text-yellow-700',
  active:         'bg-green-100 text-green-700',
  paused:         'bg-blue-100 text-blue-700',
  rejected:       'bg-red-100 text-red-700',
  sold:           'bg-purple-100 text-purple-700',
  rented:         'bg-purple-100 text-purple-700',
}

export default async function ListerDashboard() {
  const cookieStore = await cookies()
  const t = await getTranslations('lister')
  const tStatus = await getTranslations('common.status')
  const locale = await getLocale()

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
      <header className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black tracking-tight text-white">i<span className="text-indigo-400">need</span></div>
          <span className="text-xs text-gray-500 font-medium">{t('portal')}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{profile?.full_name}</span>
          <Link href={`/${locale}/lister/listings/new`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {t('new_listing')}
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: t('stats_total'), value: listings?.length ?? 0 },
            { label: t('stats_active'), value: listings?.filter(l => l.status === 'active').length ?? 0 },
            { label: t('stats_review'), value: listings?.filter(l => l.status === 'pending_review').length ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold text-white mb-4">{t('my_listings')}</h2>

        {!listings?.length ? (
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-16 text-center">
            <div className="text-4xl mb-4">🏠</div>
            <div className="text-white font-semibold mb-2">{t('empty_title')}</div>
            <div className="text-gray-500 text-sm mb-6">{t('empty_desc')}</div>
            <Link href={`/${locale}/lister/listings/new`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors">
              {t('empty_cta')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map(l => (
              <div key={l.id} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold">{l.title}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[l.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {tStatus(l.status as any)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">{l.address_city} · {l.rooms} Zi. · {l.size_sqm} m²</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">
                    {Number(l.price).toLocaleString(locale)} €
                    {l.listing_type === 'rent' && <span className="text-gray-500 font-normal text-sm">{t('per_month')}</span>}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{new Date(l.created_at).toLocaleDateString(locale)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
