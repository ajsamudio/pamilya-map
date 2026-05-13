'use client'

interface Preset {
  label: string
  emoji: string
  lat: number
  lng: number
  zoom: number
}

const PRESETS: Preset[] = [
  { label: 'All Philippines', emoji: '🇵🇭', lat: 12.8797, lng: 121.774,  zoom: 6  },
  { label: 'Manila',          emoji: '🏙️', lat: 14.5995, lng: 120.9842, zoom: 13 },
  { label: 'El Nido',         emoji: '🏝️', lat: 11.1784, lng: 119.3876, zoom: 12 },
  { label: 'Cebu',            emoji: '🌊', lat: 10.3157, lng: 123.8854, zoom: 12 },
  { label: 'Bohol',           emoji: '🌋', lat: 9.85,   lng: 124.143,  zoom: 11 },
  { label: 'Batanes',         emoji: '🏔️', lat: 20.448, lng: 121.971,  zoom: 11 },
]

interface Props {
  onPresetClick: (lat: number, lng: number, zoom: number) => void
}

export default function AreaPresets({ onPresetClick }: Props) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex gap-2 px-4 max-w-full overflow-x-auto no-scrollbar">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => onPresetClick(p.lat, p.lng, p.zoom)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium shadow-md transition-all active:scale-95 whitespace-nowrap"
          style={{
            backgroundColor: 'white',
            color: '#1A5276',
            border: '1px solid rgba(26,82,118,0.15)',
          }}
        >
          <span>{p.emoji}</span>
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  )
}
