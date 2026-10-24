'use client'

import useSWR, { useSWRConfig } from 'swr'
import { api } from '@/lib/api'
import type { Connection, CreateConnectionInput } from '@/lib/types'

export function useConnections() {
  const { data, error, isLoading, mutate } = useSWR(
    ['connections'],
    () => api.connections.list(),
    { revalidateOnFocus: true }
  )
  return {
    connections: data?.data ?? [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCreateConnection() {
  const { mutate } = useSWRConfig()
  const create = async (input: CreateConnectionInput): Promise<Connection> => {
    const conn = await api.connections.create(input)
    mutate(['connections'])
    return conn
  }
  return { createConnection: create }
}

export function useDeleteConnection() {
  const { mutate } = useSWRConfig()
  const remove = async (id: string): Promise<void> => {
    await api.connections.delete(id)
    mutate(['connections'])
  }
  return { deleteConnection: remove }
}
