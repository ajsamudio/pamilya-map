'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { geocodeAddress } from '@/lib/geocode'
import { CATEGORIES } from '@/lib/categories'
import { Category } from '@/types'

interface Props {
  userId: string
  prefillLat?: number
  prefillLng?: number
  onClose: () => void
  onAdded: () => void
}

const EMPTY = {
  name: '',
  category: 'food' as Category,
  address: '',
  notes: '',
  link: '',
}

export default function AddPinModal({ userId, prefillLat, prefillLng, onClose, onAdded }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)

    let lat = prefillLat
    let lng = prefillLng

    if (!lat || !lng) {
      if (!form.address.trim()) {
        setError('Please enter an address or tap a location on the map.')
        setLoading(false)
        return
      }
      setGeoLoading(true)
      const geo = await geocodeAddress(form.address)
      setGeoLoading(false)
      if (!geo) {
        setError('Address not found — try a more specific address.')
        setLoading(false)
        return
      }
      lat = geo.lat
      lng = geo.lng
    }

    const { error } = await supabase.from('pins').insert({
      name: form.name.trim(),
      category: form.category,
      address: form.address.trim() || null,
      lat,
      lng,
      notes: form.notes.trim() || null,
      link: form.link.trim() || null,
      added_by: userId,
    })

    if (error) {
      setError(error.message)
    } else {
      onAdded()
      onClose()
    }
    setLoading(false)
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-base transition-colors'

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet" role="dialog" aria-modal="true" aria-label="Add a pin">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 pt-3 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'Fraunces, serif', color: '#1A5276' }}
            >
              Add a pin
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {prefillLat && prefillLng && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm flex items-center gap-2">
              <span>📍</span>
              <span>Location set from map tap</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                ref={firstRef}
                type="text"
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Jeepney ride to Intramuros"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {!prefillLat && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                  {geoLoading && (
                    <span className="ml-2 text-xs text-gray-400">Searching…</span>
                  )}
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="e.g. Bonifacio Global City, Taguig"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Anything useful for the family…"
                rows={3}
                className={inputClass + ' resize-none'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => set('link', e.target.value)}
                placeholder="https://maps.google.com/…"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || geoLoading}
              className="w-full py-4 rounded-xl font-semibold text-white text-base transition-opacity disabled:opacity-60 mt-2"
              style={{ backgroundColor: '#1A5276' }}
            >
              {loading || geoLoading ? 'Saving…' : 'Add pin 📍'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
