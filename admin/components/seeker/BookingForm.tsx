'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Shield, Clock, MapPin } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BookingFormProps {
  clientSecret: string
  bookingId: string
  depositAmount: number
  slotLabel: string
  listingTitle: string
  listingAddress: string
}

function CheckoutForm({
  bookingId,
  depositAmount,
  slotLabel,
  listingTitle,
  listingAddress,
}: Omit<BookingFormProps, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    // Confirm the payment intent (pre-auth, not capture)
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/seeker`,
      },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Zahlung fehlgeschlagen')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'requires_capture') {
      // Notify backend to confirm booking
      const res = await fetch('/api/stripe/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentIntentId: paymentIntent.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Buchung konnte nicht bestätigt werden')
        setLoading(false)
        return
      }

      router.push(`/${locale}/seeker?booked=1`)
    } else {
      setError('Unerwarteter Zahlungsstatus. Bitte versuche es erneut.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide">Zusammenfassung</h2>
        <div className="flex items-start gap-2 text-sm text-gray-300">
          <MapPin size={15} className="text-gray-500 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-white">{listingTitle}</div>
            <div className="text-gray-400 text-xs">{listingAddress}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock size={15} className="text-gray-500 shrink-0" />
          <span>{slotLabel}</span>
        </div>
        <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield size={15} className="text-violet-400" />
            <span>Kaution (Pre-Auth)</span>
          </div>
          <span className="text-white font-bold">{depositAmount.toFixed(2)} €</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Der Betrag wird vorgemerkt, aber <strong className="text-gray-400">nicht abgebucht</strong>.
          Nach der Besichtigung wird die Kaution automatisch freigegeben — außer es wird ein Schaden gemeldet.
        </p>
      </div>

      {/* Stripe Payment Element */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Zahlungsmittel</h2>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button type="submit" disabled={!stripe || loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors">
        {loading ? 'Wird verarbeitet…' : `Kaution vormerken & Besichtigung buchen`}
      </button>

      <p className="text-center text-xs text-gray-600">
        Gesichert durch Stripe · PCI-DSS konform · Kaution wird nur bei Schaden abgebucht
      </p>
    </form>
  )
}

export default function BookingForm(props: BookingFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#1a1a2e',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
          },
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  )
}
