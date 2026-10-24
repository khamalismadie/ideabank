'use client'

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import type { Relationship } from '@/lib/types'

const RELATIONSHIP_STYLES: Record<Relationship, { color: string; strokeDasharray?: string }> = {
  parent: { color: '#6366f1', strokeDasharray: '5 5' },
  related: { color: '#94a3b8' },
  causes: { color: '#f59e0b', strokeDasharray: '8 3' },
  inspires: { color: '#10b981' },
}

const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  parent: 'parent',
  related: 'related',
  causes: 'causes',
  inspires: 'inspires',
}

export type RelationshipEdgeProps = EdgeProps

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: RelationshipEdgeProps) {
  const edgeData = data as Record<string, unknown> & { relationship?: Relationship }
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const relationship = edgeData?.relationship ?? 'related'
  const style = RELATIONSHIP_STYLES[relationship] ?? RELATIONSHIP_STYLES.related
  const label = RELATIONSHIP_LABELS[relationship] ?? 'related'
  const colorHash = style.color.replace('#', '')

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.color,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: style.strokeDasharray,
        }}
        markerEnd={`url(#arrow-${colorHash})`}
      />
      <defs>
        <marker
          id={`arrow-${colorHash}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={style.color} />
        </marker>
      </defs>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            fontSize: 10,
            color: style.color,
            fontWeight: 500,
            background: 'white',
            padding: '1px 4px',
            borderRadius: 4,
            border: `1px solid ${style.color}30`,
          }}
          className="nodrag nopan"
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
