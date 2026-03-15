'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

export interface MapListing {
  id: string
  title: string
  listing_type: string
  price: number
  address_city: string
  address_street: string
  rooms: number | null
  size_sqm: number | null
  lat: number
  lng: number
  distance_m: number
}

interface Props {
  listings: MapListing[]
  center: [number, number]   // [lng, lat]
  radiusKm: number
  onRadiusChange: (km: number) => void
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export default function ListingsMap({ listings, center, radiusKm, onRadiusChange }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  // Build popup HTML
  function popupHtml(l: MapListing) {
    const dist = l.distance_m < 1000
      ? `${Math.round(l.distance_m)} m`
      : `${(l.distance_m / 1000).toFixed(1)} km`
    return `
      <div style="min-width:200px;font-family:sans-serif">
        <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#111">${l.title}</div>
        <div style="font-size:12px;color:#666;margin-bottom:8px">${l.address_street ?? ''}, ${l.address_city} · ${dist}</div>
        <div style="font-size:16px;font-weight:800;color:#7c3aed;margin-bottom:8px">
          ${Number(l.price).toLocaleString(locale)} €${l.listing_type === 'rent' ? '<span style="font-weight:400;font-size:12px;color:#999">/Mo</span>' : ''}
        </div>
        ${l.rooms ? `<span style="font-size:11px;background:#f3f4f6;padding:2px 6px;border-radius:4px;margin-right:4px">${l.rooms} Zi.</span>` : ''}
        ${l.size_sqm ? `<span style="font-size:11px;background:#f3f4f6;padding:2px 6px;border-radius:4px">${l.size_sqm} m²</span>` : ''}
        <div style="margin-top:10px">
          <a href="/${locale}/seeker/listings/${l.id}"
            style="display:block;text-align:center;background:#7c3aed;color:#fff;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">
            Details ansehen →
          </a>
        </div>
      </div>
    `
  }

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : 12,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers when listings change
  useEffect(() => {
    if (!map.current) return

    // Remove old markers
    markers.current.forEach(m => m.remove())
    markers.current = []

    // User location marker
    const el = document.createElement('div')
    el.style.cssText = 'width:18px;height:18px;background:#7c3aed;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(124,58,237,0.3)'
    new mapboxgl.Marker(el).setLngLat(center).addTo(map.current)

    // Listing markers
    listings.forEach(l => {
      const dot = document.createElement('div')
      dot.style.cssText = `
        width:32px;height:32px;
        background:${l.listing_type === 'rent' ? '#2563eb' : '#16a34a'};
        color:#fff;font-size:10px;font-weight:700;
        border:2px solid rgba(255,255,255,0.8);border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.4)
      `
      dot.innerHTML = l.listing_type === 'rent' ? '🏠' : '🔑'

      const popup = new mapboxgl.Popup({ offset: 20, maxWidth: '260px' })
        .setHTML(popupHtml(l))

      const marker = new mapboxgl.Marker(dot)
        .setLngLat([l.lng, l.lat])
        .setPopup(popup)
        .addTo(map.current!)

      markers.current.push(marker)
    })

    // Fly to center
    map.current.flyTo({ center, zoom: radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : 12 })
  }, [listings, center])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Radius Slider */}
      <div className="absolute bottom-4 left-4 bg-[#0e0e1a]/90 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
        <div className="text-xs text-gray-400 mb-2">Umkreis: <span className="text-white font-bold">{radiusKm} km</span></div>
        <input
          type="range" min="1" max="20" step="1" value={radiusKm}
          onChange={e => onRadiusChange(Number(e.target.value))}
          className="w-32 accent-violet-500"
        />
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-[#0e0e1a]/90 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm flex gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="text-base">🏠</span><span className="text-gray-300">Miete</span></span>
        <span className="flex items-center gap-1"><span className="text-base">🔑</span><span className="text-gray-300">Kauf</span></span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-500 inline-block"></span><span className="text-gray-300">Du</span></span>
      </div>
    </div>
  )
}
