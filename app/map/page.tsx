'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categories'
import { Pin, Profile } from '@/types'
import type { MapHandle } from '@/components/Map'
import Legend from '@/components/Legend'
import AreaPresets from '@/components/AreaPresets'
import AddPinModal from '@/components/AddPinModal'
import PinDetail from '@/components/PinDetail'
import SetupName from '@/components/SetupName'
import AuthSheet from '@/components/AuthSheet'

// Leaflet cannot run on the server — dynamic import required
const Map = dynamic(() => import('@/components/Map'), { ssr: false })

type Sheet =
  | { type: 'none' }
  | { type: 'auth' }
  | { type: 'add'; lat?: number; lng?: number }
  | { type: 'pin'; pin: Pin }

export default function MapPage() {
  const mapRef = useRef<MapHandle>(null)

  // Auth state — resolved in background; map renders immediately
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [needsName, setNeedsName] = useState(false)

  const [pins, setPins] = useState<Pin[]>([])
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.id))
  )

  const [sheet, setSheet] = useState<Sheet>({ type: 'none' })

  // Resolve auth session in background — doesn't block map render
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)

      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (prof) {
        setProfile(prof)
      } else if (profErr?.code === 'PGRST116') {
        // Row genuinely missing — first login, ask for display name
        setNeedsName(true)
      }
      // Any other error (table missing, network, etc.) — skip silently, map still works
    })

    // Keep session in sync across tabs / after magic link
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!session) {
        setUserId(null)
        setProfile(null)
        return
      }
      setUserId(session.user.id)
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (prof) setProfile(prof)
      else if (profErr?.code === 'PGRST116') setNeedsName(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load pins — available to everyone (anon RLS policy)
  const loadPins = useCallback(async () => {
    const { data } = await supabase
      .from('pins')
      .select('*, profiles(display_name)')
      .order('created_at', { ascending: false })
    if (data) setPins(data as Pin[])
  }, [])

  useEffect(() => { loadPins() }, [loadPins])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('pins-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, () => {
        loadPins()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadPins])

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
    // Clicking the map closes any open sheet; nothing else
    if (sheet.type !== 'none') setSheet({ type: 'none' })
  }

  function handleAddClick() {
    if (!userId) {
      setSheet({ type: 'auth' })
    } else {
      setSheet({ type: 'add' })
    }
  }

  function handleNameComplete(name: string) {
    setProfile({ id: userId!, display_name: name, created_at: new Date().toISOString() })
    setNeedsName(false)
  }

  const closeSheet = () => setSheet({ type: 'none' })

  // Display name setup overlay (only after first sign-in)
  if (needsName && userId) {
    return <SetupName userId={userId} onComplete={handleNameComplete} />
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      {/* ── Card ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '80vh',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(140, 90, 20, 0.28), 0 4px 16px rgba(0,0,0,0.10)',
        border: '1.5px solid rgba(255, 220, 140, 0.55)',
      }}>

        {/* Legend — 25% */}
        <div style={{
          width: '25%',
          flexShrink: 0,
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #FFFBF0 0%, #FFF5DC 100%)',
          borderRight: '1.5px solid rgba(200, 160, 70, 0.25)',
        }}>
          <Legend
            embedded
            open={true}
            visibleCategories={visibleCategories}
            onToggle={() => {}}
            onCategoryToggle={toggleCategory}
          />
        </div>

        {/* Map — 75% */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Map
            ref={mapRef}
            pins={pins}
            visibleCategories={visibleCategories}
            onPinClick={(pin) => setSheet({ type: 'pin', pin })}
            onMapClick={handleMapClick}
          />

          <AreaPresets onPresetClick={handlePreset} />

          {sheet.type === 'none' && (
            <button
              onClick={handleAddClick}
              aria-label="Add pin"
              style={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 500,
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#1A5276',
                color: 'white',
                fontSize: 28,
                fontWeight: 300,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(26,82,118,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +
            </button>
          )}

          {profile && sheet.type === 'none' && (
            <div style={{ position: 'absolute', bottom: 24, right: 16, zIndex: 500 }}>
              <div style={{
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.92)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                fontSize: 12,
                fontWeight: 500,
                color: '#555',
              }}>
                {profile.display_name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sheets */}
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

      {sheet.type === 'pin' && (
        <PinDetail
          pin={sheet.pin}
          onClose={closeSheet}
          onDeleted={() => { loadPins(); closeSheet() }}
        />
      )}
    </div>
  )
}
