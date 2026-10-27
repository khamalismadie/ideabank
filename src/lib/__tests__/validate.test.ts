import { describe, it, expect } from 'vitest'
import {
  CreateIdeaSchema,
  UpdateIdeaSchema,
  CreateConnectionSchema,
  IdeaFilterSchema,
  validate,
  ValidationError,
} from '@/lib/validate'

describe('CreateIdeaSchema', () => {
  it('accepts minimal input and defaults status to inbox', () => {
    const data = CreateIdeaSchema.parse({ title: 'Test idea' })
    expect(data.status).toBe('inbox')
  })

  it('accepts position and status', () => {
    const data = CreateIdeaSchema.parse({
      title: 'Test',
      x: 120.5,
      y: -30,
      status: 'exploring',
    })
    expect(data.x).toBe(120.5)
    expect(data.status).toBe('exploring')
  })

  it('rejects empty title', () => {
    expect(() => CreateIdeaSchema.parse({ title: '' })).toThrow()
  })

  it('rejects non-finite coordinates', () => {
    expect(() => CreateIdeaSchema.parse({ title: 'T', x: Number.NaN })).toThrow()
  })

  it('rejects invalid status', () => {
    expect(() => CreateIdeaSchema.parse({ title: 'T', status: 'nope' })).toThrow()
  })
})

describe('UpdateIdeaSchema', () => {
  it('allows partial updates', () => {
    const data = UpdateIdeaSchema.parse({ x: 10 })
    expect(data.x).toBe(10)
    expect(data.title).toBeUndefined()
  })
})

describe('CreateConnectionSchema', () => {
  const uuidA = '00000000-0000-4000-8000-000000000001'
  const uuidB = '00000000-0000-4000-8000-000000000002'

  it('defaults relationship to related', () => {
    const data = CreateConnectionSchema.parse({ sourceId: uuidA, targetId: uuidB })
    expect(data.relationship).toBe('related')
  })

  it('rejects unknown relationship', () => {
    expect(() =>
      CreateConnectionSchema.parse({ sourceId: uuidA, targetId: uuidB, relationship: 'wat' })
    ).toThrow()
  })
})

describe('IdeaFilterSchema', () => {
  it('applies pagination defaults', () => {
    const data = IdeaFilterSchema.parse({})
    expect(data.page).toBe(1)
    expect(data.limit).toBe(20)
    expect(data.sortBy).toBe('createdAt')
    expect(data.sortOrder).toBe('desc')
  })

  it('caps limit at 100', () => {
    expect(() => IdeaFilterSchema.parse({ limit: '101' })).toThrow()
  })
})

describe('validate()', () => {
  it('throws ValidationError with field errors', () => {
    try {
      validate(CreateIdeaSchema, { title: '' })
      expect.unreachable()
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect((e as ValidationError).errors[0].path).toContain('title')
    }
  })
})
