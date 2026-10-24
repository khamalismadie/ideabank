import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validate, CreateIdeaSchema, IdeaFilterSchema } from '@/lib/validate'
import { handleApiError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams)
    const filters = validate(IdeaFilterSchema, query)

    const skip = ((filters.page ?? 1) - 1) * (filters.limit ?? 20)

    const where = {
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' as const } },
          { description: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(filters.tagId && {
        tags: { some: { id: filters.tagId } },
      }),
    }

    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const sortBy = filters.sortBy ?? 'createdAt'
    const sortOrder = filters.sortOrder ?? 'desc'

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where,
        include: { tags: true, connections: true },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.idea.count({ where }),
    ])

    return NextResponse.json({
      data: ideas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const body = await request.json()
    const data = validate(CreateIdeaSchema, body)

    const idea = await prisma.idea.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        ...(data.tagIds && {
          tags: { connect: data.tagIds.map((id) => ({ id })) },
        }),
      },
      include: { tags: true },
    })

    return NextResponse.json(idea, { status: 201 })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
