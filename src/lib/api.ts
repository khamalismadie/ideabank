import type {
  Idea,
  Connection,
  Tag,
  MindmapGraph,
  CreateIdeaInput,
  CreateConnectionInput,
  CreateTagInput,
  PaginationParams,
} from './types'

const BASE = '/api'

async function fetcher<T>(
  path: string,
  params?: Record<string, string>,
  options?: RequestInit
): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  ideas: {
    list: (params?: PaginationParams) =>
      fetcher<{ data: Idea[]; pagination: { page: number; limit: number; total: number; pages: number } }>('/ideas', params as Record<string, string>),
    get: (id: string) => fetcher<Idea>(`/ideas/${id}`),
    create: (data: CreateIdeaInput) =>
      fetcher<Idea>('/ideas', undefined, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateIdeaInput>) =>
      fetcher<Idea>(`/ideas/${id}`, undefined, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetcher<{ message: string }>(`/ideas/${id}`, undefined, { method: 'DELETE' }),
  },
  connections: {
    list: () => fetcher<{ data: Connection[] }>('/connections'),
    create: (data: CreateConnectionInput) =>
      fetcher<Connection>('/connections', undefined, { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetcher<{ message: string }>(`/connections/${id}`, undefined, { method: 'DELETE' }),
  },
  tags: {
    list: () => fetcher<{ data: Tag[] }>('/tags'),
    create: (data: CreateTagInput) =>
      fetcher<Tag>('/tags', undefined, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateTagInput>) =>
      fetcher<Tag>(`/tags/${id}`, undefined, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetcher<{ message: string }>(`/tags/${id}`, undefined, { method: 'DELETE' }),
    getIdeas: (id: string) => fetcher<{ data: Idea[] }>(`/tags/${id}/ideas`),
  },
  mindmap: {
    get: () => fetcher<MindmapGraph>('/mindmap'),
  },
  ai: {
    expand: (ideaId: string, prompt?: string) =>
      fetcher<{ ideas: Array<{ title: string; description?: string; relationship: string }> }>(
        '/ai/expand',
        undefined,
        { method: 'POST', body: JSON.stringify({ ideaId, prompt }) }
      ),
  },
}
