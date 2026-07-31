import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, NotFoundError } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const { id } = await params

    const tag = await prisma.tag.findUnique({ where: { id } })
    if (!tag) throw new NotFoundError('Tag')

    const ideas = await prisma.idea.findMany({
      where: { tags: { some: { id } } },
      include: { tags: true },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ data: ideas })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
