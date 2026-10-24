'use client'

import { useState } from 'react'
import { useMindmapStore } from '@/hooks/useMindmapStore'
import { useCreateConnection } from '@/hooks/useConnections'
import { useMindmap } from '@/hooks/useMindmap'
import type { Relationship } from '@/lib/types'

const RELATIONSHIPS: { value: Relationship; label: string; color: string }[] = [
  { value: 'parent', label: 'Parent', color: '#6366f1' },
  { value: 'related', label: 'Related', color: '#94a3b8' },
  { value: 'causes', label: 'Causes', color: '#f59e0b' },
  { value: 'inspires', label: 'Inspires', color: '#10b981' },
]

export function CreateConnectionModal() {
  const { isConnectionModalOpen, setIsConnectionModalOpen, pendingConnection } = useMindmapStore()
  const { createConnection } = useCreateConnection()
  const { mutate } = useMindmap()

  const [relationship, setRelationship] = useState<Relationship>('related')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isConnectionModalOpen || !pendingConnection) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await createConnection({
        sourceId: pendingConnection.sourceId,
        targetId: pendingConnection.targetId,
        relationship,
      })
      mutate()
      setIsConnectionModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connection')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setIsConnectionModalOpen(false)}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Connection</h2>

        <div className="mb-4 text-sm text-slate-600">
          <div>
            <span className="font-medium text-slate-900">From:</span> Idea #{pendingConnection.sourceId.slice(0, 8)}
          </div>
          <div>
            <span className="font-medium text-slate-900">To:</span> Idea #{pendingConnection.targetId.slice(0, 8)}
          </div>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {RELATIONSHIPS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  relationship === r.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="relationship"
                  value={r.value}
                  checked={relationship === r.value}
                  onChange={() => setRelationship(r.value)}
                  className="sr-only"
                />
                <div
                  className="w-4 h-4 rounded-full border-2"
                  style={{
                    borderColor: r.color,
                    backgroundColor: relationship === r.value ? r.color : 'transparent',
                  }}
                />
                <span className="text-sm font-medium text-slate-700">{r.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Connection'}
            </button>
            <button
              type="button"
              onClick={() => setIsConnectionModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
