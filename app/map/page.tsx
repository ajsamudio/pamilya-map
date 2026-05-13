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

  const [legendOpen, setLegendOpen] = useState(false)
  const [sheet, setSheet] = useState<Sheet>({ type: 'none' })

  // Open legend by default on desktop
  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches) setLegendOpen(true)
  }, [])

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
    <div className="fixed inset-0">
      {/* Map — always visible */}
      <Map
        ref={mapRef}
        pins={pins}
        visibleCategories={visibleCategories}
        onPinClick={(pin) => setSheet({ type: 'pin', pin })}
        onMapClick={handleMapClick}
      />

      {/* Area presets — top center, offset from hamburger */}
      <div className="ml-16">
        <AreaPresets onPresetClick={handlePreset} />
      </div>

      {/* Legend — top left */}
      <Legend
        open={legendOpen}
        visibleCategories={visibleCategories}
        onToggle={() => setLegendOpen((o) => !o)}
        onCategoryToggle={toggleCategory}
      />

      {/* Add pin FAB — bottom center (always shown) */}
      {sheet.type === 'none' && (
        <button
          onClick={handleAddClick}
          aria-label="Add pin"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl font-light transition-transform active:scale-95"
          style={{ backgroundColor: '#1A5276', color: 'white' }}
        >
          +
        </button>
      )}

      {/* Signed-in user pill — bottom right */}
      {profile && sheet.type === 'none' && (
        <div className="fixed bottom-6 right-4 z-[500]">
          <div className="px-3 py-1.5 rounded-full bg-white shadow text-xs font-medium text-gray-500">
            {profile.display_name}
          </div>
        </div>
      )}

      {/* Sheets */}
      {sheet.type === 'auth' && (
        <AuthSheet onClose={closeSheet} />
      )}

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
