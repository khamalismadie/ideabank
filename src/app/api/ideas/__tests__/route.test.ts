import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockFindMany = vi.fn()
const mockCount = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    idea: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}))

import { POST, GET } from '../route'

const validBody = { title: 'New idea', x: 10, y: 20, status: 'exploring' }

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/ideas', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('next/server').NextRequest
}

describe('POST /api/ideas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an idea with position and status', async () => {
    mockCreate.mockResolvedValue({ id: 'i1', ...validBody })

    const res = await POST(jsonRequest(validBody))
    expect(res.status).toBe(201)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'New idea',
          x: 10,
          y: 20,
          status: 'exploring',
        }),
      })
    )
  })

  it('rejects invalid body with 400 and field details', async () => {
    const res = await POST(jsonRequest({ title: '' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation failed')
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

describe('GET /api/ideas', () => {
  it('returns paginated ideas', async () => {
    mockFindMany.mockResolvedValue([{ id: 'i1', title: 'New idea' }])
    mockCount.mockResolvedValue(1)

    const req = new Request(
      'http://localhost/api/ideas?page=1&limit=10'
    ) as unknown as import('next/server').NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveLength(1)
    expect(body.pagination.total).toBe(1)
  })
})
