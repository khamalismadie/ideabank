import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validate } from '@/lib/validate'
import { handleApiError, NotFoundError } from '@/lib/errors'
import { aiComplete, AiError } from '@/lib/ai'

const ExpandRequestSchema = z.object({
  ideaId: z.string().uuid(),
  prompt: z.string().max(1000).optional(),
})

const ExpandOutputSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
      relationship: z.string().min(1),
    })
  ),
})

const SYSTEM_PROMPT = `You are a creative idea brainstorming assistant. Given a parent idea, generate 3-5 sub-ideas that explore different aspects of it. For each sub-idea, respond with:
1. A concise title
2. A brief description (1 sentence)
3. A relationship type: "parent" for hierarchical decomposition, "related" for tangential connections, "causes" for outcomes, or "inspires" for inspirational links

Respond ONLY with valid JSON in this format:
{"ideas": [{"title": "...", "description": "...", "relationship": "parent|related|causes|inspires"}]}`

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  try {
    const { ideaId, prompt } = validate(ExpandRequestSchema, await request.json())

    const idea = await prisma.idea.findUnique({ where: { id: ideaId } })
    if (!idea) throw new NotFoundError('Idea')

    const hasKey =
      (process.env.AI_PROVIDER ?? 'openai') === 'claude'
        ? !!process.env.ANTHROPIC_API_KEY
        : !!process.env.OPENAI_API_KEY

    // Mock mode: no API key configured
    if (!hasKey) {
      return NextResponse.json({
        ideas: [
          {
            title: `Sub-idea: ${idea.title} - detail A`,
            description: 'Generated sub-idea',
            relationship: 'parent',
          },
          {
            title: `Sub-idea: ${idea.title} - detail B`,
            description: 'Generated sub-idea',
            relationship: 'parent',
          },
          {
            title: `Related: ${idea.title} - aspect`,
            description: 'Related concept',
            relationship: 'related',
          },
        ],
      })
    }

    const { data } = await aiComplete(
      {
        system: SYSTEM_PROMPT,
        prompt: `Parent idea: ${idea.title}\n${idea.description ? `Description: ${idea.description}\n` : ''}${idea.content ? `Content: ${idea.content}\n` : ''}${prompt ? `User guidance: ${prompt}\n` : ''}`,
      },
      ExpandOutputSchema
    )

    return NextResponse.json({ ideas: data.ideas })
  } catch (error) {
    if (error instanceof AiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, requestId)
  }
}
