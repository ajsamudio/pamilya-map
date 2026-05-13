'use client'

import { useState } from 'react'

interface Preset {
  label: string
  emoji?: string
  dot?: boolean
  region: string
  lat: number
  lng: number
  zoom: number
}

const PRESETS: Preset[] = [
  { label: 'All Philippines', dot: true, region: 'all',    lat: 12.5,    lng: 122.0,   zoom: 7  },
  { label: 'Manila',          emoji: '🏙️', region: 'manila', lat: 14.5995, lng: 120.9842, zoom: 11 },
  { label: 'El Nido',         emoji: '🏝️', region: 'elnido', lat: 11.1784, lng: 119.3876, zoom: 11 },
  { label: 'Cebu',            emoji: '🌊', region: 'cebu',   lat: 10.3157, lng: 123.8854, zoom: 10 },
  { label: 'Bohol',           emoji: '🌋', region: 'bohol',  lat: 9.85,    lng: 124.143,  zoom: 10 },
  { label: 'Batanes',         emoji: '🏔️', region: 'batanes',lat: 20.448,  lng: 121.971,  zoom: 10 },
]

interface Props {
  onPresetClick: (lat: number, lng: number, zoom: number) => void
}

export default function AreaPresets({ onPresetClick }: Props) {
  const [active, setActive] = useState('all')

  return (
    <div
      className="no-scrollbar"
      style={{
        display: 'flex',
        gap: 8,
        overflow: 'hidden',
        overflowX: 'auto',
        alignItems: 'center',
        flex: 1,
      }}
    >
      {PRESETS.map((p) => {
        const isActive = active === p.region
        return (
          <button
            key={p.region}
            onClick={() => {
              setActive(p.region)
              onPresetClick(p.lat, p.lng, p.zoom)
            }}
            style={{
              flexShrink: 0,
              border: '1px solid',
              borderColor: isActive ? '#1C1C1E' : '#E6E2D8',
              background: isActive ? '#1C1C1E' : 'rgba(255,255,255,.96)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              height: 44,
              padding: '0 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              color: isActive ? '#fff' : '#4B4B50',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 6px 18px -8px rgba(20,30,45,.18), 0 2px 6px rgba(20,30,45,.05)',
              cursor: 'pointer',
              transition: 'all .12s ease',
              outline: 'none',
            }}
          >
            {p.dot && (
              <span style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: '#F4C430',
                display: 'inline-block',
              }} />
            )}
            {p.emoji && <span style={{ fontSize: 14, lineHeight: 1 }}>{p.emoji}</span>}
            <span>{p.label}</span>
          </button>
        )
      })}
    </div>
  )
}
