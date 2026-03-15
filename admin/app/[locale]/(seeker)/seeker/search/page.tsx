'use client'
import { useState, useCallback, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import LogoutButton from '@/components/ui/LogoutButton'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'
import type { MapListing } from '@/components/ui/ListingsMap'

// Mapbox nur client-side laden (kein SSR)
const ListingsMap = dynamic(() => import('@/components/ui/ListingsMap'), { ssr: false })

// Wien Stadtmitte als Fallback
const WIEN_DEFAULT: [number, number] = [16.3738, 48.2082]

type ViewMode = 'map' | 'list'

export default function SeekerSearchPage() {
  const locale = useLocale()
  const t = useTranslations('seeker.search')
  const tCommon = useTranslations('common')

  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [listings, setListings] = useState<MapListing[]>([])
  const [center, setCenter] = useState<[number, number]>(WIEN_DEFAULT)
  const [radiusKm, setRadiusKm] = useState(5)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')
  const [loading, setLoading] = useState(false)

  // Filter state
  const [filterType, setFilterType] = useState('all')
  const [filterRooms, setFilterRooms] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')

  const fetchListings = useCallback(async (lng: number, lat: number, km: number) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('listings_near_point', {
      lat, lng, radius_km: km
    })
    setLoading(false)
    if (error || !data) return

    let results = data as MapListing[]
    if (filterType !== 'all') results = results.filter(l => l.listing_type === filterType)
    if (filterRooms) results = results.filter(l => l.rooms != null && l.rooms >= parseFloat(filterRooms))
    if (filterMaxPrice) results = results.filter(l => l.price <= parseFloat(filterMaxPrice))
    setListings(results)
  }, [filterType, filterRooms, filterMaxPrice])

  // Auto-Geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      fetchListings(center[0], center[1], radiusKm)
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const newCenter: [number, number] = [pos.coords.longitude, pos.coords.latitude]
        setCenter(newCenter)
        setLocating(false)
        fetchListings(newCenter[0], newCenter[1], radiusKm)
      },
      () => {
        // Fallback: Wien
        setLocating(false)
        fetchListings(center[0], center[1], radiusKm)
      },
      { timeout: 8000 }
    )
  }, [])

  function locateMe() {
    if (!navigator.geolocation) { setLocError('Geolocation nicht verfügbar'); return }
    setLocating(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const newCenter: [number, number] = [pos.coords.longitude, pos.coords.latitude]
        setCenter(newCenter)
        setLocating(false)
        fetchListings(newCenter[0], newCenter[1], radiusKm)
      },
      () => {
        setLocError('Standort konnte nicht ermittelt werden')
        setLocating(false)
      },
      { timeout: 10000 }
    )
  }

  function handleRadiusChange(km: number) {
    setRadiusKm(km)
    fetchListings(center[0], center[1], km)
  }

  function applyFilters() {
    fetchListings(center[0], center[1], radiusKm)
  }

  const inputClass = "bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"

  return (
    <div className="h-screen flex flex-col bg-[#0e0e1a]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/seeker`}>
            <div className="text-2xl font-black tracking-tight text-white">i<span className="text-violet-400">need</span></div>
          </Link>
          <span className="text-xs text-gray-500 font-medium hidden sm:block">{t('title')}</span>
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <LogoutButton />
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-white/[0.06] px-6 py-3 flex flex-wrap items-center gap-3 shrink-0">
        {/* Standort Button */}
        <button onClick={locateMe} disabled={locating}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          {locating ? (
            <span className="animate-spin text-base">⟳</span>
          ) : (
            <span>📍</span>
          )}
          {locating ? 'Wird ermittelt…' : 'Mein Standort'}
        </button>

        {locError && <span className="text-xs text-red-400">{locError}</span>}

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Filters */}
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className={`${inputClass} pr-8`}>
          <option value="all">{t('filter_all')}</option>
          <option value="rent">{t('filter_rent')}</option>
          <option value="sale">{t('filter_sale')}</option>
        </select>

        <input type="number" value={filterRooms} onChange={e => setFilterRooms(e.target.value)}
          placeholder={t('filter_rooms')} min="1" step="0.5"
          className={`${inputClass} w-36`} />

        <input type="number" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)}
          placeholder={t('filter_price_max')} min="0"
          className={`${inputClass} w-36`} />

        <button onClick={applyFilters}
          className="bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          Filter anwenden
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* Results count */}
          {loading ? (
            <span className="text-xs text-gray-500">Lädt…</span>
          ) : (
            <span className="text-xs text-gray-500">{listings.length} {t('results')}</span>
          )}

          {/* View toggle */}
          <div className="flex bg-white/[0.06] border border-white/10 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('map')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'map' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              🗺️ Karte
            </button>
            <button onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              ☰ Liste
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'map' ? (
          <div className="h-full p-4">
            <ListingsMap
              listings={listings}
              center={center}
              radiusKm={radiusKm}
              onRadiusChange={handleRadiusChange}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-6 py-4">
            {!listings.length ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-4xl mb-4">🏘️</div>
                <div className="text-gray-400 text-sm">{t('empty')}</div>
                <button onClick={locateMe}
                  className="mt-4 text-sm text-violet-400 hover:underline">
                  📍 Standort ermitteln
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {listings.map(l => {
                  const dist = l.distance_m < 1000
                    ? `${Math.round(l.distance_m)} m`
                    : `${(l.distance_m / 1000).toFixed(1)} km`
                  return (
                    <Link key={l.id} href={`/${locale}/seeker/listings/${l.id}`}
                      className="bg-white/[0.04] border border-white/[0.06] hover:border-violet-500/30 rounded-xl p-5 transition-colors group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold text-sm truncate group-hover:text-violet-300 transition-colors">
                            {l.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{l.address_street}, {l.address_city}</div>
                        </div>
                        <span className={`ml-3 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          l.listing_type === 'rent' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                        }`}>
                          {l.listing_type === 'rent' ? tCommon('rent') : tCommon('sale')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        {l.rooms && <span>{l.rooms} Zi.</span>}
                        {l.size_sqm && <span>{l.size_sqm} m²</span>}
                        <span className="text-violet-500/70">{dist}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-white font-bold">
                          {Number(l.price).toLocaleString(locale)} €
                          {l.listing_type === 'rent' && <span className="text-gray-500 font-normal text-xs">{t('per_month')}</span>}
                        </div>
                        <span className="text-xs text-violet-400 group-hover:underline">{t('details')} →</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
