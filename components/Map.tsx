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
  zoomIn: () => void
  zoomOut: () => void
}

interface Props {
  pins: Pin[]
  visibleCategories: Set<string>
  onPinClick: (pin: Pin) => void
  onMapClick: (lat: number, lng: number) => void
}

function createPinIcon(color: string, emoji: string, selected = false) {
  const scale = selected ? 1.15 : 1
  const w = 40 * scale
  const h = 52 * scale
  const html = `
    <div style="
      width:${w}px;
      height:${h}px;
      filter:drop-shadow(0 4px 8px rgba(0,0,0,.30));
      transform-origin:bottom center;
    ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${w}" height="${h}"
        viewBox="0 0 40 52"
      >
        <path
          d="M20 0C9 0 0 9 0 20c0 14 20 32 20 32S40 34 40 20C40 9 31 0 20 0z"
          fill="${color}"
        />
        <path
          d="M20 0C9 0 0 9 0 20c0 14 20 32 20 32S40 34 40 20C40 9 31 0 20 0z"
          fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"
        />
        <circle cx="20" cy="19" r="14" fill="rgba(0,0,0,0.12)" />
        <circle cx="20" cy="18" r="14" fill="rgba(255,255,255,0.15)" />
        <text
          x="20" y="20"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="15"
          style="user-select:none;pointer-events:none"
        >${emoji}</text>
      </svg>
    </div>
  `
  return L.divIcon({
    className: '',
    html,
    iconSize: [40 * scale, 52 * scale],
    iconAnchor: [20 * scale, 52 * scale],
    popupAnchor: [0, -54 * scale],
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
      mapRef.current?.flyTo([lat, lng], zoom, { duration: 0.9 })
    },
    zoomIn() { mapRef.current?.zoomIn() },
    zoomOut() { mapRef.current?.zoomOut() },
  }))

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const philippinesBounds = L.latLngBounds(
      [4.2, 114.0],
      [21.5, 128.5],
    )

    const map = L.map(containerRef.current, {
      center: [12.5, 122.0],
      zoom: 7,
      minZoom: 5,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true,
      maxBounds: philippinesBounds,
      maxBoundsViscosity: 1.0,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap · © CARTO',
    }).addTo(map)

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
        if (visible) marker.addTo(map)
        else marker.remove()
      } else {
        const icon = createPinIcon(cat?.color ?? '#888', cat?.emoji ?? '📍')
        const marker = L.marker([pin.lat, pin.lng], { icon })

        const popupHtml = `
          <div class="mini-pop">
            <span class="badge">
              <span class="dot" style="background:${cat?.color ?? '#888'}"></span>
              ${cat?.label ?? pin.category}
            </span>
            <h4>${pin.name}</h4>
            <p class="addr">${pin.address ?? ''}</p>
            <button class="open-btn" onclick="window.__openPin('${pin.id}')">View details →</button>
          </div>
        `
        marker.bindPopup(popupHtml, { closeButton: false, autoPan: false })

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          onPinClick(pin)
        })
        if (visible) marker.addTo(map)
        existing.set(pin.id, marker)
      }
    })

    existing.forEach((marker, id) => {
      if (!seen.has(id)) {
        marker.remove()
        existing.delete(id)
      }
    })
  }, [pins, visibleCategories, onPinClick])

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
})

export default Map
