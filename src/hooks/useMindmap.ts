'use client'

import useSWR from 'swr'
import { api } from '@/lib/api'
import type { MindmapGraph } from '@/lib/types'

export function useMindmap() {
  const { data, error, isLoading, mutate } = useSWR(
    ['mindmap'],
    () => api.mindmap.get(),
    { revalidateOnFocus: true }
  )
  return {
    graph: data as MindmapGraph | undefined,
    isLoading,
    isError: error,
    mutate,
  }
}
