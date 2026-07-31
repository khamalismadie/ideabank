import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, NotFoundError } from '@/lib/errors'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const { id } = await params

    const existing = await prisma.connection.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Connection')

    await prisma.connection.delete({ where: { id } })

    return NextResponse.json({ message: 'Connection deleted' })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
