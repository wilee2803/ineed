'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

async function geocode(street: string, city: string, zip: string): Promise<{ lat: number; lng: number } | null> {
  const q = encodeURIComponent(`${street}, ${zip} ${city}`)
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
    headers: { 'User-Agent': 'ineed-app' }
  })
  const data = await res.json()
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    listing_type: 'rent',
    price: '',
    description: '',
    address_street: '',
    address_city: 'Wien',
    address_zip: '',
    address_country: 'AT',
    rooms: '',
    size_sqm: '',
    floor: '',
    available_from: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Geocode Adresse
    const coords = await geocode(form.address_street, form.address_city, form.address_zip)
    if (!coords) {
      setError('Adresse konnte nicht gefunden werden. Bitte prüfe Straße und PLZ.')
      setLoading(false)
      return
    }

    // Market Wien holen
    const { data: market } = await supabase
      .from('markets')
      .select('id')
      .eq('slug', 'wien')
      .single()

    if (!market) {
      setError('Markt nicht gefunden.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase.from('listings').insert({
      lister_id:       user!.id,
      market_id:       market.id,
      listing_type:    form.listing_type,
      title:           form.title,
      description:     form.description || null,
      price:           parseFloat(form.price),
      address_street:  form.address_street,
      address_city:    form.address_city,
      address_zip:     form.address_zip,
      address_country: form.address_country,
      location:        `SRID=4326;POINT(${coords.lng} ${coords.lat})`,
      rooms:           form.rooms ? parseFloat(form.rooms) : null,
      size_sqm:        form.size_sqm ? parseFloat(form.size_sqm) : null,
      floor:           form.floor ? parseInt(form.floor) : null,
      available_from:  form.available_from || null,
      status:          'pending_review',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/lister')
  }

  const inputClass = "w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5"

  return (
    <div className="min-h-screen bg-[#0e0e1a]">
      <header className="border-b border-white/[0.06] px-8 py-5 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition-colors">←</button>
        <div className="text-xl font-black tracking-tight text-white">
          i<span className="text-indigo-400">need</span>
        </div>
        <span className="text-sm text-gray-500">Neues Inserat</span>
      </header>

      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Inserat erstellen</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Typ */}
          <div>
            <label className={labelClass}>Art des Inserats</label>
            <div className="flex gap-3">
              {['rent', 'sale'].map(t => (
                <button key={t} type="button"
                  onClick={() => set('listing_type', t)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors ${
                    form.listing_type === t
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white/[0.04] border-white/[0.1] text-gray-400 hover:border-indigo-500'
                  }`}>
                  {t === 'rent' ? '🏠 Miete' : '🔑 Verkauf'}
                </button>
              ))}
            </div>
          </div>

          {/* Titel */}
          <div>
            <label className={labelClass}>Titel</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              required placeholder="z.B. Helle 3-Zimmer-Wohnung im 7. Bezirk"
              className={inputClass} />
          </div>

          {/* Preis */}
          <div>
            <label className={labelClass}>{form.listing_type === 'rent' ? 'Miete pro Monat (€)' : 'Kaufpreis (€)'}</label>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
              required min="1" placeholder={form.listing_type === 'rent' ? '1200' : '350000'}
              className={inputClass} />
          </div>

          {/* Adresse */}
          <div>
            <label className={labelClass}>Adresse</label>
            <div className="space-y-3">
              <input value={form.address_street} onChange={e => set('address_street', e.target.value)}
                required placeholder="Straße und Hausnummer" className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.address_zip} onChange={e => set('address_zip', e.target.value)}
                  required placeholder="PLZ" className={inputClass} />
                <input value={form.address_city} onChange={e => set('address_city', e.target.value)}
                  required placeholder="Stadt" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Zimmer</label>
              <input type="number" value={form.rooms} onChange={e => set('rooms', e.target.value)}
                placeholder="3" min="1" step="0.5" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fläche (m²)</label>
              <input type="number" value={form.size_sqm} onChange={e => set('size_sqm', e.target.value)}
                placeholder="75" min="1" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Etage</label>
              <input type="number" value={form.floor} onChange={e => set('floor', e.target.value)}
                placeholder="3" className={inputClass} />
            </div>
          </div>

          {/* Verfügbar ab */}
          <div>
            <label className={labelClass}>Verfügbar ab</label>
            <input type="date" value={form.available_from} onChange={e => set('available_from', e.target.value)}
              className={inputClass} />
          </div>

          {/* Beschreibung */}
          <div>
            <label className={labelClass}>Beschreibung</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={5} placeholder="Beschreibe die Wohnung..."
              className={`${inputClass} resize-none`} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-sm">
            {loading ? 'Wird eingereicht…' : 'Inserat zur Prüfung einreichen'}
          </button>

          <p className="text-center text-xs text-gray-600">
            Das Inserat wird nach der Admin-Prüfung veröffentlicht.
          </p>
        </form>
      </div>
    </div>
  )
}
