'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Pin } from '@/types'
import { CATEGORY_MAP } from '@/lib/categories'

interface Props {
  pin: Pin | null
  onClose: () => void
  onDeleted: () => void
}

export default function PinDetail({ pin, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isOpen = pin !== null
  const cat = pin ? CATEGORY_MAP[pin.category] : null

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Reset confirm state when pin changes
  useEffect(() => { setConfirmDelete(false); setDeleting(false) }, [pin])

  async function handleDelete() {
    if (!pin) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const { error } = await supabase.from('pins').delete().eq('id', pin.id)
    if (!error) { onDeleted() }
    setDeleting(false)
  }

  const addedDate = pin
    ? new Date(pin.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
    : ''

  const displayName = pin?.profiles?.display_name ?? 'Family member'
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  const avatarColor = cat?.color ?? '#1A5276'

  return (
    <aside
      className={`detail-card${isOpen ? ' is-open' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          right: 12, top: 12,
          width: 30, height: 30,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.9)',
          border: '1px solid #E6E2D8',
          color: '#1C1C1E',
          display: 'grid', placeItems: 'center',
          zIndex: 2,
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6 6 18"/>
        </svg>
      </button>

      {/* Hero */}
      <div style={{
        height: 130,
        background: cat
          ? `linear-gradient(160deg, ${cat.color}33 0%, ${cat.color}aa 100%)`
          : 'linear-gradient(160deg, #B7D6E8 0%, #7FA9C2 100%)',
        borderBottom: '1px solid #E6E2D8',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
      }}>
        <span style={{ fontSize: 48, lineHeight: 1, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.2))' }}>
          {cat?.emoji ?? '📍'}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 12px' }}>
        {/* Category badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#F2EFE8',
          borderRadius: 99,
          padding: '4px 10px 4px 6px',
          fontSize: 11, fontWeight: 500,
          letterSpacing: '0.04em',
          color: '#4B4B50',
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: cat?.color ?? '#1A5276',
            display: 'inline-block',
          }} />
          {cat?.label ?? '—'}
        </span>

        <h2 style={{
          fontFamily: 'var(--serif)',
          fontWeight: 600,
          fontSize: 22,
          margin: '8px 0 2px',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          color: '#1C1C1E',
        }}>
          {pin?.name ?? '—'}
        </h2>

        <p style={{ fontSize: 13, color: '#4B4B50', margin: '0 0 10px' }}>
          {pin?.address ?? ''}
        </p>

        {pin?.notes && (
          <div style={{
            fontSize: 13.5,
            lineHeight: 1.5,
            color: '#1C1C1E',
            padding: '10px 12px',
            background: '#FAF9F6',
            borderRadius: 8,
            borderLeft: '3px solid #F4C430',
          }}>
            {pin.notes}
          </div>
        )}

        {/* Meta */}
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px dashed #E6E2D8',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: '#8A8A90',
        }}>
          <div style={{
            width: 22, height: 22,
            borderRadius: '50%',
            background: avatarColor,
            display: 'grid', placeItems: 'center',
            color: '#fff',
            fontSize: 10, fontWeight: 600,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <span>
            Added by <b style={{ color: '#1C1C1E', fontWeight: 600 }}>{displayName}</b>
            {addedDate ? ` on ${addedDate}` : ''}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 8,
        padding: '12px 14px 14px',
        borderTop: '1px solid #EFEBE2',
        background: '#FAF9F6',
      }}>
        {/* Open link */}
        {pin?.link ? (
          <a
            href={pin.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              borderRadius: 10, height: 40, padding: '0 14px',
              border: 0,
              background: '#1A5276',
              color: '#fff',
              fontSize: 13, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 4h6v6"/><path d="M10 14 21 3"/><path d="M20 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/>
            </svg>
            Open link
          </a>
        ) : (
          <div style={{
            borderRadius: 10, height: 40, padding: '0 14px',
            border: '1px solid #E6E2D8',
            background: '#fff',
            color: '#8A8A90',
            fontSize: 13, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.5,
          }}>
            No link
          </div>
        )}

        {/* Directions */}
        {pin && (
          <a
            href={`https://maps.google.com/?q=${pin.lat},${pin.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Directions"
            style={{
              width: 40, height: 40,
              borderRadius: 10,
              border: '1px solid #E6E2D8',
              background: '#fff',
              display: 'grid', placeItems: 'center',
              color: '#4B4B50',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2 22 12 12 22 2 12 Z"/><circle cx="12" cy="12" r="2"/>
            </svg>
          </a>
        )}

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          title={confirmDelete ? 'Tap again to confirm' : 'Delete'}
          style={{
            width: 40, height: 40,
            borderRadius: 10,
            border: '1px solid #E6E2D8',
            background: confirmDelete ? '#E74C3C' : '#fff',
            color: confirmDelete ? '#fff' : '#E74C3C',
            display: 'grid', placeItems: 'center',
            cursor: 'pointer',
            opacity: deleting ? 0.6 : 1,
            transition: 'background .15s, color .15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
