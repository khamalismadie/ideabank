import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? process.env.ANTHROPIC_API_KEY

interface SuggestRequest {
  ideaId?: string
  limit?: number
}

export async function POST(request: Request) {
  try {
    const { ideaId, limit = 5 }: SuggestRequest = await request.json()

    // Get all ideas to find potential connections
    const ideas = await prisma.idea.findMany({
      include: { tags: true },
      take: 50,
      orderBy: { updatedAt: 'desc' },
    })

    if (ideas.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // If no API key, return mock suggestions
    if (!OPENAI_API_KEY) {
      const source = ideaId ? ideas.find((i) => i.id === ideaId) : ideas[0]
      const targets = ideas.filter((i) => i.id !== source?.id).slice(0, 3)
      return NextResponse.json({
        suggestions: targets.map((t) => ({
          sourceId: source?.id,
          targetId: t.id,
          sourceTitle: source?.title,
          targetTitle: t.title,
          relationship: 'related',
          reason: 'Both ideas share similar themes',
        })),
      })
    }

    // Build idea list for LLM
    const ideaList = ideas
      .map((i, idx) => `${idx + 1}. ${i.title}${i.description ? ` - ${i.description}` : ''}`)
      .join('\n')

    const targetIdea = ideaId ? ideas.find((i) => i.id === ideaId) : null
    const systemPrompt = `You are a creative idea connection assistant. Analyze a list of ideas and find meaningful connections between them.
For each potential connection, respond with:
1. sourceIndex: the index number of the source idea (1-based)
2. targetIndex: the index number of the target idea (1-based)
3. relationship: "parent" for hierarchical, "related" for thematic, "causes" for outcomes, "inspires" for inspirational
4. reason: brief explanation of why these ideas connect

Respond ONLY with valid JSON:
{"suggestions": [{"sourceIndex": N, "targetIndex": N, "relationship": "...", "reason": "..."}]}`

    const userPrompt = targetIdea
      ? `Find connections for this idea:\n"${targetIdea.title}"\n\nAll ideas:\n${ideaList}`
      : `Find interesting connections between these ideas:\n${ideaList}`

    let rawResponse: string

    if (AI_PROVIDER === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': OPENAI_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }],
        }),
      })
      if (!res.ok) return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
      const data = await res.json()
      rawResponse = data.content?.[0]?.text ?? ''
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      })
      if (!res.ok) return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
      const data = await res.json()
      rawResponse = data.choices?.[0]?.message?.content ?? ''
    }

    const cleaned = rawResponse.replace(/```json\n?|```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Get existing connections to avoid duplicates
    const existingConns = await prisma.connection.findMany({
      select: { sourceId: true, targetId: true },
    })
    const existingSet = new Set(existingConns.map((c) => `${c.sourceId}::${c.targetId}`))

    // Map indices back to idea IDs, filter out existing connections
    const suggestions = (parsed.suggestions ?? [])
      .slice(0, limit)
      .map((s: any) => ({
        sourceId: ideas[s.sourceIndex - 1]?.id,
        targetId: ideas[s.targetIndex - 1]?.id,
        sourceTitle: ideas[s.sourceIndex - 1]?.title,
        targetTitle: ideas[s.targetIndex - 1]?.title,
        relationship: s.relationship,
        reason: s.reason,
      }))
      .filter(
        (s: any) =>
          s.sourceId &&
          s.targetId &&
          s.sourceId !== s.targetId &&
          !existingSet.has(`${s.sourceId}::${s.targetId}`) &&
          !existingSet.has(`${s.targetId}::${s.sourceId}`)
      )

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('AI connect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
