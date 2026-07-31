import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const [ideas, connections] = await Promise.all([
      prisma.idea.findMany({
        include: { tags: true },
      }),
      prisma.connection.findMany({
        include: { source: true, target: true },
      }),
    ])

    const nodes = ideas.map((idea) => ({
      id: idea.id,
      type: 'idea',
      data: {
        title: idea.title,
        description: idea.description,
        tags: idea.tags,
      },
    }))

    const edges = connections.map((conn) => ({
      id: conn.id,
      source: conn.sourceId,
      target: conn.targetId,
      type: 'relationship',
      data: { relationship: conn.relationship },
    }))

    return NextResponse.json({ nodes, edges })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
