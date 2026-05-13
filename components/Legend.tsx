'use client'

import { useEffect, useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { Pin } from '@/types'

interface Props {
  open: boolean
  visibleCategories: Set<string>
  pinCounts?: Record<string, number>
  totalPins?: number
  pins?: Pin[]
  onToggle: () => void
  onCategoryToggle: (id: string) => void
  onPinSelect?: (pin: Pin) => void
  embedded?: boolean
}

function CategoryList({
  visibleCategories,
  pinCounts = {},
  pins = [],
  onCategoryToggle,
  onPinSelect,
}: {
  visibleCategories: Set<string>
  pinCounts?: Record<string, number>
  pins?: Pin[]
  onCategoryToggle: (id: string) => void
  onPinSelect?: (pin: Pin) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div style={{ padding: '4px 12px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {CATEGORIES.map((cat) => {
        const active = visibleCategories.has(cat.id)
        const isExpanded = expanded === cat.id
        const catPins = pins.filter((p) => p.category === cat.id)

        return (
          <div key={cat.id}>
            {/* Category row */}
            <div
              onClick={() => setExpanded(isExpanded ? null : cat.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr auto auto auto',
                gap: 8,
                alignItems: 'center',
                padding: '9px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background .12s ease',
                background: isExpanded ? 'rgba(26,82,118,0.06)' : 'transparent',
              }}
              onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(242,239,232,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.background = isExpanded ? 'rgba(26,82,118,0.06)' : 'transparent' }}
            >
              {/* Swatch */}
              <div style={{
                width: 26, height: 26,
                borderRadius: 8,
                background: cat.color,
                display: 'grid', placeItems: 'center',
                fontSize: 13,
                boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.18)',
                opacity: active ? 1 : 0.25,
                transition: 'opacity .15s',
                flexShrink: 0,
              }}>
                {cat.emoji}
              </div>

              {/* Label */}
              <span style={{
                fontSize: 13,
                fontWeight: 500,
                color: active ? '#1C1C1E' : '#8A8A90',
                textDecoration: active ? 'none' : 'line-through',
                textDecorationColor: 'rgba(0,0,0,.18)',
                transition: 'color .12s',
              }}>
                {cat.label}
              </span>

              {/* Count */}
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                color: '#8A8A90',
              }}>
                {pinCounts[cat.id] ?? 0}
              </span>

              {/* Chevron */}
              <svg
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="#8A8A90" strokeWidth="2.5"
                style={{
                  transition: 'transform .18s ease',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>

              {/* Toggle switch — stopPropagation so row click doesn't fire */}
              <div
                role="switch"
                aria-checked={active}
                onClick={(e) => { e.stopPropagation(); onCategoryToggle(cat.id) }}
                title={active ? 'Hide category' : 'Show category'}
                style={{
                  width: 30, height: 18,
                  borderRadius: 99,
                  background: active ? '#1A5276' : '#D9D5CB',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'background .15s ease',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 2, left: active ? 14 : 2,
                  width: 14, height: 14,
                  background: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                  transition: 'left .15s ease',
                }} />
              </div>
            </div>

            {/* Expanded pin list */}
            {isExpanded && (
              <div style={{
                margin: '2px 0 4px 38px',
                borderLeft: `2px solid ${cat.color}40`,
                paddingLeft: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}>
                {catPins.length === 0 ? (
                  <span style={{
                    fontSize: 12,
                    color: '#8A8A90',
                    padding: '6px 0',
                    fontStyle: 'italic',
                  }}>
                    No pins yet
                  </span>
                ) : (
                  catPins.map((pin) => (
                    <button
                      key={pin.id}
                      onClick={(e) => { e.stopPropagation(); onPinSelect?.(pin) }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 6,
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background .1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${cat.color}14`)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{
                        width: 5, height: 5,
                        borderRadius: '50%',
                        background: cat.color,
                        flexShrink: 0,
                        marginTop: 5,
                      }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#1C1C1E', lineHeight: 1.3 }}>
                          {pin.name}
                        </div>
                        {pin.address && (
                          <div style={{ fontSize: 11, color: '#8A8A90', lineHeight: 1.3, marginTop: 1 }}>
                            {pin.address}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Legend({
  open, visibleCategories, pinCounts = {}, totalPins = 0, pins = [],
  onToggle, onCategoryToggle, onPinSelect, embedded,
}: Props) {
  useEffect(() => {
    if (embedded || !open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onToggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onToggle, embedded])

  const inner = (
    <>
      {/* Brand */}
      <div style={{
        padding: '22px 22px 16px',
        borderBottom: '1px solid #EFEBE2',
        display: 'grid',
        gridTemplateColumns: '44px 1fr',
        gap: 12,
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: 'linear-gradient(160deg, #1A5276 0%, #15435F 100%)',
          color: '#F4C430',
          display: 'grid', placeItems: 'center',
          boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.18), 0 4px 10px -4px rgba(26,82,118,.5)',
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '-0.01em',
            margin: 0,
            lineHeight: 1.05,
            color: '#1C1C1E',
          }}>
            Pamilya <em style={{ fontStyle: 'italic', fontWeight: 500, color: '#1A5276' }}>Map</em>
          </h1>
          <div style={{ fontSize: 12, color: '#8A8A90', letterSpacing: '0.02em', marginTop: 2 }}>
            PH family trip · 14 days
          </div>
        </div>
      </div>

      {/* Trip card */}
      <div style={{
        margin: 16,
        padding: '14px 14px 12px',
        background: 'linear-gradient(180deg, #FBF6E8 0%, #F8EFD4 100%)',
        border: '1px solid #EFE2B6',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 10, color: '#8A6B12' }}>
          Active trip
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 17, margin: '4px 0 6px', lineHeight: 1.15, letterSpacing: '-0.01em', color: '#1C1C1E' }}>
          Reyes Family · Philippines &apos;26
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, color: '#4B4B50' }}>
          <span><b style={{ color: '#1C1C1E', fontWeight: 600 }}>Jun 12</b> → Jul 02</span>
          <span><b style={{ color: '#1C1C1E', fontWeight: 600 }}>6</b> travelers</span>
        </div>
      </div>

      {/* Section header */}
      <div style={{ padding: '14px 22px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexShrink: 0 }}>
        <h3 style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8A90', margin: 0 }}>
          Categories
        </h3>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8A8A90' }}>
          {totalPins} pins
        </span>
      </div>

      {/* Category list */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <CategoryList
          visibleCategories={visibleCategories}
          pinCounts={pinCounts}
          pins={pins}
          onCategoryToggle={onCategoryToggle}
          onPinSelect={onPinSelect}
        />
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        padding: '14px 18px',
        borderTop: '1px solid #EFEBE2',
        background: '#FAF9F6',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex' }}>
          {[
            { initials: 'MR', color: '#1A5276' },
            { initials: 'JR', color: '#E67E22' },
            { initials: 'AR', color: '#27AE60' },
            { initials: 'LD', color: '#8E44AD' },
          ].map((av, i) => (
            <div key={av.initials} style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '2px solid #fff', marginLeft: i === 0 ? 0 : -8,
              display: 'grid', placeItems: 'center',
              fontSize: 11, fontWeight: 600, color: '#fff',
              background: av.color,
            }}>
              {av.initials}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#4B4B50' }}>
          <b style={{ color: '#1C1C1E', fontWeight: 600 }}>You + 3</b> editing<br />
          <span style={{ color: '#8A8A90' }}>Last synced just now</span>
        </div>
      </div>
    </>
  )

  if (embedded) {
    return (
      <nav style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} aria-label="Category filter">
        {inner}
      </nav>
    )
  }

  /* Mobile floating panel */
  return (
    <>
      {!open && (
        <button
          onClick={onToggle}
          aria-label="Open legend"
          style={{
            position: 'fixed',
            top: '50%', left: 16,
            transform: 'translateY(-50%)',
            zIndex: 600,
            width: 44, height: 44,
            borderRadius: '50%',
            background: 'rgba(26,82,118,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#F4C430',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(26,82,118,.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
          }}
        >
          ☰
        </button>
      )}
      <nav className={`legend-panel ${open ? 'open' : ''}`} aria-label="Category filter">
        <div style={{
          padding: '16px 18px 13px',
          borderBottom: '1px solid rgba(230,226,216,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(160deg, #1A5276 0%, #15435F 100%)',
              color: '#F4C430',
              display: 'grid', placeItems: 'center',
              boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.18), 0 3px 8px -3px rgba(26,82,118,.5)',
              flexShrink: 0,
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', margin: 0, color: '#1C1C1E' }}>
              Pamilya <em style={{ fontStyle: 'italic', color: '#1A5276' }}>Map</em>
            </h2>
          </div>
          <button
            onClick={onToggle}
            aria-label="Close legend"
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(230,226,216,0.6)',
              color: '#4B4B50', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, flexShrink: 0,
              backdropFilter: 'blur(4px)',
            }}
          >
            ✕
          </button>
        </div>
        <CategoryList
          visibleCategories={visibleCategories}
          pinCounts={pinCounts}
          pins={pins}
          onCategoryToggle={onCategoryToggle}
          onPinSelect={onPinSelect}
        />
      </nav>
    </>
  )
}
