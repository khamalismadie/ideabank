import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'
import { aiComplete, AiError } from '@/lib/ai'

const schema = z.object({ answer: z.string() })

function mockOpenaiOk() {
  return vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"answer": "ok"}' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
  )
}

function mockClaudeOk() {
  return vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          content: [{ type: 'text', text: '{"answer": "ok"}' }],
          usage: { input_tokens: 10, output_tokens: 5 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
  )
}

describe('aiComplete', () => {
  beforeEach(() => {
    delete process.env.AI_PROVIDER
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('dispatches to openai by default and validates output', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    const fetchMock = mockOpenaiOk()
    vi.stubGlobal('fetch', fetchMock)

    const result = await aiComplete({ prompt: 'hi' }, schema)
    expect(result.data).toEqual({ answer: 'ok' })
    expect(result.model).toBe('gpt-4o-mini')
    expect(result.usage).toEqual({ inputTokens: 10, outputTokens: 5 })
    const calls = fetchMock.mock.calls as unknown as Array<[string]>
    expect(calls[0][0]).toBe('https://api.openai.com/v1/chat/completions')
  })

  it('dispatches to claude with the anthropic key when AI_PROVIDER=claude', async () => {
    process.env.AI_PROVIDER = 'claude'
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
    const fetchMock = mockClaudeOk()
    vi.stubGlobal('fetch', fetchMock)

    const result = await aiComplete({ prompt: 'hi' }, schema)
    expect(result.data).toEqual({ answer: 'ok' })
    const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit]>
    expect(calls[0][0]).toBe('https://api.anthropic.com/v1/messages')
    expect((calls[0][1].headers as Record<string, string>)['x-api-key']).toBe('sk-ant-test')
  })

  it('strips markdown fences from LLM output', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              choices: [{ message: { content: '```json\n{"answer": "fenced"}\n```' } }],
            }),
            { status: 200 }
          )
      )
    )

    const result = await aiComplete({ prompt: 'hi' }, schema)
    expect(result.data).toEqual({ answer: 'fenced' })
  })

  it('retries once on 5xx then succeeds', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('err', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ choices: [{ message: { content: '{"answer": "ok"}' } }] }), {
          status: 200,
        })
      )
    vi.stubGlobal('fetch', fetchMock)

    const result = await aiComplete({ prompt: 'hi' }, schema)
    expect(result.data).toEqual({ answer: 'ok' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry on 4xx', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    const fetchMock = vi.fn(async () => new Response('bad key', { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(aiComplete({ prompt: 'hi' }, schema)).rejects.toThrow(AiError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('throws AiError(502) when output fails schema validation', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ choices: [{ message: { content: '{"wrong": true}' } }] }), {
            status: 200,
          })
      )
    )

    await expect(aiComplete({ prompt: 'hi' }, schema)).rejects.toMatchObject({
      name: 'AiError',
      status: 502,
      message: 'AI returned invalid output',
    })
  })

  it('throws AiError(504) on timeout', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})) // never resolves
    )

    await expect(aiComplete({ prompt: 'hi', timeoutMs: 50 }, schema)).rejects.toMatchObject({
      status: 504,
      message: 'AI request timed out',
    })
  }, 10_000)
})
