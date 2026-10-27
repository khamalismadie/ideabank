import { describe, it, expect, beforeEach } from 'vitest'
import { useMindmapStore, extractPositions } from '@/hooks/useMindmapStore'

function resetStore() {
  useMindmapStore.setState({
    history: [],
    future: [],
    current: {},
    pendingRestore: null,
  })
}

const snap = (positions: Record<string, { x: number; y: number }>) =>
  JSON.parse(JSON.stringify(positions))

describe('extractPositions', () => {
  it('maps node id to position', () => {
    expect(
      extractPositions([
        { id: 'a', position: { x: 1, y: 2 } },
        { id: 'b', position: { x: 3, y: 4 } },
      ])
    ).toEqual({ a: { x: 1, y: 2 }, b: { x: 3, y: 4 } })
  })
})

describe('undo/redo (position snapshots)', () => {
  beforeEach(resetStore)

  it('undo restores the previous snapshot and records current in future', () => {
    const store = useMindmapStore
    store.getState().setCurrentPositions({ a: { x: 0, y: 0 } })
    store.getState().pushHistory({ a: { x: 0, y: 0 } })

    // user drags to (10, 10)
    store.getState().setCurrentPositions({ a: { x: 10, y: 10 } })

    store.getState().undo()
    const s = store.getState()
    expect(s.pendingRestore).toEqual({ a: { x: 0, y: 0 } })
    expect(s.future).toEqual([{ a: { x: 10, y: 10 } }])
    expect(s.history).toEqual([])
  })

  it('redo re-applies the undone snapshot', () => {
    const store = useMindmapStore
    store.getState().setCurrentPositions({ a: { x: 0, y: 0 } })
    store.getState().pushHistory({ a: { x: 0, y: 0 } })
    store.getState().setCurrentPositions({ a: { x: 10, y: 10 } })

    store.getState().undo()
    store.getState().clearPendingRestore()
    store.getState().redo()

    expect(store.getState().pendingRestore).toEqual({ a: { x: 10, y: 10 } })
    expect(store.getState().future).toEqual([])
  })

  it('new history entry clears the redo stack', () => {
    const store = useMindmapStore
    store.getState().pushHistory(snap({ a: { x: 0, y: 0 } }))
    store.getState().setCurrentPositions({ a: { x: 1, y: 1 } })
    store.getState().undo()
    store.getState().clearPendingRestore()
    store.getState().redo()
    store.getState().clearPendingRestore()

    store.getState().pushHistory(snap({ a: { x: 2, y: 2 } }))
    expect(store.getState().future).toEqual([])
  })

  it('caps history at 50 entries', () => {
    const store = useMindmapStore
    for (let i = 0; i < 60; i++) {
      store.getState().pushHistory({ a: { x: i, y: i } })
    }
    expect(store.getState().history).toHaveLength(50)
    expect(store.getState().history[0]).toEqual({ a: { x: 10, y: 10 } })
  })

  it('undo is a no-op with empty history', () => {
    const store = useMindmapStore
    store.getState().undo()
    expect(store.getState().pendingRestore).toBeNull()
    expect(store.getState().future).toEqual([])
  })
})
