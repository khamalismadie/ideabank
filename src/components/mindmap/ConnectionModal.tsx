'use client'

import { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useMindmapStore } from '@/store/mindmap'
import { Edge } from '@xyflow/react'

const RELATIONSHIP_TYPES = [
  { value: 'parent', label: 'Parent', description: 'Hierarchical parent-child relationship' },
  { value: 'related', label: 'Related', description: 'Thematically connected ideas' },
  { value: 'causes', label: 'Causes', description: 'Cause-effect relationship' },
  { value: 'inspires', label: 'Inspires', description: 'This idea inspired the other' },
]

interface ConnectionModalProps {
  isOpen: boolean
  sourceId: string | null
  targetId: string | null
  onClose: () => void
}

export function ConnectionModal({ isOpen, sourceId, targetId, onClose }: ConnectionModalProps) {
  const { addEdge } = useMindmapStore()
  const { addToast } = useToast()
  const [relationship, setRelationship] = useState('related')
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    if (!sourceId || !targetId) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': crypto.randomUUID(),
        },
        body: JSON.stringify({ sourceId, targetId, relationship }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create connection')
      }

      const connection = await response.json()

      const newEdge: Edge = {
        id: connection.id,
        source: sourceId,
        target: targetId,
        type: 'default',
        data: { relationship },
        label: relationship,
      }

      addEdge(newEdge)
      addToast('Connection created!', 'success')
      onClose()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to connect ideas', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const sourceNode = useMindmapStore((s) => s.nodes.find((n) => n.id === sourceId))
  const targetNode = useMindmapStore((s) => s.nodes.find((n) => n.id === targetId))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Connection" size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1.5 bg-gray-100 rounded-lg font-medium">
            {sourceNode?.data.title || 'Source'}
          </span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-gray-100 rounded-lg font-medium">
            {targetNode?.data.title || 'Target'}
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Relationship Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RELATIONSHIP_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setRelationship(type.value)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${
                    relationship === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="font-medium text-sm text-gray-900">{type.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
