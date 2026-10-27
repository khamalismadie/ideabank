'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react'
import { useMindmapStore, extractPositions } from '@/hooks/useMindmapStore'
import { useAutosave } from '@/hooks/useAutosave'
import { IdeaNode } from './IdeaNode'
import { RelationshipEdge } from './ConnectionEdge'

const nodeTypes: NodeTypes = { idea: IdeaNode as unknown as NodeTypes['idea'] }
const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge as unknown as EdgeTypes['relationship'],
}

interface MindmapCanvasProps {
  initialNodes: Node[]
  initialEdges: Edge[]
}

export function MindmapCanvas({ initialNodes, initialEdges }: MindmapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const nodesRef = useRef(nodes)
  nodesRef.current = nodes

  const { activeTagIds, searchQuery, setSelectedIdeaId, setPendingConnection, pendingRestore } =
    useMindmapStore()

  // Re-sync local canvas state whenever the server graph changes
  // (AI expand, create/delete, another tab, etc.)
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const { scheduleSave } = useAutosave(nodes)

  // Apply a pending undo/redo position snapshot
  useEffect(() => {
    if (!pendingRestore) return
    setNodes((nds) =>
      nds.map((n) => (pendingRestore[n.id] ? { ...n, position: pendingRestore[n.id] } : n))
    )
    useMindmapStore.getState().setCurrentPositions(pendingRestore)
    useMindmapStore.getState().clearPendingRestore()
    scheduleSave()
  }, [pendingRestore, setNodes, scheduleSave])

  const onNodeDragStart = useCallback(() => {
    // Snapshot positions before the drag so undo can return here
    useMindmapStore.getState().pushHistory(extractPositions(nodesRef.current))
  }, [])

  const onNodeDragStop = useCallback(() => {
    const positions = extractPositions(nodesRef.current)
    useMindmapStore.getState().setCurrentPositions(positions)
    scheduleSave()
  }, [scheduleSave])

  // Filter nodes based on active tags and search query
  const filteredNodes = nodes.filter((node) => {
    const data = node.data as Record<string, unknown>
    const title = data?.title as string | undefined
    const description = data?.description as string | undefined
    const tags = data?.tags as Array<{ id: string }> | undefined

    const matchesTag =
      activeTagIds.length === 0 ||
      (tags && activeTagIds.some((tagId) => tags.some((t) => t.id === tagId)))
    const matchesSearch =
      !searchQuery ||
      (title && title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (description && description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTag && matchesSearch
  })

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id))
  const filteredEdges = edges.filter(
    (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        setPendingConnection({ sourceId: connection.source, targetId: connection.target })
      }
    },
    [setPendingConnection]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedIdeaId(node.id)
    },
    [setSelectedIdeaId]
  )

  const onPaneClick = useCallback(() => {
    setSelectedIdeaId(null)
  }, [setSelectedIdeaId])

  if (nodes.length === 0) {
    return (
      <div className="empty-state">
        <span style={{ fontSize: 48 }}>💡</span>
        <p>Create your first idea to get started</p>
      </div>
    )
  }

  return (
    <ReactFlow
      nodes={filteredNodes}
      edges={filteredEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={2}
    >
      <Background color="#e2e8f0" gap={20} />
      <Controls />
      <MiniMap
        nodeColor="#6366f1"
        maskColor="#f8fafc80"
        style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
      />
    </ReactFlow>
  )
}
