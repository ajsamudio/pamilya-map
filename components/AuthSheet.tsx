'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  onClose: () => void
}

export default function AuthSheet({ onClose }: Props) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/map` },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet" role="dialog" aria-modal="true" aria-label="Sign in">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 pt-4 pb-8">
          {sent ? (
            <div className="text-center py-6 space-y-3">
              <div className="text-4xl">📬</div>
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: 'Fraunces, serif', color: '#1A5276' }}
              >
                Check your email
              </h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                We sent a magic link to <strong className="text-gray-600">{email}</strong>.
                Click it to sign in and add your pin.
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-sm text-gray-400 underline"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ fontFamily: 'Fraunces, serif', color: '#1A5276' }}
                >
                  Sign in to add pins
                </h2>
                <p className="text-gray-400 text-sm">
                  Anyone can view the map — just sign in to add or delete pins.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] focus:bg-white text-base transition-colors"
                />

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-semibold text-white text-base transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#1A5276' }}
                >
                  {loading ? 'Sending…' : 'Send magic link ✉️'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Maybe later
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
