import { create } from 'zustand'
import { Node, Edge } from '@xyflow/react'

export interface IdeaNodeData {
  title: string
  description?: string
  tags: { id: string; name: string; color: string }[]
}

export interface MindmapStore {
  nodes: Node<IdeaNodeData>[]
  edges: Edge[]
  selectedNodeId: string | null
  connectionMode: boolean
  isLoading: boolean
  error: string | null

  setNodes: (nodes: Node<IdeaNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  selectNode: (id: string | null) => void
  setConnectionMode: (enabled: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addNode: (node: Node<IdeaNodeData>) => void
  updateNode: (id: string, data: Partial<IdeaNodeData>) => void
  removeNode: (id: string) => void
  addEdge: (edge: Edge) => void
  removeEdge: (id: string) => void
}

export const useMindmapStore = create<MindmapStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  connectionMode: false,
  isLoading: false,
  error: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setConnectionMode: (enabled) => set({ connectionMode: enabled }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),

  removeEdge: (id) =>
    set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),
}))
