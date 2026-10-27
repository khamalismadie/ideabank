'use client'

import { useCallback, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { useMindmapStore, extractPositions, type PositionSnapshot } from './useMindmapStore'

const AUTOSAVE_DEBOUNCE_MS = 800

export interface PositionedNode {
  id: string
  position: { x: number; y: number }
}

/** Returns the ids whose position changed between baseline and current (or are new). */
export function diffPositions(
  baseline: PositionSnapshot | null,
  current: PositionSnapshot
): string[] {
  if (!baseline) return Object.keys(current)
  return Object.keys(current).filter((id) => {
    const b = baseline[id]
    const c = current[id]
    return !b || b.x !== c.x || b.y !== c.y
  })
}

/**
 * Autosaves node positions (x, y) to the API with a debounce.
 * Returns scheduleSave(), to be called after the user stops dragging a node.
 */
export function useAutosave(nodes: PositionedNode[]) {
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes

  const baselineRef = useRef<PositionSnapshot | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef(false)

  const setSaveStatus = useMindmapStore((s) => s.setSaveStatus)

  // Establish the first known position set as the clean baseline
  useEffect(() => {
    if (baselineRef.current === null && nodes.length > 0) {
      const positions = extractPositions(nodes)
      baselineRef.current = positions
      useMindmapStore.getState().setCurrentPositions(positions)
    }
  }, [nodes])

  const flush = useCallback(async () => {
    const baseline = baselineRef.current
    if (baseline === null || inFlightRef.current) return

    const current = extractPositions(nodesRef.current)
    const dirtyIds = diffPositions(baseline, current)
    if (dirtyIds.length === 0) return

    inFlightRef.current = true
    setSaveStatus('saving')
    let failed = false
    for (const id of dirtyIds) {
      const p = current[id]
      try {
        await api.ideas.update(id, { x: p.x, y: p.y })
      } catch {
        failed = true
        break
      }
    }
    inFlightRef.current = false

    if (failed) {
      setSaveStatus('error')
    } else {
      baselineRef.current = { ...current }
      useMindmapStore.getState().setCurrentPositions(current)
      setSaveStatus('idle')
    }
  }, [setSaveStatus])

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => void flush(), AUTOSAVE_DEBOUNCE_MS)
  }, [flush])

  // Best-effort flush when the canvas unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        void flush()
      }
    }
  }, [flush])

  return { scheduleSave }
}
