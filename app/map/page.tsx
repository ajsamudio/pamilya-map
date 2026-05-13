'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categories'
import { SEED_PINS } from '@/lib/seeds'
import { Pin, Profile } from '@/types'
import type { MapHandle } from '@/components/Map'
import Legend from '@/components/Legend'
import AreaPresets from '@/components/AreaPresets'
import AddPinModal from '@/components/AddPinModal'
import PinDetail from '@/components/PinDetail'
import SetupName from '@/components/SetupName'
import AuthSheet from '@/components/AuthSheet'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

type Sheet =
  | { type: 'none' }
  | { type: 'auth' }
  | { type: 'add'; lat?: number; lng?: number }
  | { type: 'pin'; pin: Pin }

export default function MapPage() {
  const mapRef = useRef<MapHandle>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [needsName, setNeedsName] = useState(false)

  const [pins, setPins] = useState<Pin[]>([])
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.id))
  )

  const [sheet, setSheet] = useState<Sheet>({ type: 'none' })
  const [legendOpen, setLegendOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)
      const { data: prof, error: profErr } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) setProfile(prof)
      else if (profErr?.code === 'PGRST116') setNeedsName(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!session) { setUserId(null); setProfile(null); return }
      setUserId(session.user.id)
      const { data: prof, error: profErr } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) setProfile(prof)
      else if (profErr?.code === 'PGRST116') setNeedsName(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadPins = useCallback(async () => {
    const { data } = await supabase
      .from('pins').select('*, profiles(display_name)').order('created_at', { ascending: false })
    if (data) setPins(data as Pin[])
  }, [])

  useEffect(() => { loadPins() }, [loadPins])

  useEffect(() => {
    const channel = supabase
      .channel('pins-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, () => loadPins())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadPins])

  // Merge DB pins with seed pins (seed IDs start with "seed-" so no collision)
  const allPins = useMemo(() => {
    const dbIds = new Set(pins.map((p) => p.id))
    const seedsToShow = SEED_PINS.filter((s) => !dbIds.has(s.id))
    return [...pins, ...seedsToShow]
  }, [pins])

  const pinCounts = useMemo(() => {
    const c: Record<string, number> = {}
    allPins.forEach((p) => { c[p.category] = (c[p.category] ?? 0) + 1 })
    return c
  }, [allPins])

  function toggleCategory(id: string) {
    setVisibleCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handlePreset(lat: number, lng: number, zoom: number) {
    mapRef.current?.flyTo(lat, lng, zoom)
  }

  function handleMapClick(_lat: number, _lng: number) {
    if (sheet.type !== 'none') setSheet({ type: 'none' })
    if (legendOpen) setLegendOpen(false)
  }

  function handleAddClick() {
    if (!userId) setSheet({ type: 'auth' })
    else setSheet({ type: 'add' })
  }

  function handleNameComplete(name: string) {
    setProfile({ id: userId!, display_name: name, created_at: new Date().toISOString() })
    setNeedsName(false)
  }

  const closeSheet = () => setSheet({ type: 'none' })

  if (needsName && userId) {
    return <SetupName userId={userId} onComplete={handleNameComplete} />
  }

  const selectedPin = sheet.type === 'pin' ? sheet.pin : null

  return (
    <div className="app">

      {/* ── Legend sidebar (desktop) ── */}
      <aside className="legend-card">
        <Legend
          embedded
          open={true}
          visibleCategories={visibleCategories}
          pinCounts={pinCounts}
          totalPins={allPins.length}
          pins={allPins}
          onToggle={() => {}}
          onCategoryToggle={toggleCategory}
          onPinSelect={(pin) => setSheet({ type: 'pin', pin })}
        />
      </aside>

      {/* ── Map stage ── */}
      <section className="map-card">
        <Map
          ref={mapRef}
          pins={allPins}
          visibleCategories={visibleCategories}
          onPinClick={(pin) => setSheet({ type: 'pin', pin })}
          onMapClick={handleMapClick}
        />

        {/* Top bar: search + area presets */}
        <div style={{
          position: 'absolute',
          top: 16, left: 16, right: 16,
          zIndex: 600,
          display: 'flex',
          gap: 12,
          pointerEvents: 'none',
        }}>
          {/* Search */}
          <label style={{
            flex: '0 1 320px',
            background: 'rgba(255,255,255,.96)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid #E6E2D8',
            borderRadius: 999,
            padding: '0 14px',
            height: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 6px 18px -8px rgba(20,30,45,.18), 0 2px 6px rgba(20,30,45,.05)',
            pointerEvents: 'auto',
            cursor: 'text',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A90" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
            <input
              type="text"
              placeholder="Search address or place…"
              style={{
                border: 0, background: 'transparent', outline: 0,
                flex: 1, fontSize: 14, color: '#1C1C1E',
              }}
            />
            <kbd style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: '#8A8A90',
              border: '1px solid #E6E2D8',
              padding: '2px 6px',
              borderRadius: 4,
              background: '#FAF9F6',
            }}>⌘K</kbd>
          </label>

          {/* Preset pills */}
          <div style={{ flex: 1, pointerEvents: 'auto', minWidth: 0 }}>
            <AreaPresets onPresetClick={handlePreset} />
          </div>
        </div>

        {/* Status chip — top right */}
        <div style={{
          position: 'absolute',
          right: 16, top: 16,
          zIndex: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          height: 44,
          padding: '0 14px',
          background: 'rgba(255,255,255,.96)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid #E6E2D8',
          borderRadius: 999,
          boxShadow: '0 6px 18px -8px rgba(20,30,45,.18), 0 2px 6px rgba(20,30,45,.05)',
          fontSize: 13,
          color: '#4B4B50',
        }}>
          <span style={{
            width: 8, height: 8,
            background: '#27AE60',
            borderRadius: '50%',
            boxShadow: '0 0 0 4px rgba(39,174,96,.18)',
            display: 'inline-block',
          }} />
          <span>
            <b style={{ color: '#1C1C1E', fontWeight: 600 }}>Live</b>
            {profile ? ` · ${profile.display_name}` : ' · family map'}
          </span>
        </div>

        {/* Compass — below status */}
        <div style={{
          position: 'absolute',
          right: 16, top: 76,
          zIndex: 600,
          width: 44, height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.96)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid #E6E2D8',
          boxShadow: '0 6px 18px -8px rgba(20,30,45,.18), 0 2px 6px rgba(20,30,45,.05)',
          display: 'grid', placeItems: 'center',
        }} title="North">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#8A8A90" strokeWidth="1"/>
            <path d="M12 4 L14 12 L12 14 L10 12 Z" fill="#1A5276"/>
            <path d="M12 20 L14 12 L12 10 L10 12 Z" fill="#E6E2D8"/>
          </svg>
        </div>

        {/* Custom zoom — bottom right */}
        <div style={{
          position: 'absolute',
          right: 16, bottom: 24,
          zIndex: 600,
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          border: '1px solid #E6E2D8',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 6px 18px -8px rgba(20,30,45,.18), 0 2px 6px rgba(20,30,45,.05)',
        }}>
          <button
            onClick={() => mapRef.current?.zoomIn()}
            aria-label="Zoom in"
            style={{
              width: 40, height: 40, border: 0,
              background: 'transparent',
              display: 'grid', placeItems: 'center',
              color: '#1C1C1E',
              borderBottom: '1px solid #EFEBE2',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F2EFE8')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            aria-label="Zoom out"
            style={{
              width: 40, height: 40, border: 0,
              background: 'transparent',
              display: 'grid', placeItems: 'center',
              color: '#1C1C1E',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F2EFE8')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14"/>
            </svg>
          </button>
        </div>

        {/* Add pin FAB — bottom left */}
        <button
          onClick={handleAddClick}
          aria-label="Add pin"
          style={{
            position: 'absolute',
            left: 24, bottom: 24,
            zIndex: 700,
            height: 56,
            padding: '0 22px 0 18px',
            borderRadius: 999,
            background: '#1A5276',
            color: '#fff',
            border: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '0.01em',
            boxShadow: '0 12px 28px -10px rgba(26,82,118,.55), 0 4px 10px -4px rgba(20,30,45,.25), inset 0 -2px 0 rgba(0,0,0,.18)',
            cursor: 'pointer',
            transition: 'transform .12s ease, box-shadow .12s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: '#F4C430',
            color: '#15435F',
            display: 'grid', placeItems: 'center',
            fontSize: 18, fontWeight: 700,
            marginLeft: -4,
          }}>+</span>
          Add a pin
        </button>

        {/* Pin detail slide-in card */}
        <PinDetail
          pin={selectedPin}
          onClose={closeSheet}
          onDeleted={() => { loadPins(); closeSheet() }}
        />

        {/* Mobile legend overlay */}
        <div className="legend-mobile-container">
          <Legend
            open={legendOpen}
            onToggle={() => setLegendOpen((v) => !v)}
            visibleCategories={visibleCategories}
            pinCounts={pinCounts}
            totalPins={allPins.length}
            pins={allPins}
            onCategoryToggle={toggleCategory}
            onPinSelect={(pin) => { setSheet({ type: 'pin', pin }); setLegendOpen(false) }}
          />
        </div>
      </section>

      {/* Sheets rendered over everything */}
      {sheet.type === 'auth' && <AuthSheet onClose={closeSheet} />}

      {sheet.type === 'add' && userId && (
        <AddPinModal
          userId={userId}
          prefillLat={sheet.lat}
          prefillLng={sheet.lng}
          onClose={closeSheet}
          onAdded={loadPins}
        />
      )}
    </div>
  )
}
