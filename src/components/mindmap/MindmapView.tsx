'use client'

import { useCallback } from 'react'
import { SWRConfig } from 'swr'
import { ReactFlowProvider } from '@xyflow/react'
import { useMindmap } from '@/hooks/useMindmap'
import { useMindmapStore } from '@/hooks/useMindmapStore'
import { useCreateIdea, useDeleteIdea } from '@/hooks/useIdeas'
import { useCreateConnection } from '@/hooks/useConnections'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { MindmapCanvas } from './MindmapCanvas'
import { SaveIndicator } from './SaveIndicator'
import { IdeaSidePanel } from '../sidepanel/IdeaSidePanel'
import { CreateIdeaModal } from './CreateIdeaModal'
import { CreateConnectionModal } from './CreateConnectionModal'
import { AiExpandModal } from './AiExpandModal'
import { TagFilter } from './TagFilter'
import { SearchBar } from './SearchBar'
import { ExportMenu } from './ExportMenu'
import { AiConnectButton } from './AiConnectButton'

function MindmapContent() {
  const { graph, isLoading, isError, mutate } = useMindmap()
  const { setIsCreateModalOpen, selectedIdeaId, undo, redo, history, future } = useMindmapStore()
  const { createIdea } = useCreateIdea()
  const { deleteIdea } = useDeleteIdea()
  const { createConnection } = useCreateConnection()
  const { addToast } = useToast()

  const handleNewIdea = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [setIsCreateModalOpen])

  const handleQuickAddChild = useCallback(async () => {
    if (!selectedIdeaId) return
    try {
      const idea = await createIdea({ title: 'New idea', status: 'inbox' })
      await createConnection({
        sourceId: selectedIdeaId,
        targetId: idea.id,
        relationship: 'parent',
      })
      await mutate()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to add child idea', 'error')
    }
  }, [selectedIdeaId, createIdea, createConnection, mutate, addToast])

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedIdeaId) return
    try {
      await deleteIdea(selectedIdeaId)
      await mutate()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete idea', 'error')
    }
  }, [selectedIdeaId, deleteIdea, mutate, addToast])

  useKeyboardShortcuts({
    onNewIdea: handleNewIdea,
    onQuickAddChild: handleQuickAddChild,
    onDeleteSelected: handleDeleteSelected,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Loading mindmap...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500">
        <p>Failed to load mindmap</p>
        <button
          onClick={() => mutate()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      <div className="toolbar">
        <SearchBar />
        <TagFilter />
        <div className="flex-1" />
        <SaveIndicator />
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm disabled:opacity-40"
            title="Undo (Cmd+Z)"
            aria-label="Undo"
          >
            ↩
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm disabled:opacity-40"
            title="Redo (Cmd+Shift+Z)"
            aria-label="Redo"
          >
            ↪
          </button>
        </div>
        <ExportMenu />
        <AiConnectButton />
        <button
          onClick={handleNewIdea}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          title="New idea (N)"
        >
          <span>+</span> New Idea
        </button>
      </div>

      {/* Canvas */}
      <div className="h-[calc(100vh-57px)]">
        {(graph?.nodes.length ?? 0) === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 48 }}>💡</span>
            <p className="text-slate-500">Create your first idea to get started</p>
            <button
              onClick={handleNewIdea}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              + New Idea
            </button>
          </div>
        ) : (
          <MindmapCanvas initialNodes={graph?.nodes ?? []} initialEdges={graph?.edges ?? []} />
        )}
      </div>

      {/* Overlays */}
      <IdeaSidePanel />
      <CreateIdeaModal />
      <CreateConnectionModal />
      <AiExpandModal />
    </div>
  )
}

export function MindmapView() {
  return (
    <SWRConfig>
      <ToastProvider>
        <ReactFlowProvider>
          <MindmapContent />
        </ReactFlowProvider>
      </ToastProvider>
    </SWRConfig>
  )
}
