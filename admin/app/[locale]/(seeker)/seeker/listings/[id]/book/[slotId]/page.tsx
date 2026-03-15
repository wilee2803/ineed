import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import BookingForm from '@/components/seeker/BookingForm'
import LogoutButton from '@/components/ui/LogoutButton'

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string; slotId: string; locale: string }>
}) {
  const cookieStore = await cookies()
  const locale = await getLocale()
  const { id: listingId, slotId } = await params

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // Check if slot is still available
  const { data: slot } = await supabase
    .from('viewing_slots')
    .select('id, slot_type, start_time, end_time, is_booked, listing_id')
    .eq('id', slotId)
    .eq('listing_id', listingId)
    .single()

  if (!slot || slot.is_booked) notFound()

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, address_street, address_zip, address_city, listing_type, price')
    .eq('id', listingId)
    .eq('status', 'active')
    .single()

  if (!listing) notFound()

  // Create Payment Intent server-side
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieStore.toString() },
    body: JSON.stringify({ slotId, listingId }),
  })

  if (!res.ok) {
    const err = await res.json()
    return (
      <div className="min-h-screen bg-[#0e0e1a] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-white font-bold text-lg mb-2">Buchung nicht möglich</h1>
          <p className="text-gray-400 text-sm mb-6">{err.error ?? 'Unbekannter Fehler'}</p>
          <Link href={`/${locale}/seeker/listings/${listingId}`}
            className="text-violet-400 hover:underline text-sm">← Zurück zum Inserat</Link>
        </div>
      </div>
    )
  }

  const { clientSecret, bookingId, depositAmount } = await res.json()

  const SLOT_TYPE_LABEL: Record<string, string> = {
    physical:    '👤 Persönliche Besichtigung',
    live_camera: '📷 Live-Kamera Besichtigung',
    self_service:'🔑 Self-Service Besichtigung',
  }

  const slotLabel = `${SLOT_TYPE_LABEL[slot.slot_type] ?? slot.slot_type} · ${
    new Date(slot.start_time).toLocaleString('de-AT', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }`

  return (
    <div className="min-h-screen bg-[#0e0e1a]">
      <header className="border-b border-white/[0.06] px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href={`/${locale}/seeker/listings/${listingId}`}>
          <div className="text-2xl font-black tracking-tight text-white">
            i<span className="text-violet-400">need</span>
          </div>
        </Link>
        <LogoutButton />
      </header>

      <div className="max-w-lg mx-auto px-4 sm:px-8 py-10">
        <Link href={`/${locale}/seeker/listings/${listingId}`}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 inline-block">
          ← Zurück zum Inserat
        </Link>

        <h1 className="text-2xl font-black text-white mb-8">Besichtigung buchen</h1>

        <BookingForm
          clientSecret={clientSecret}
          bookingId={bookingId}
          depositAmount={depositAmount}
          slotLabel={slotLabel}
          listingTitle={listing.title}
          listingAddress={`${listing.address_street}, ${listing.address_zip} ${listing.address_city}`}
        />
      </div>
    </div>
  )
}
