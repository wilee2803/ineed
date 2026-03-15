import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'

// Called after Stripe confirms the payment intent on the client side
export async function POST(req: NextRequest) {
  try {
    const { bookingId, paymentIntentId } = await req.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify payment intent status with Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (pi.status !== 'requires_capture') {
      return NextResponse.json({ error: `Unexpected payment status: ${pi.status}` }, { status: 400 })
    }

    // Update booking to confirmed
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)
      .eq('seeker_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('confirm-booking error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
