import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import BookingForm from '@/components/seeker/BookingForm'
import LogoutButton from '@/components/ui/LogoutButton'
import { stripe } from '@/lib/stripe'

const DEPOSIT_AMOUNT_CENTS = 10000 // 100.00 EUR

const SLOT_TYPE_LABEL: Record<string, string> = {
  physical:     '👤 Persönliche Besichtigung',
  live_camera:  '📷 Live-Kamera Besichtigung',
  self_service: '🔑 Self-Service Besichtigung',
}

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

  // Create Payment Intent directly (no internal fetch)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: DEPOSIT_AMOUNT_CENTS,
    currency: 'eur',
    capture_method: 'manual',
    metadata: {
      slot_id: slotId,
      listing_id: listingId,
      seeker_id: user.id,
      listing_title: listing.title,
    },
    description: `Kaution: ${listing.title}`,
  })

  // Create booking record
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      slot_id: slotId,
      seeker_id: user.id,
      listing_id: listingId,
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
      deposit_amount: DEPOSIT_AMOUNT_CENTS / 100,
      deposit_currency: 'EUR',
    })
    .select()
    .single()

  if (bookingError || !booking) {
    await stripe.paymentIntents.cancel(paymentIntent.id)
    return (
      <div className="min-h-screen bg-[#0e0e1a] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-white font-bold text-lg mb-2">Buchung nicht möglich</h1>
          <p className="text-gray-400 text-sm mb-6">{bookingError?.message ?? 'Unbekannter Fehler'}</p>
          <Link href={`/${locale}/seeker/listings/${listingId}`}
            className="text-violet-400 hover:underline text-sm">← Zurück zum Inserat</Link>
        </div>
      </div>
    )
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
          clientSecret={paymentIntent.client_secret!}
          bookingId={booking.id}
          depositAmount={DEPOSIT_AMOUNT_CENTS / 100}
          slotLabel={slotLabel}
          listingTitle={listing.title}
          listingAddress={`${listing.address_street}, ${listing.address_zip} ${listing.address_city}`}
        />
      </div>
    </div>
  )
}
