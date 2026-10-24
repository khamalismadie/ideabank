import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface ExpandRequest {
  ideaId: string
  prompt?: string
}

export async function POST(request: Request) {
  try {
    const { ideaId, prompt }: ExpandRequest = await request.json()

    if (!ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })
    }

    // Fetch the idea
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } })
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // If no API key, return mock suggestions
    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        ideas: [
          { title: `Sub-idea: ${idea.title} - detail A`, description: 'Generated sub-idea', relationship: 'parent' },
          { title: `Sub-idea: ${idea.title} - detail B`, description: 'Generated sub-idea', relationship: 'parent' },
          { title: `Related: ${idea.title} - aspect`, description: 'Related concept', relationship: 'related' },
        ],
      })
    }

    // Build prompt for LLM
    const systemPrompt = `You are a creative idea brainstorming assistant. Given a parent idea, generate 3-5 sub-ideas that explore different aspects of it. For each sub-idea, respond with:
1. A concise title
2. A brief description (1 sentence)
3. A relationship type: "parent" for hierarchical decomposition, "related" for tangential connections, "causes" for outcomes, or "inspires" for inspirational links

Respond ONLY with valid JSON in this format:
{"ideas": [{"title": "...", "description": "...", "relationship": "parent|related|causes|inspires"}]}`

    const userPrompt = `Parent idea: ${idea.title}\n${idea.description ? `Description: ${idea.description}\n` : ''}${idea.content ? `Content: ${idea.content}\n` : ''}${prompt ? `User guidance: ${prompt}\n` : ''}`

    let rawResponse: string

    if (AI_PROVIDER === 'claude') {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
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
          messages: [
            { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` },
          ],
        }),
      })
      if (!claudeRes.ok) {
        return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
      }
      const claudeData = await claudeRes.json()
      rawResponse = claudeData.content?.[0]?.text ?? ''
    } else {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
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
      if (!openaiRes.ok) {
        return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
      }
      const openaiData = await openaiRes.json()
      rawResponse = openaiData.choices?.[0]?.message?.content ?? ''
    }

    // Parse JSON response
    const cleaned = rawResponse.replace(/```json\n?|```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('AI expand error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
