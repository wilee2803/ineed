import { supabaseAdmin } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import { CheckCircle, XCircle, Eye, MapPin, Home } from 'lucide-react'
import Link from 'next/link'
import type { Listing } from '@/lib/types'

async function getListings(status: string) {
  const q = supabaseAdmin
    .from('listings')
    .select('*, lister:profiles!lister_id(full_name, kyc_status), market:markets(name)')
    .order('created_at', { ascending: false })

  if (status !== 'all') q.eq('status', status)

  const { data } = await q.limit(50)
  return data ?? []
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'pending_review' } = await searchParams
  const listings = await getListings(status)

  const tabs = [
    { key: 'pending_review', label: 'In Prüfung' },
    { key: 'active',         label: 'Aktiv' },
    { key: 'rejected',       label: 'Abgelehnt' },
    { key: 'all',            label: 'Alle' },
  ]

  const statusVariant = (s: string): 'green' | 'yellow' | 'red' | 'grey' => {
    if (s === 'active')         return 'green'
    if (s === 'pending_review') return 'yellow'
    if (s === 'rejected')       return 'red'
    return 'grey'
  }

  const statusLabel = (s: string) => ({
    pending_review: 'In Prüfung',
    active:  'Aktiv',
    draft:   'Entwurf',
    paused:  'Pausiert',
    sold:    'Verkauft',
    rented:  'Vermietet',
    rejected:'Abgelehnt',
  }[s] ?? s)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Listing Review</h1>
        <p className="text-gray-500 text-sm mt-1">Neue Inserate prüfen und freigeben</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map(t => (
          <Link
            key={t.key}
            href={`/listings?status=${t.key}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              status === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Home size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">Keine Listings in diesem Status</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l: any) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Home size={20} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{l.title}</span>
                    <Badge variant={statusVariant(l.status)}>{statusLabel(l.status)}</Badge>
                    <Badge variant={l.listing_type === 'rent' ? 'indigo' : 'green'}>
                      {l.listing_type === 'rent' ? 'Miete' : 'Kauf'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin size={12} />
                    {l.address_street}, {l.address_city}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>💶 € {Number(l.price).toLocaleString('de-AT')}{l.listing_type === 'rent' ? '/Mo' : ''}</span>
                    {l.size_sqm && <span>📐 {l.size_sqm} m²</span>}
                    {l.rooms && <span>🚪 {l.rooms} Zimmer</span>}
                    {l.smart_lock_type && <span>🔑 {l.smart_lock_type}</span>}
                    <span className="text-indigo-500 font-medium">👤 {l.lister?.full_name}</span>
                    <span>🏙 {l.market?.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/listings/${l.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye size={13} /> Details
                  </Link>
                  {l.status === 'pending_review' && (
                    <>
                      <Link
                        href={`/listings/${l.id}?action=approve`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle size={13} /> Freigeben
                      </Link>
                      <Link
                        href={`/listings/${l.id}?action=reject`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <XCircle size={13} /> Ablehnen
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex gap-4 text-xs text-gray-400">
                <span>Erstellt: {new Date(l.created_at).toLocaleDateString('de-AT')}</span>
                <span>Aufrufe: {l.view_count}</span>
                <span>Buchungen: {l.booking_count}</span>
                <span className="font-mono text-gray-300">ID: {l.id.slice(0, 8)}…</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
