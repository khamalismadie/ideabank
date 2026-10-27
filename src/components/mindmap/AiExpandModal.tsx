'use client'

import { useState } from 'react'
import { useMindmapStore } from '@/hooks/useMindmapStore'
import { useIdea } from '@/hooks/useIdeas'
import { useCreateIdea } from '@/hooks/useIdeas'
import { useCreateConnection } from '@/hooks/useConnections'
import { useMindmap } from '@/hooks/useMindmap'
import type { Relationship } from '@/lib/types'

export function AiExpandModal() {
  const { isAiExpandOpen, setIsAiExpandOpen, selectedIdeaId } = useMindmapStore()
  const { idea } = useIdea(selectedIdeaId)
  const { createIdea } = useCreateIdea()
  const { createConnection } = useCreateConnection()
  const { mutate } = useMindmap()

  const [prompt, setPrompt] = useState('')
  const [suggestions, setSuggestions] = useState<
    Array<{ title: string; description?: string; relationship: Relationship }>
  >([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedIdeaId) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetch('/api/ai/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: selectedIdeaId, prompt }),
      })
      const data = await result.json()
      setSuggestions(data.ideas ?? [])
      setSelected(new Set(data.ideas?.map((_s: unknown, i: number) => i) ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate ideas')
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

  const handleCreate = async () => {
    if (!selectedIdeaId || selected.size === 0) return
    setIsLoading(true)
    try {
      for (const idx of selected) {
        const suggestion = suggestions[idx]
        const newIdea = await createIdea({
          title: suggestion.title,
          description: suggestion.description,
        })
        await createConnection({
          sourceId: selectedIdeaId,
          targetId: newIdea.id,
          relationship: suggestion.relationship || 'parent',
        })
      }
      mutate()
      setIsAiExpandOpen(false)
      setSuggestions([])
      setSelected(new Set())
      setPrompt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ideas')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAiExpandOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setIsAiExpandOpen(false)} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Expand with AI</h2>
        {idea && <p className="text-sm text-slate-500 mb-4">Based on: {idea.title}</p>}

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {suggestions.length === 0 ? (
          <div className="flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What aspects should I explore? (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Ideas'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">Select ideas to create:</p>
            <div className="flex flex-col gap-2">
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
                  <div>
                    <div className="text-sm font-medium text-slate-900">{s.title}</div>
                    {s.description && (
                      <div className="text-xs text-slate-500 mt-1">{s.description}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      Relationship: <span className="capitalize">{s.relationship}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={isLoading || selected.size === 0}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading
                  ? 'Creating...'
                  : `Create ${selected.size} Idea${selected.size !== 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => {
                  setSuggestions([])
                  setSelected(new Set())
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
