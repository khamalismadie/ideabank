'use client'

import { useState } from 'react'
import { useMindmapStore } from '@/hooks/useMindmapStore'
import { useCreateConnection } from '@/hooks/useConnections'
import { useMindmap } from '@/hooks/useMindmap'

interface Suggestion {
  sourceId: string
  targetId: string
  sourceTitle: string
  targetTitle: string
  relationship: string
  reason: string
}

export function AiConnectButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { selectedIdeaId } = useMindmapStore()
  const { createConnection } = useCreateConnection()
  const { mutate } = useMindmap()

  const handleSuggest = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: selectedIdeaId }),
      })
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
      setSelected(new Set(data.suggestions?.map((_: any, i: number) => i) ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleConnect = async () => {
    if (selected.size === 0) return
    setIsLoading(true)
    try {
      for (const idx of selected) {
        const s = suggestions[idx]
        await createConnection({
          sourceId: s.sourceId,
          targetId: s.targetId,
          relationship: s.relationship,
        })
      }
      mutate()
      setIsOpen(false)
      setSuggestions([])
      setSelected(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connections')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); handleSuggest() }}
        className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
        title="AI Suggest Connections"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
        AI Connect
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setIsOpen(false); setSuggestions([]) }} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">AI Suggest Connections</h2>
            <p className="text-sm text-slate-500 mb-4">AI found {suggestions.length} potential connections</p>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            {suggestions.length === 0 && !isLoading && (
              <p className="text-sm text-slate-500">Click &quot;Suggest&quot; to find connections</p>
            )}

            {suggestions.length > 0 && (
              <div className="flex flex-col gap-3 mb-4">
                {suggestions.map((s, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selected.has(i) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggleSelect(i)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{s.sourceTitle} → {s.targetTitle}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.reason}</div>
                      <div className="text-xs text-indigo-600 mt-1 capitalize">{s.relationship}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {suggestions.length > 0 && (
                <button
                  onClick={handleConnect}
                  disabled={isLoading || selected.size === 0}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Connect {selected.size} Item{selected.size !== 1 ? 's' : ''}
                </button>
              )}
              <button
                onClick={handleSuggest}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
              >
                {isLoading ? 'Thinking...' : 'Suggest'}
              </button>
              <button
                onClick={() => { setIsOpen(false); setSuggestions([]) }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
