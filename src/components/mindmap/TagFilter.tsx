'use client'

import { useTags } from '@/hooks/useTags'
import { useMindmapStore } from '@/hooks/useMindmapStore'

export function TagFilter() {
  const { tags } = useTags()
  const { activeTagIds, toggleTagId, clearTagIds } = useMindmapStore()

  if (tags.length === 0) return null

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
      {activeTagIds.length > 0 && (
        <button
          onClick={clearTagIds}
          className="text-xs text-slate-500 hover:text-slate-700 whitespace-nowrap px-2 py-1"
        >
          Clear
        </button>
      )}
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => toggleTagId(tag.id)}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            activeTagIds.includes(tag.id)
              ? 'text-white'
              : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
          }`}
          style={activeTagIds.includes(tag.id) ? { backgroundColor: tag.color } : {}}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
