'use client'

import useSWR, { useSWRConfig } from 'swr'
import { api } from '@/lib/api'
import type { Tag, CreateTagInput } from '@/lib/types'

export function useTags() {
  const { data, error, isLoading, mutate } = useSWR(
    ['tags'],
    () => api.tags.list(),
    { revalidateOnFocus: true }
  )
  return {
    tags: data?.data ?? [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCreateTag() {
  const { mutate } = useSWRConfig()
  const create = async (input: CreateTagInput): Promise<Tag> => {
    const tag = await api.tags.create(input)
    mutate(['tags'])
    return tag
  }
  return { createTag: create }
}
