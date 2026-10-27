import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const [ideas, connections] = await Promise.all([
      prisma.idea.findMany({
        include: { tags: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.connection.findMany({
        include: { source: true, target: true },
      }),
    ])

    // Give unsaved nodes (x, y both 0) a temporary grid position
    let gridIndex = 0
    const nodes = ideas.map((idea) => {
      const position =
        idea.x === 0 && idea.y === 0
          ? { x: 120 * gridIndex, y: 120 * Math.floor(gridIndex / 4) }
          : { x: idea.x, y: idea.y }
      if (idea.x === 0 && idea.y === 0) gridIndex++
      return {
        id: idea.id,
        type: 'idea' as const,
        position,
        data: {
          title: idea.title,
          description: idea.description,
          tags: idea.tags,
          status: idea.status,
        },
      }
    })

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
