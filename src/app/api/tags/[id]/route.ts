import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validate, UpdateTagSchema } from '@/lib/validate'
import { handleApiError, NotFoundError } from '@/lib/errors'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const { id } = await params
    const body = await request.json()
    const data = validate(UpdateTagSchema, body)

    const existing = await prisma.tag.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Tag')

    const tag = await prisma.tag.update({
      where: { id },
      data,
    })

    return NextResponse.json(tag)
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

    const existing = await prisma.tag.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Tag')

    await prisma.tag.delete({ where: { id } })

    return NextResponse.json({ message: 'Tag deleted' })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
