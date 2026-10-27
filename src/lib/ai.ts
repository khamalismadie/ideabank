import { ZodError, type ZodSchema } from 'zod'
import logger from './logger'

export type AiProvider = 'openai' | 'claude'

const OPENAI_MODEL = 'gpt-4o-mini'
const CLAUDE_MODEL = 'claude-3-5-haiku-20241022'
const DEFAULT_TIMEOUT_MS = 30_000
const MAX_ATTEMPTS = 2 // 1 retry for network/5xx only

export class AiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'AiError'
  }
}

interface AiCompleteOptions {
  prompt: string
  system?: string
  maxTokens?: number
  timeoutMs?: number
}

interface AiResult<T> {
  data: T
  model: string
  latencyMs: number
  usage?: { inputTokens?: number; outputTokens?: number }
}

function providerKey(): { provider: AiProvider; key: string } {
  const provider: AiProvider = (process.env.AI_PROVIDER as AiProvider) ?? 'openai'
  const key =
    provider === 'claude'
      ? (process.env.ANTHROPIC_API_KEY ?? '')
      : (process.env.OPENAI_API_KEY ?? '')
  return { provider, key }
}

async function callOpenai(
  apiKey: string,
  opts: AiCompleteOptions
): Promise<{ raw: string; model: string; usage?: AiResult<unknown>['usage'] }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      messages: [
        ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
        { role: 'user', content: opts.prompt },
      ],
    }),
  })
  if (!res.ok) throw new AiError(`AI request failed (HTTP ${res.status})`, res.status)
  const data = await res.json()
  return {
    raw: data.choices?.[0]?.message?.content ?? '',
    model: OPENAI_MODEL,
    usage: data.usage
      ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens }
      : undefined,
  }
}

async function callClaude(
  apiKey: string,
  opts: AiCompleteOptions
): Promise<{ raw: string; model: string; usage?: AiResult<unknown>['usage'] }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      ...(opts.system ? { system: opts.system } : {}),
      messages: [{ role: 'user', content: opts.prompt }],
    }),
  })
  if (!res.ok) throw new AiError(`AI request failed (HTTP ${res.status})`, res.status)
  const data = await res.json()
  return {
    raw: data.content?.[0]?.text ?? '',
    model: CLAUDE_MODEL,
    usage: data.usage
      ? { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens }
      : undefined,
  }
}

function stripFence(raw: string): string {
  return raw.replace(/```json\n?|```\n?/g, '').trim()
}

/**
 * Single entry point for all LLM calls: provider dispatch, timeout, one retry
 * (network/5xx only), structured-output validation, and usage logging.
 * Throws AiError on any failure.
 */
export async function aiComplete<T>(
  opts: AiCompleteOptions,
  schema: ZodSchema<T>
): Promise<AiResult<T>> {
  const { provider, key } = providerKey()
  const call = provider === 'claude' ? callClaude : callOpenai

  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const started = Date.now()
    try {
      const result = await withTimeout(call(key, opts), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS)
      const parsed = schema.safeParse(JSON.parse(stripFence(result.raw)))
      if (!parsed.success) {
        throw new AiError('AI returned invalid output', 502, new ZodError(parsed.error.issues))
      }
      const latencyMs = Date.now() - started
      logger.info(
        { provider, model: result.model, latencyMs, attempt, ...result.usage },
        'ai.complete'
      )
      return { data: parsed.data, model: result.model, latencyMs, usage: result.usage }
    } catch (error) {
      lastError = error
      const isInvalidOutput =
        error instanceof AiError && error.message === 'AI returned invalid output'
      const retryable = isInvalidOutput
        ? false
        : error instanceof AiError
          ? error.status >= 500 && error.message !== 'AI request timed out'
          : error instanceof TypeError
      if (!retryable || attempt === MAX_ATTEMPTS) break
      logger.warn({ attempt, error: String(error) }, 'ai.complete retrying')
    }
  }

  if (lastError instanceof AiError) throw lastError
  if (lastError instanceof ZodError) throw new AiError('AI returned invalid output', 502, lastError)
  throw new AiError('AI request failed', 502, lastError)
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new AiError('AI request timed out', 504)), ms)
  })
  try {
    return await Promise.race([p, timeout])
  } finally {
    clearTimeout(timer!)
  }
}
