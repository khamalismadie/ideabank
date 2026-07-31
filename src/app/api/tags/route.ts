import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validate, CreateTagSchema } from '@/lib/validate'
import { handleApiError, ConflictError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { ideas: true } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: tags })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const body = await request.json()
    const data = validate(CreateTagSchema, body)

    const existing = await prisma.tag.findUnique({ where: { name: data.name } })
    if (existing) {
      throw new ConflictError(`Tag "${data.name}" already exists`)
    }

    const tag = await prisma.tag.create({ data })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
