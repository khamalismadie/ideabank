'use client'

import useSWR, { useSWRConfig } from 'swr'
import { api } from '@/lib/api'
import type { Idea, CreateIdeaInput, PaginationParams } from '@/lib/types'

export function useIdeas(params?: PaginationParams) {
  const { data, error, isLoading, mutate } = useSWR(
    ['ideas', params],
    () => api.ideas.list(params),
    { revalidateOnFocus: true }
  )
  return {
    ideas: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useIdea(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['ideas', id] : null,
    () => api.ideas.get(id!),
    { revalidateOnFocus: true }
  )
  return {
    idea: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCreateIdea() {
  const { mutate } = useSWRConfig()
  const create = async (input: CreateIdeaInput): Promise<Idea> => {
    const idea = await api.ideas.create(input)
    mutate((key) => Array.isArray(key) && key[0] === 'ideas')
    return idea
  }
  return { createIdea: create }
}

export function useUpdateIdea() {
  const { mutate } = useSWRConfig()
  const update = async (id: string, input: Partial<CreateIdeaInput>): Promise<Idea> => {
    const idea = await api.ideas.update(id, input)
    mutate((key) => Array.isArray(key) && key[0] === 'ideas')
    mutate((key) => Array.isArray(key) && key[0] === 'ideas' && key[1] === id)
    return idea
  }
  return { updateIdea: update }
}

export function useDeleteIdea() {
  const { mutate } = useSWRConfig()
  const remove = async (id: string): Promise<void> => {
    await api.ideas.delete(id)
    mutate((key) => Array.isArray(key) && key[0] === 'ideas')
  }
  return { deleteIdea: remove }
}
