import { create } from 'zustand'
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react'

interface PendingConnection {
  sourceId: string
  targetId: string
}

interface MindmapStore {
  // React Flow state
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void

  // UI state
  selectedIdeaId: string | null
  setSelectedIdeaId: (id: string | null) => void
  isSidePanelOpen: boolean
  setIsSidePanelOpen: (open: boolean) => void
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
  isConnectionModalOpen: boolean
  setIsConnectionModalOpen: (open: boolean) => void
  isAiExpandOpen: boolean
  setIsAiExpandOpen: (open: boolean) => void

  // Filters
  activeTagIds: string[]
  toggleTagId: (id: string) => void
  clearTagIds: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void

  // Connection creation
  pendingConnection: PendingConnection | null
  setPendingConnection: (conn: PendingConnection | null) => void
}

export const useMindmapStore = create<MindmapStore>((set) => ({
  // React Flow state — initialized as empty; loaded from /api/mindmap
  nodes: [],
  edges: [],
  onNodesChange: () => {},
  onEdgesChange: () => {},
  onConnect: () => {},
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  // UI state
  selectedIdeaId: null,
  setSelectedIdeaId: (id) => set({ selectedIdeaId: id, isSidePanelOpen: id !== null }),
  isSidePanelOpen: false,
  setIsSidePanelOpen: (open) => set({ isSidePanelOpen: open, selectedIdeaId: open ? undefined : null }),
  isCreateModalOpen: false,
  setIsCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  isConnectionModalOpen: false,
  setIsConnectionModalOpen: (open) => set({ isConnectionModalOpen: open }),
  isAiExpandOpen: false,
  setIsAiExpandOpen: (open) => set({ isAiExpandOpen: open }),

  // Filters
  activeTagIds: [],
  toggleTagId: (id) =>
    set((state) => ({
      activeTagIds: state.activeTagIds.includes(id)
        ? state.activeTagIds.filter((t) => t !== id)
        : [...state.activeTagIds, id],
    })),
  clearTagIds: () => set({ activeTagIds: [] }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Connection creation
  pendingConnection: null,
  setPendingConnection: (conn) =>
    set({ pendingConnection: conn, isConnectionModalOpen: conn !== null }),
}))
