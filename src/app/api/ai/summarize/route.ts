import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface SummarizeRequest {
  rootId: string
}

export async function POST(request: Request) {
  try {
    const { rootId }: SummarizeRequest = await request.json()

    if (!rootId) {
      return NextResponse.json({ error: 'rootId is required' }, { status: 400 })
    }

    // Fetch root and all connected ideas recursively
    const getSubtree = async (id: string, visited = new Set<string>()): Promise<any[]> => {
      if (visited.has(id)) return []
      visited.add(id)

      const idea = await prisma.idea.findUnique({
        where: { id },
        include: {
          tags: true,
          connections: { where: { sourceId: id } },
        },
      })
      if (!idea) return []

      const children = await Promise.all(
        idea.connections.map((c) => getSubtree(c.targetId, visited))
      )

      return [
        {
          id: idea.id,
          title: idea.title,
          description: idea.description,
          relationship: idea.connections[0]?.relationship,
        },
        ...children.flat(),
      ]
    }

    const ideas = await getSubtree(rootId)
    if (ideas.length === 0) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // If no API key, return mock summary
    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        summary: `This mindmap branch contains ${ideas.length} ideas centered around "${ideas[0].title}". Key themes include implementation details, related concepts, and potential outcomes.`,
        keyThemes: ['Main concept', 'Supporting details', 'Related ideas'],
        wordCount: ideas.reduce((acc, i) => acc + (i.description?.length ?? 0), 0),
      })
    }

    const ideaList = ideas
      .map((i, idx) => `${idx + 1}. ${i.title}${i.description ? `: ${i.description}` : ''} [${i.relationship}]`)
      .join('\n')

    const systemPrompt = `You are a concise idea summarizer. Given a branch of related ideas from a mindmap, provide:
1. A concise 2-3 sentence summary of the overall theme
2. Key themes as an array of strings
3. Total approximate word count of descriptions

Respond ONLY with valid JSON:
{"summary": "...", "keyThemes": ["...", "..."], "wordCount": N}`

    const userPrompt = `Summarize this mindmap branch:\n${ideaList}`

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

    return NextResponse.json({
      ...parsed,
      ideaCount: ideas.length,
    })
  } catch (error) {
    console.error('AI summarize error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
