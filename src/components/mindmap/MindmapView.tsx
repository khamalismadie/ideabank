'use client'

import { SWRConfig } from 'swr'
import { ReactFlowProvider } from '@xyflow/react'
import { useMindmap } from '@/hooks/useMindmap'
import { useMindmapStore } from '@/hooks/useMindmapStore'
import { MindmapCanvas } from './MindmapCanvas'
import { IdeaSidePanel } from '../sidepanel/IdeaSidePanel'
import { CreateIdeaModal } from './CreateIdeaModal'
import { CreateConnectionModal } from './CreateConnectionModal'
import { AiExpandModal } from './AiExpandModal'
import { TagFilter } from './TagFilter'
import { SearchBar } from './SearchBar'

function MindmapContent() {
  const { graph, isLoading, isError } = useMindmap()
  const { setIsCreateModalOpen, nodes } = useMindmapStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Loading mindmap...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Failed to load mindmap
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
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <span>+</span> New Idea
        </button>
      </div>

      {/* Canvas */}
      <div className="h-[calc(100vh-57px)]">
        {nodes.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: 48 }}>💡</span>
            <p className="text-slate-500">Create your first idea to get started</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              + New Idea
            </button>
          </div>
        ) : (
          <MindmapCanvas
            initialNodes={graph?.nodes ?? []}
            initialEdges={graph?.edges ?? []}
          />
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
      <ReactFlowProvider>
        <MindmapContent />
      </ReactFlowProvider>
    </SWRConfig>
  )
}
