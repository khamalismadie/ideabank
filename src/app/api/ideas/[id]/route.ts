import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validate, UpdateIdeaSchema } from '@/lib/validate'
import { handleApiError, NotFoundError } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const { id } = await params

    const idea = await prisma.idea.findUnique({
      where: { id },
      include: { tags: true, connections: { include: { source: true, target: true } } },
    })

    if (!idea) throw new NotFoundError('Idea')

    return NextResponse.json(idea)
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const { id } = await params
    const body = await request.json()
    const data = validate(UpdateIdeaSchema, body)

    const existing = await prisma.idea.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Idea')

    const idea = await prisma.idea.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.tagIds && {
          tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
        }),
      },
      include: { tags: true },
    })

    return NextResponse.json(idea)
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const { id } = await params

    const existing = await prisma.idea.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Idea')

    await prisma.idea.delete({ where: { id } })

    return NextResponse.json({ message: 'Idea deleted' })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
