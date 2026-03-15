import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import LogoutButton from '@/components/ui/LogoutButton'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'

interface SearchParams {
  type?: string
  rooms?: string
  maxPrice?: string
  city?: string
}

export default async function SeekerSearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const cookieStore = await cookies()
  const t = await getTranslations('seeker.search')
  const tCommon = await getTranslations('common')
  const locale = await getLocale()
  const params = await searchParams

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  let query = supabase
    .from('listings')
    .select('id, title, listing_type, price, address_city, address_street, rooms, size_sqm, floor, available_from, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (params.type && params.type !== 'all') query = query.eq('listing_type', params.type)
  if (params.rooms) query = query.gte('rooms', parseFloat(params.rooms))
  if (params.maxPrice) query = query.lte('price', parseFloat(params.maxPrice))
  if (params.city) query = query.ilike('address_city', `%${params.city}%`)

  const { data: listings } = await query.limit(50)

  const inputClass = "bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"

  return (
    <div className="min-h-screen bg-[#0e0e1a]">
      <header className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/seeker`}>
            <div className="text-2xl font-black tracking-tight text-white">i<span className="text-violet-400">need</span></div>
          </Link>
          <span className="text-xs text-gray-500 font-medium">{t('title')}</span>
        </div>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Filters */}
        <form method="GET" className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 mb-8 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{t('filter_type')}</label>
            <select name="type" defaultValue={params.type ?? 'all'}
              className={`${inputClass} pr-8`}>
              <option value="all">{t('filter_all')}</option>
              <option value="rent">{t('filter_rent')}</option>
              <option value="sale">{t('filter_sale')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{t('filter_city')}</label>
            <input name="city" defaultValue={params.city ?? ''} placeholder="Wien"
              className={`${inputClass} w-32`} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{t('filter_rooms')}</label>
            <input type="number" name="rooms" defaultValue={params.rooms ?? ''} placeholder="1" min="1" step="0.5"
              className={`${inputClass} w-24`} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{t('filter_price_max')}</label>
            <input type="number" name="maxPrice" defaultValue={params.maxPrice ?? ''} placeholder="2000" min="0"
              className={`${inputClass} w-32`} />
          </div>

          <button type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
            ↵ Filter
          </button>

          {(params.type || params.rooms || params.maxPrice || params.city) && (
            <Link href={`/${locale}/seeker/search`}
              className="text-sm text-gray-500 hover:text-gray-300 py-2 px-2 transition-colors">
              × Reset
            </Link>
          )}
        </form>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{t('subtitle')}</h2>
          <span className="text-sm text-gray-500">{listings?.length ?? 0} {t('results')}</span>
        </div>

        {!listings?.length ? (
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-16 text-center">
            <div className="text-4xl mb-4">🏘️</div>
            <div className="text-gray-400 text-sm">{t('empty')}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map(l => (
              <Link key={l.id} href={`/${locale}/seeker/listings/${l.id}`}
                className="bg-white/[0.04] border border-white/[0.06] hover:border-violet-500/30 rounded-xl p-5 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate group-hover:text-violet-300 transition-colors">
                      {l.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{l.address_street}, {l.address_city}</div>
                  </div>
                  <span className={`ml-3 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    l.listing_type === 'rent' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {l.listing_type === 'rent' ? tCommon('rent') : tCommon('sale')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  {l.rooms && <span>{l.rooms} Zi.</span>}
                  {l.size_sqm && <span>{l.size_sqm} m²</span>}
                  {l.floor != null && <span>EG {l.floor}</span>}
                  {l.available_from && (
                    <span>ab {new Date(l.available_from).toLocaleDateString(locale)}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-white font-bold">
                    {Number(l.price).toLocaleString(locale)} €
                    {l.listing_type === 'rent' && <span className="text-gray-500 font-normal text-xs">{t('per_month')}</span>}
                  </div>
                  <span className="text-xs text-violet-400 group-hover:underline">{t('details')} →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
