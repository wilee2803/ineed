'use client'
import { useSearchParams } from 'next/navigation'

export default function BookingSuccessBanner() {
  const params = useSearchParams()
  if (params.get('booked') !== '1') return null

  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
      <span className="text-2xl">🎉</span>
      <div>
        <div className="text-green-400 font-bold text-sm">Besichtigung gebucht!</div>
        <div className="text-green-600 text-xs mt-0.5">
          Kaution vorgemerkt · Du erhältst eine Bestätigung per E-Mail
        </div>
      </div>
    </div>
  )
}
