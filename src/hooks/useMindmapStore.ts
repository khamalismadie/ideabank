import { create } from 'zustand'

export interface PendingConnection {
  sourceId: string
  targetId: string
}

export type SaveStatus = 'idle' | 'saving' | 'error'

// Position-only snapshots for undo/redo (id -> {x, y})
export type PositionSnapshot = Record<string, { x: number; y: number }>

const MAX_HISTORY = 50

interface MindmapStore {
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

  // Autosave
  saveStatus: SaveStatus
  setSaveStatus: (status: SaveStatus) => void

  // Undo/redo (positions)
  // `current` is the live position map, updated by the canvas (non-reactive read via get())
  current: PositionSnapshot
  history: PositionSnapshot[]
  future: PositionSnapshot[]
  pendingRestore: PositionSnapshot | null
  setCurrentPositions: (positions: PositionSnapshot) => void
  pushHistory: (snapshot: PositionSnapshot) => void
  undo: () => void
  redo: () => void
  clearPendingRestore: () => void
}

export const useMindmapStore = create<MindmapStore>((set) => ({
  // UI state
  selectedIdeaId: null,
  setSelectedIdeaId: (id) => set({ selectedIdeaId: id, isSidePanelOpen: id !== null }),
  isSidePanelOpen: false,
  setIsSidePanelOpen: (open) =>
    set((state) => ({ isSidePanelOpen: open, selectedIdeaId: open ? state.selectedIdeaId : null })),
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

  // Autosave
  saveStatus: 'idle',
  setSaveStatus: (status) => set({ saveStatus: status }),

  // Undo/redo
  current: {},
  history: [],
  future: [],
  pendingRestore: null,
  setCurrentPositions: (positions) => set({ current: positions }),
  pushHistory: (snapshot) =>
    set((state) => ({
      history: [...state.history, snapshot].slice(-MAX_HISTORY),
      future: [],
    })),
  undo: () =>
    set((state) => {
      const prev = state.history[state.history.length - 1]
      if (!prev) return state
      return {
        history: state.history.slice(0, -1),
        future: [state.current, ...state.future].slice(0, MAX_HISTORY),
        pendingRestore: prev,
      }
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0]
      if (!next) return state
      return {
        future: state.future.slice(1),
        history: [...state.history, state.current].slice(-MAX_HISTORY),
        pendingRestore: next,
      }
    }),
  clearPendingRestore: () => set({ pendingRestore: null }),
}))

export function extractPositions(
  nodes: Array<{ id: string; position: { x: number; y: number } }>
): PositionSnapshot {
  const positions: PositionSnapshot = {}
  for (const node of nodes) positions[node.id] = { x: node.position.x, y: node.position.y }
  return positions
}
