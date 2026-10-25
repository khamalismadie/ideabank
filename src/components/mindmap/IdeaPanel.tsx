'use client'

import { useState, useCallback } from 'react'
import { Button, Input, Textarea, Modal } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useMindmapStore, IdeaNodeData } from '@/store/mindmap'
import { Node } from '@xyflow/react'

interface Idea {
  id: string
  title: string
  description?: string
  tags: { id: string; name: string; color: string }[]
}

interface IdeaPanelProps {
  onNodeSelect?: (nodeId: string) => void
}

export function IdeaPanel({ onNodeSelect }: IdeaPanelProps) {
  const { nodes, addNode, updateNode, removeNode } = useMindmapStore()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const filteredNodes = nodes.filter((node) =>
    node.data.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      addToast('Title is required', 'error')
      return
    }

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': crypto.randomUUID(),
        },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) throw new Error('Failed to create idea')

      const idea = await response.json()

      const newNode: Node<IdeaNodeData> = {
        id: idea.id,
        type: 'idea',
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          title: idea.title,
          description: idea.description,
          tags: idea.tags || [],
        },
      }

      addNode(newNode)
      addToast('Idea created!', 'success')
      setIsCreateOpen(false)
      setTitle('')
      setDescription('')
    } catch {
      addToast('Failed to create idea', 'error')
    }
  }, [title, description, addNode, addToast])

  const handleUpdate = useCallback(async () => {
    if (!editingIdea || !title.trim()) return

    try {
      const response = await fetch(`/api/ideas/${editingIdea.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': crypto.randomUUID(),
        },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) throw new Error('Failed to update idea')

      updateNode(editingIdea.id, { title, description, tags: editingIdea.tags })
      addToast('Idea updated!', 'success')
      setIsEditOpen(false)
      setEditingIdea(null)
      setTitle('')
      setDescription('')
    } catch {
      addToast('Failed to update idea', 'error')
    }
  }, [editingIdea, title, description, updateNode, addToast])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this idea?')) return

      try {
        const response = await fetch(`/api/ideas/${id}`, {
          method: 'DELETE',
          headers: { 'x-request-id': crypto.randomUUID() },
        })

        if (!response.ok) throw new Error('Failed to delete idea')

        removeNode(id)
        addToast('Idea deleted', 'success')
      } catch {
        addToast('Failed to delete idea', 'error')
      }
    },
    [removeNode, addToast]
  )

  const openEdit = (node: Node<IdeaNodeData>) => {
    setEditingIdea({
      id: node.id,
      title: node.data.title,
      description: node.data.description,
      tags: node.data.tags,
    })
    setTitle(node.data.title)
    setDescription(node.data.description || '')
    setIsEditOpen(true)
  }

  return (
    <div className="w-72 bg-white border-r h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-900 mb-3">Ideas</h2>
        <Input
          placeholder="Search ideas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Idea List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredNodes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            {nodes.length === 0 ? 'No ideas yet. Create one!' : 'No matches found'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                onClick={() => onNodeSelect?.(node.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {node.data.title}
                    </h4>
                    {node.data.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {node.data.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(node)
                      }}
                      className="p-1 text-gray-400 hover:text-indigo-600"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(node.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {node.data.tags && node.data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {node.data.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-1.5 py-0.5 text-[10px] rounded-full text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className="p-4 border-t">
        <Button onClick={() => setIsCreateOpen(true)} className="w-full">
          + New Idea
        </Button>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Idea">
        <div className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My awesome idea"
            autoFocus
          />
          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your idea..."
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Idea">
        <div className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
