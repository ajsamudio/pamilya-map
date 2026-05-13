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
  category: 'tourist' as Category,
  address: '',
  notes: '',
  link: '',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#FAF9F6',
  border: '1px solid #E6E2D8',
  borderRadius: 10,
  padding: '11px 12px',
  fontSize: 14,
  outline: 0,
  transition: 'border-color .12s, background .12s, box-shadow .12s',
  color: '#1C1C1E',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#8A8A90',
  marginBottom: 6,
}

export default function AddPinModal({ userId, prefillLat, prefillLng, onClose, onAdded }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoOk, setGeoOk] = useState(false)
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
    if (key === 'address') setGeoOk(false)
  }

  async function submit() {
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)

    let lat = prefillLat
    let lng = prefillLng

    if (!lat || !lng) {
      if (!form.address.trim()) {
        setError('Please enter an address.')
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
      setGeoOk(true)
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit()
  }

  function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.target.style.background = '#fff'
    e.target.style.borderColor = '#1A5276'
    e.target.style.boxShadow = '0 0 0 3px rgba(26,82,118,.12)'
  }
  function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.target.style.background = '#FAF9F6'
    e.target.style.borderColor = '#E6E2D8'
    e.target.style.boxShadow = 'none'
  }

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Add a pin"
        style={{ maxWidth: 560, left: '50%', transform: 'translateX(-50%)', borderRadius: 22 }}
      >
        {/* Grab handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: '#E6E2D8' }} />
        </div>

        <header style={{
          padding: '8px 22px 12px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 22, fontWeight: 600,
            letterSpacing: '-0.01em',
            margin: 0, color: '#1C1C1E',
          }}>
            Add a <em style={{ fontStyle: 'italic', color: '#1A5276', fontWeight: 500 }}>pin</em>
          </h2>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8A8A90' }}>
            describe · save
          </span>
        </header>

        <form onSubmit={handleSubmit} style={{ padding: '4px 22px 14px', display: 'grid', gap: 14 }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Name</label>
            <input
              ref={firstRef}
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Las Cabanas sunset spot"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Category picker */}
          <div>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CATEGORIES.map((c) => {
                const checked = form.category === c.id
                return (
                  <label
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 10px',
                      border: `1px solid ${checked ? '#1A5276' : '#E6E2D8'}`,
                      borderRadius: 10,
                      background: checked ? '#E5EEF4' : '#fff',
                      cursor: 'pointer',
                      fontSize: 13, fontWeight: 500,
                      transition: 'all .12s',
                      color: '#1C1C1E',
                    }}
                  >
                    <span style={{
                      width: 18, height: 18,
                      borderRadius: 5,
                      background: c.color,
                      display: 'grid', placeItems: 'center',
                      fontSize: 10, color: '#fff',
                      flexShrink: 0,
                    }}>
                      {c.emoji}
                    </span>
                    {c.label.split(' / ')[0]}
                    <input
                      type="radio"
                      name="category"
                      value={c.id}
                      checked={checked}
                      onChange={() => set('category', c.id)}
                      style={{ display: 'none' }}
                    />
                  </label>
                )
              })}
            </div>
          </div>

          {/* Address */}
          {!prefillLat && (
            <div>
              <label style={labelStyle}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="e.g. Bacuit Bay, El Nido, Palawan"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
              {(geoOk || geoLoading) && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginTop: 6,
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: '#8A8A90',
                }}>
                  {geoLoading
                    ? <><span>⏳</span> Geocoding…</>
                    : <><span style={{ color: '#27AE60' }}>●</span> Location resolved · via Nominatim</>
                  }
                </div>
              )}
            </div>
          )}

          {prefillLat && (
            <div style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: '#E5EEF4',
              border: '1px solid #1A5276',
              fontSize: 13,
              color: '#1A5276',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>📍</span> Location set from map tap
            </div>
          )}

          {/* Link + Added by row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>
                Link <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#8A8A90' }}>(optional)</span>
              </label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => set('link', e.target.value)}
                placeholder="maps.google.com / tripadvisor.com"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Added by</label>
              <input
                type="text"
                value="Family member"
                readOnly
                style={{ ...inputStyle, opacity: 0.7 }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>
              Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#8A8A90' }}>(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Why this spot? Best time? Reservations?"
              rows={3}
              style={{ ...inputStyle, minHeight: 64, resize: 'vertical', lineHeight: 1.5 }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {error && (
            <p style={{
              fontSize: 13, color: '#E74C3C',
              background: '#FEF2F2',
              padding: '10px 12px', borderRadius: 8, margin: 0,
            }}>
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div style={{
          padding: '12px 22px 18px',
          background: '#FAF9F6',
          borderTop: '1px solid #EFEBE2',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 10,
          alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8A8A90' }}>
            Press ⏎ to save · Esc to close
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                borderRadius: 10, height: 40, padding: '0 14px',
                border: '1px solid #E6E2D8',
                background: 'transparent',
                fontSize: 13, fontWeight: 500,
                color: '#4B4B50',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading || geoLoading}
              style={{
                borderRadius: 10, height: 40, padding: '0 18px',
                border: 0,
                background: '#1A5276',
                color: '#fff',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
                opacity: (loading || geoLoading) ? 0.6 : 1,
                transition: 'opacity .12s',
              }}
            >
              {loading || geoLoading ? 'Saving…' : 'Save pin'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
