import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validate, CreateConnectionSchema } from '@/lib/validate'
import { handleApiError, ConflictError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const connections = await prisma.connection.findMany({
      include: { source: true, target: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: connections })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const body = await request.json()
    const data = validate(CreateConnectionSchema, body)

    // Check if connection already exists
    const existing = await prisma.connection.findUnique({
      where: {
        sourceId_targetId_relationship: {
          sourceId: data.sourceId,
          targetId: data.targetId,
          relationship: data.relationship ?? 'related',
        },
      },
    })

    if (existing) {
      throw new ConflictError('Connection already exists')
    }

    const connection = await prisma.connection.create({
      data: {
        sourceId: data.sourceId,
        targetId: data.targetId,
        relationship: data.relationship!,
      },
      include: { source: true, target: true },
    })

    return NextResponse.json(connection, { status: 201 })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
