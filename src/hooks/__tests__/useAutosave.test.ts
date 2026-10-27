import { describe, it, expect } from 'vitest'
import { diffPositions } from '@/hooks/useAutosave'

describe('diffPositions', () => {
  it('returns all ids when baseline is null', () => {
    expect(diffPositions(null, { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } })).toEqual(
      expect.arrayContaining(['a', 'b'])
    )
  })

  it('returns only moved and new ids', () => {
    const baseline = { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } }
    const current = { a: { x: 5, y: 0 }, b: { x: 1, y: 1 }, c: { x: 2, y: 2 } }
    expect(diffPositions(baseline, current).sort()).toEqual(['a', 'c'])
  })

  it('returns empty array when nothing moved', () => {
    const baseline = { a: { x: 0, y: 0 } }
    expect(diffPositions(baseline, { a: { x: 0, y: 0 } })).toEqual([])
  })

  it('ignores ids removed from the canvas', () => {
    const baseline = { a: { x: 0, y: 0 }, b: { x: 9, y: 9 } }
    expect(diffPositions(baseline, { a: { x: 0, y: 0 } })).toEqual([])
  })
})
