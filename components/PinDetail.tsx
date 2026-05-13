'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Pin } from '@/types'
import { CATEGORY_MAP } from '@/lib/categories'

interface Props {
  pin: Pin
  onClose: () => void
  onDeleted: () => void
}

export default function PinDetail({ pin, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cat = CATEGORY_MAP[pin.category]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    const { error } = await supabase.from('pins').delete().eq('id', pin.id)
    if (!error) {
      onDeleted()
      onClose()
    }
    setDeleting(false)
  }

  const addedDate = new Date(pin.created_at).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet" role="dialog" aria-modal="true" aria-label="Pin details">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 pt-3 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-3">
              {/* Category badge */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white mb-2"
                style={{ backgroundColor: cat?.color ?? '#888' }}
              >
                <span>{cat?.emoji}</span>
                <span>{cat?.label}</span>
              </div>
              <h2
                className="text-2xl font-bold leading-tight truncate"
                style={{ fontFamily: 'Fraunces, serif', color: '#1C1C1E' }}
              >
                {pin.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0 mt-1"
            >
              ✕
            </button>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {pin.address && (
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="mt-0.5 flex-shrink-0">📍</span>
                <span>{pin.address}</span>
              </div>
            )}

            {pin.notes && (
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="mt-0.5 flex-shrink-0">📝</span>
                <p className="whitespace-pre-wrap">{pin.notes}</p>
              </div>
            )}

            {pin.link && (
              <div className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex-shrink-0">🔗</span>
                <a
                  href={pin.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1A5276] underline underline-offset-2 break-all"
                >
                  Open link
                </a>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-100">
              <span>Added by</span>
              <span className="font-medium text-gray-500">
                {pin.profiles?.display_name ?? 'Family member'}
              </span>
              <span>·</span>
              <span>{addedDate}</span>
            </div>
          </div>

          {/* Delete */}
          <div className="mt-6">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
              style={{
                backgroundColor: confirmDelete ? '#E74C3C' : '#FEF2F2',
                color: confirmDelete ? 'white' : '#E74C3C',
              }}
            >
              {deleting
                ? 'Deleting…'
                : confirmDelete
                ? 'Tap again to confirm delete'
                : 'Delete pin'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
