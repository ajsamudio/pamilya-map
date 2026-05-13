'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'
import { Pin } from '@/types'
import { CATEGORY_MAP } from '@/lib/categories'

export interface MapHandle {
  flyTo: (lat: number, lng: number, zoom: number) => void
}

interface Props {
  pins: Pin[]
  visibleCategories: Set<string>
  onPinClick: (pin: Pin) => void
  onMapClick: (lat: number, lng: number) => void
}

function createPinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

const Map = forwardRef<MapHandle, Props>(function Map(
  { pins, visibleCategories, onPinClick, onMapClick },
  ref
) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<globalThis.Map<string, L.Marker>>(new globalThis.Map())

  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, zoom) {
      mapRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 })
    },
  }))

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [12.8797, 121.774],
      zoom: 6,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    map.on('click', (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync pins
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const existing = markersRef.current
    const seen = new Set<string>()

    pins.forEach((pin) => {
      seen.add(pin.id)
      const cat = CATEGORY_MAP[pin.category]
      const visible = visibleCategories.has(pin.category)

      if (existing.has(pin.id)) {
        const marker = existing.get(pin.id)!
        if (visible) {
          marker.addTo(map)
        } else {
          marker.remove()
        }
      } else {
        const icon = createPinIcon(cat?.color ?? '#888')
        const marker = L.marker([pin.lat, pin.lng], { icon })
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          onPinClick(pin)
        })
        if (visible) marker.addTo(map)
        existing.set(pin.id, marker)
      }
    })

    // Remove stale markers
    existing.forEach((marker, id) => {
      if (!seen.has(id)) {
        marker.remove()
        existing.delete(id)
      }
    })
  }, [pins, visibleCategories, onPinClick])

  return <div ref={containerRef} className="w-full h-full" />
})

export default Map
