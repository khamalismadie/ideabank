'use client'

import { useMindmapStore } from '@/hooks/useMindmapStore'

export function SaveIndicator() {
  const saveStatus = useMindmapStore((s) => s.saveStatus)

  if (saveStatus === 'idle') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-400" aria-live="polite">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Saved
      </span>
    )
  }

  if (saveStatus === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-500" aria-live="polite">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Saving…
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-red-500" aria-live="polite">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Save failed
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="underline hover:text-red-700"
      >
        Retry
      </button>
    </span>
  )
}
