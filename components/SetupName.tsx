'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  userId: string
  onComplete: (name: string) => void
}

export default function SetupName({ userId, onComplete }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: name.trim(),
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onComplete(name.trim())
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center px-6" style={{ background: '#FAF9F6' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-3">👋</div>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: 'Fraunces, serif', color: '#1A5276' }}
          >
            What&apos;s your name?
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            This is how you&apos;ll appear on pins you add.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mama, Kuya Marco…"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A5276] text-base"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#1A5276' }}
          >
            {loading ? 'Saving…' : 'Start exploring'}
          </button>
        </form>
      </div>
    </div>
  )
}
