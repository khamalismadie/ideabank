'use client'

import { useMindmapStore } from '@/hooks/useMindmapStore'
import { useTags } from '@/hooks/useTags'
import { IdeaForm } from '../sidepanel/IdeaForm'
import { useCreateIdea } from '@/hooks/useIdeas'
import { useMindmap } from '@/hooks/useMindmap'
import { useToast } from '@/components/ui/Toast'
import type { CreateIdeaInput } from '@/lib/types'

export function CreateIdeaModal() {
  const { isCreateModalOpen, setIsCreateModalOpen } = useMindmapStore()
  const { tags } = useTags()
  const { createIdea } = useCreateIdea()
  const { mutate } = useMindmap()
  const { addToast } = useToast()

  const handleSubmit = async (data: CreateIdeaInput) => {
    await createIdea(data)
    await mutate()
    addToast('Idea created', 'success')
    setIsCreateModalOpen(false)
  }

  if (!isCreateModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setIsCreateModalOpen(false)} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Create New Idea</h2>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <IdeaForm onSubmit={handleSubmit} tags={tags} />
      </div>
    </div>
  )
}
