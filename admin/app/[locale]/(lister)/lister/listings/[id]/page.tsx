import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'
import LogoutButton from '@/components/ui/LogoutButton'
import PhotoManager from '@/components/lister/PhotoManager'
import SlotManager from '@/components/lister/SlotManager'

const STATUS_COLOR: Record<string, string> = {
  draft:          'bg-gray-500/10 text-gray-400',
  pending_review: 'bg-yellow-500/10 text-yellow-400',
  active:         'bg-green-500/10 text-green-400',
  paused:         'bg-blue-500/10 text-blue-400',
  rejected:       'bg-red-500/10 text-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Entwurf', pending_review: 'In Prüfung', active: 'Aktiv',
  paused: 'Pausiert', rejected: 'Abgelehnt', sold: 'Verkauft', rented: 'Vermietet',
}

export default async function ListerListingManagePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const cookieStore = await cookies()
  const locale = await getLocale()
  const { id } = await params

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('lister_id', user!.id)
    .single()

  if (!listing) notFound()

  const { data: images } = await supabase
    .from('listing_images')
    .select('id, url, storage_path, is_cover, sort_order')
    .eq('listing_id', id)
    .order('sort_order', { ascending: true })

  const { data: slots } = await supabase
    .from('viewing_slots')
    .select('id, slot_type, start_time, end_time, is_booked')
    .eq('listing_id', id)
    .order('start_time', { ascending: true })

  return (
    <div className="min-h-screen bg-[#0e0e1a]">
      <header className="border-b border-white/[0.06] px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/lister`}>
            <div className="text-2xl font-black tracking-tight text-white">i<span className="text-indigo-400">need</span></div>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <LocaleSwitcher />
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <Link href={`/${locale}/lister`}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 inline-block">
          ← Meine Inserate
        </Link>

        {/* Listing Info */}
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 mb-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{listing.title}</h1>
              <p className="text-sm text-gray-400">{listing.address_street}, {listing.address_zip} {listing.address_city}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[listing.status] ?? 'bg-gray-500/10 text-gray-400'}`}>
              {STATUS_LABEL[listing.status] ?? listing.status}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-400">
            <span className="font-bold text-white">
              {Number(listing.price).toLocaleString(locale)} €
              {listing.listing_type === 'rent' && <span className="text-gray-500 font-normal"> /Mo</span>}
            </span>
            {listing.rooms != null && <span>{listing.rooms} Zi.</span>}
            {listing.size_sqm != null && <span>{listing.size_sqm} m²</span>}
            {listing.floor != null && <span>EG+{listing.floor}</span>}
          </div>
          {listing.status === 'rejected' && listing.rejected_reason && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              <span className="font-semibold">Abgelehnt:</span> {listing.rejected_reason}
            </div>
          )}
        </div>

        {/* Photos */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Fotos</h2>
            <p className="text-xs text-gray-500 mt-0.5">Bis zu 10 Fotos. Das erste Foto wird als Cover verwendet.</p>
          </div>
          <PhotoManager listingId={id} initialPhotos={images ?? []} />
        </section>

        <div className="border-t border-white/[0.06] mb-10" />

        {/* Viewing Slots */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Besichtigungstermine</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Lege Zeitfenster fest, in denen Interessenten die Wohnung besichtigen können.
            </p>
          </div>
          <SlotManager listingId={id} initialSlots={slots ?? []} />
        </section>
      </div>
    </div>
  )
}
