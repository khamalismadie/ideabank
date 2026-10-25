import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, NotFoundError } from '@/lib/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rootId: string }> }
) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const { rootId } = await params

    // Get root idea
    const rootIdea = await prisma.idea.findUnique({
      where: { id: rootId },
      include: { tags: true },
    })

    if (!rootIdea) throw new NotFoundError('Idea')

    // Get all connections from root (direct children)
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ sourceId: rootId }, { targetId: rootId }],
      },
      include: { source: true, target: true },
    })

    // Collect all related idea IDs
    const relatedIds = new Set<string>([rootId])
    connections.forEach((conn) => {
      relatedIds.add(conn.sourceId)
      relatedIds.add(conn.targetId)
    })

    // Get all related ideas
    const ideas = await prisma.idea.findMany({
      where: { id: { in: Array.from(relatedIds) } },
      include: { tags: true },
    })

    // Build nodes and edges
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

    return NextResponse.json({
      root: rootIdea,
      nodes,
      edges,
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
