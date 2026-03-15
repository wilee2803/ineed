import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { slotId, listingId } = await req.json()
    if (!slotId || !listingId) {
      return NextResponse.json({ error: 'slotId and listingId required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify slot is still available
    const { data: slot } = await supabase
      .from('viewing_slots')
      .select('id, is_booked, listing_id')
      .eq('id', slotId)
      .eq('listing_id', listingId)
      .single()

    if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    if (slot.is_booked) return NextResponse.json({ error: 'Slot already booked' }, { status: 409 })

    // Get listing for deposit amount
    const { data: listing } = await supabase
      .from('listings')
      .select('title, price, listing_type')
      .eq('id', listingId)
      .single()

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    // Deposit: fixed 100 EUR for MVP (pre-authorized, not captured)
    const depositAmount = 10000 // 100.00 EUR in cents

    // Create Stripe Payment Intent with manual capture (pre-auth = Kaution)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: 'eur',
      capture_method: 'manual', // Pre-auth — nicht sofort abbuchen
      metadata: {
        slot_id: slotId,
        listing_id: listingId,
        seeker_id: user.id,
        listing_title: listing.title,
      },
      description: `Kaution: ${listing.title}`,
    })

    // Create booking record in Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        slot_id: slotId,
        seeker_id: user.id,
        listing_id: listingId,
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        deposit_amount: depositAmount / 100,
        deposit_currency: 'EUR',
      })
      .select()
      .single()

    if (bookingError) {
      // Cancel the payment intent if booking creation failed
      await stripe.paymentIntents.cancel(paymentIntent.id)
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      depositAmount: depositAmount / 100,
    })
  } catch (err: any) {
    console.error('create-payment-intent error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
