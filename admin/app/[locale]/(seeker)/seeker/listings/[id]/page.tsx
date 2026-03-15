import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Camera, Globe, Video, Key } from 'lucide-react'
import LogoutButton from '@/components/ui/LogoutButton'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'

export default async function SeekerListingDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const cookieStore = await cookies()
  const t = await getTranslations('seeker.detail')
  const tCommon = await getTranslations('common')
  const locale = await getLocale()
  const { id } = await params

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!listing) notFound()

  const { data: images } = await supabase
    .from('listing_images')
    .select('id, url, is_cover, sort_order')
    .eq('listing_id', id)
    .order('sort_order', { ascending: true })

  const { data: slots } = await supabase
    .from('viewing_slots')
    .select('id, slot_type, start_time, end_time, is_booked')
    .eq('listing_id', id)
    .eq('is_booked', false)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(10)

  const SLOT_TYPE_LABEL: Record<string, string> = {
    physical: '👤 Persönlich',
    live_camera: '📷 Live-Kamera',
    self_service: '🔑 Self-Service',
  }

  return (
    <div className="min-h-screen bg-[#0e0e1a]">
      <header className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/seeker/search`}>
            <div className="text-2xl font-black tracking-tight text-white">i<span className="text-violet-400">need</span></div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-10">
        <Link href={`/${locale}/seeker/search`}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 inline-block">
          ← {t('back')}
        </Link>

        {/* Photo Gallery */}
        {images && images.length > 0 && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            {images.length === 1 ? (
              <img src={images[0].url} alt={listing.title}
                className="w-full aspect-video object-cover" />
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <img src={images[0].url} alt={listing.title}
                  className="w-full aspect-video object-cover rounded-xl col-span-2" />
                {images.slice(1, 3).map(img => (
                  <img key={img.id} src={img.url} alt=""
                    className="w-full aspect-video object-cover rounded-xl" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white flex-1">{listing.title}</h1>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full shrink-0 ${
              listing.listing_type === 'rent' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
            }`}>
              {listing.listing_type === 'rent' ? t('type_rent') : t('type_sale')}
            </span>
          </div>
          <p className="text-gray-400 text-sm">{listing.address_street}, {listing.address_zip} {listing.address_city}</p>
        </div>

        {/* Price */}
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-5 mb-6">
          <div className="text-3xl font-black text-white">
            {Number(listing.price).toLocaleString(locale)} €
            {listing.listing_type === 'rent' && <span className="text-gray-400 text-lg font-normal"> /Mo</span>}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {listing.rooms != null && (
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-white">{listing.rooms}</div>
              <div className="text-xs text-gray-500 mt-1">{t('rooms')}</div>
            </div>
          )}
          {listing.size_sqm != null && (
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-white">{listing.size_sqm}</div>
              <div className="text-xs text-gray-500 mt-1">{t('size')} m²</div>
            </div>
          )}
          {listing.floor != null && (
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-white">{listing.floor}</div>
              <div className="text-xs text-gray-500 mt-1">{t('floor')}</div>
            </div>
          )}
          {listing.available_from && (
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-sm font-bold text-white">{new Date(listing.available_from).toLocaleDateString(locale)}</div>
              <div className="text-xs text-gray-500 mt-1">{t('available')}</div>
            </div>
          )}
        </div>

        {/* Besichtigungsoptionen */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Besichtigungsoptionen</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Camera,  label: 'Fotos',     hint: 'Fotos ansehen',       active: (images?.length ?? 0) > 0 },
              { icon: Globe,   label: '360° Tour',  hint: 'Virtuell erkunden',   active: false },
              { icon: Video,   label: 'Live-Cam',   hint: 'Live-Stream',         active: listing.has_live_camera },
              { icon: Key,     label: 'Self-Tour',  hint: 'Smart Lock Zugang',   active: !!listing.smart_lock_id },
            ].map(({ icon: Icon, label, hint, active }) => (
              <div key={label}
                title={hint}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 border transition-colors cursor-default select-none ${
                  active
                    ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.03] border-white/[0.06] text-gray-600'
                }`}>
                <Icon size={22} strokeWidth={1.6} />
                <span className="text-xs font-semibold text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
          {(images?.length ?? 0) === 0 && (
            <p className="text-xs text-gray-600 mt-2 text-center">Fotos werden vom Vermieter noch hochgeladen</p>
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('description')}</h2>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {listing.description}
            </div>
          </div>
        )}

        {/* Viewing Slots */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('slots_title')}</h2>

          {!slots?.length ? (
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-8 text-center text-sm text-gray-500">
              {t('no_slots')}
            </div>
          ) : (
            <div className="space-y-2">
              {slots.map(slot => (
                <div key={slot.id} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-semibold">
                      {new Date(slot.start_time).toLocaleString(locale)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {SLOT_TYPE_LABEL[slot.slot_type] ?? slot.slot_type}
                      {' · '}
                      {Math.round((new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / 60000)} min
                    </div>
                  </div>
                  <button
                    disabled
                    title={t('book_hint')}
                    className="bg-violet-600/30 text-violet-400 text-xs font-semibold px-4 py-2 rounded-lg cursor-not-allowed opacity-60">
                    {t('book_btn')}
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600 mt-3 text-center">{t('book_hint')}</p>
        </div>
      </div>
    </div>
  )
}
