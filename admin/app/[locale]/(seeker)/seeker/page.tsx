import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'
import LogoutButton from '@/components/ui/LogoutButton'
import { Search } from 'lucide-react'

const BOOKING_COLOR: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  active:    'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
  disputed:  'bg-orange-100 text-orange-700',
  expired:   'bg-gray-100 text-gray-500',
}

export default async function SeekerDashboard() {
  const cookieStore = await cookies()
  const t = await getTranslations('seeker')
  const locale = await getLocale()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single()

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, status, created_at,
      listings ( id, title, address_city, address_street, listing_type, price ),
      viewing_slots ( start_time, end_time )
    `)
    .eq('seeker_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const upcoming = bookings?.filter(b => ['pending', 'confirmed', 'active'].includes(b.status)) ?? []
  const completed = bookings?.filter(b => b.status === 'completed') ?? []

  return (
    <div className="min-h-screen bg-[#0e0e1a]">
      <header className="border-b border-white/[0.06] px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-2xl font-black tracking-tight text-white">i<span className="text-violet-400">need</span></div>
          <span className="text-xs text-gray-500 font-medium hidden sm:block">{t('portal')}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <LocaleSwitcher />
          <span className="text-sm text-gray-400 hidden md:block">{profile?.full_name}</span>
          <LogoutButton />
        </div>
      </header>

      {/* Search CTA */}
      <div className="border-b border-white/[0.06] px-4 py-4 flex justify-center">
        <Link href={`/${locale}/seeker/search`}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold px-6 py-3 rounded-xl transition-colors text-base shadow-lg shadow-violet-900/30">
          <Search size={18} />
          {t('search_btn')}
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: t('stats_bookings'), value: bookings?.length ?? 0 },
            { label: t('stats_upcoming'), value: upcoming.length },
            { label: t('stats_completed'), value: completed.length },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold text-white mb-4">{t('my_bookings')}</h2>

        {!bookings?.length ? (
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-16 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-white font-semibold mb-2">{t('no_bookings_title')}</div>
            <div className="text-gray-500 text-sm mb-6">{t('no_bookings_desc')}</div>
            <Link href={`/${locale}/seeker/search`}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors">
              {t('no_bookings_cta')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => {
              const listing = b.listings as any
              const slot = b.viewing_slots as any
              return (
                <div key={b.id} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-semibold">{listing?.title ?? '—'}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BOOKING_COLOR[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {t(`booking_status.${b.status}` as any)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">{listing?.address_city}</div>
                    {slot?.start_time && (
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(slot.start_time).toLocaleString(locale)}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {listing && (
                      <Link href={`/${locale}/seeker/listings/${listing.id}`}
                        className="text-xs text-violet-400 hover:underline">
                        Details →
                      </Link>
                    )}
                    <div className="text-xs text-gray-600 mt-2">{new Date(b.created_at).toLocaleDateString(locale)}</div>
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
