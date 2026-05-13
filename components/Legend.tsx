'use client'

import { useEffect } from 'react'
import { CATEGORIES } from '@/lib/categories'

interface Props {
  open: boolean
  visibleCategories: Set<string>
  onToggle: () => void
  onCategoryToggle: (id: string) => void
}

export default function Legend({ open, visibleCategories, onToggle, onCategoryToggle }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onToggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onToggle])

  const allVisible = CATEGORIES.every((c) => visibleCategories.has(c.id))

  return (
    <>
      {/* Floating hamburger — only visible when panel is closed */}
      {!open && (
        <button
          onClick={onToggle}
          aria-label="Open legend"
          className="fixed left-4 z-[600] flex items-center justify-center w-11 h-11 rounded-full shadow-lg transition-all active:scale-95"
          style={{ top: '50%', transform: 'translateY(-50%)', backgroundColor: '#1A5276', color: 'white' }}
        >
          <span className="text-base leading-none">☰</span>
        </button>
      )}

      {/* Floating glassmorphic panel */}
      <nav
        className={`legend-panel ${open ? 'open' : ''}`}
        aria-label="Category filter"
      >
        {/* Header with title + close button */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2
              className="text-lg font-bold leading-tight"
              style={{ fontFamily: 'Fraunces, serif', color: '#1A5276' }}
            >
              Categories
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(28,28,30,0.4)' }}>
              Tap to show / hide
            </p>
          </div>
          <button
            onClick={onToggle}
            aria-label="Close legend"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 flex-shrink-0"
            style={{ backgroundColor: 'rgba(26,82,118,0.1)', color: '#1A5276' }}
          >
            <span className="text-sm leading-none">☰</span>
          </button>
        </div>

        <ul className="px-3 pb-3 space-y-0.5">
          {CATEGORIES.map((cat) => {
            const active = visibleCategories.has(cat.id)
            return (
              <li key={cat.id}>
                <button
                  onClick={() => onCategoryToggle(cat.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left active:scale-[0.98]"
                  style={{
                    backgroundColor: active ? `${cat.color}18` : 'transparent',
                  }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: cat.color,
                      opacity: active ? 1 : 0.2,
                      boxShadow: active ? `0 0 6px ${cat.color}60` : 'none',
                    }}
                  />
                  <span className="text-base leading-none">{cat.emoji}</span>
                  <span
                    className="text-sm font-medium transition-colors"
                    style={{ color: active ? '#1C1C1E' : 'rgba(28,28,30,0.35)' }}
                  >
                    {cat.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {!allVisible && (
          <div className="px-5 pb-4 pt-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <button
              onClick={() => CATEGORIES.forEach((c) => {
                if (!visibleCategories.has(c.id)) onCategoryToggle(c.id)
              })}
              className="text-xs font-medium transition-colors"
              style={{ color: '#1A5276' }}
            >
              Show all
            </button>
          </div>
        )}
      </nav>
    </>
  )
}
