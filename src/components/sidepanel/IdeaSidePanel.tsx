'use client'

import { useState } from 'react'
import { useMindmapStore } from '@/hooks/useMindmapStore'
import { useIdea, useUpdateIdea, useDeleteIdea } from '@/hooks/useIdeas'
import { useTags } from '@/hooks/useTags'
import { IdeaForm } from './IdeaForm'

export function IdeaSidePanel() {
  const { selectedIdeaId, isSidePanelOpen, setIsSidePanelOpen, setIsAiExpandOpen, setIsConnectionModalOpen } = useMindmapStore()
  const { idea, isLoading } = useIdea(selectedIdeaId)
  const { updateIdea } = useUpdateIdea()
  const { deleteIdea } = useDeleteIdea()
  const { tags } = useTags()

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!isSidePanelOpen) return null

  const handleDelete = async () => {
    if (!selectedIdeaId) return
    await deleteIdea(selectedIdeaId)
    setIsSidePanelOpen(false)
  }

  const handleUpdate = async (data: any) => {
    if (!selectedIdeaId) return
    await updateIdea(selectedIdeaId, data)
    setIsEditing(false)
  }

  return (
    <div className="side-panel">
      <button
        onClick={() => setIsSidePanelOpen(false)}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl leading-none"
        aria-label="Close panel"
      >
        ×
      </button>

      {isLoading && <div className="text-slate-500 text-sm">Loading...</div>}

      {idea && !isEditing && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{idea.title}</h2>
            {idea.description && (
              <p className="mt-2 text-sm text-slate-600">{idea.description}</p>
            )}
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {idea.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {idea.content && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-1">Content</h3>
              <div className="text-sm text-slate-600 whitespace-pre-wrap">{idea.content}</div>
            </div>
          )}

          <div className="text-xs text-slate-400">
            Created {new Date(idea.createdAt).toLocaleDateString()}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Edit Idea
            </button>
            <button
              onClick={() => setIsAiExpandOpen(true)}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100"
            >
              Expand with AI
            </button>
            <button
              onClick={() => setIsConnectionModalOpen(true)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
            >
              Add Connection
            </button>
            {showDeleteConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
              >
                Delete Idea
              </button>
            )}
          </div>
        </div>
      )}

      {idea && isEditing && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Idea</h3>
          <IdeaForm
            initialData={idea}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            tags={tags}
          />
        </div>
      )}
    </div>
  )
}
