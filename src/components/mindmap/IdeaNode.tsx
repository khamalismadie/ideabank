'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { MindmapNodeData } from '@/lib/types'

export type IdeaNodeProps = NodeProps

export function IdeaNode({ data, selected }: IdeaNodeProps) {
  const nodeData = data as MindmapNodeData & { title?: string; description?: string; tags?: Array<{ id: string; name: string; color: string }> }

  return (
    <div className={`idea-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="idea-node-header">
        <span className="idea-node-title">{nodeData.title}</span>
      </div>
      {nodeData.description && (
        <p className="idea-node-desc">{nodeData.description}</p>
      )}
      {nodeData.tags && nodeData.tags.length > 0 && (
        <div className="idea-node-tags">
          {nodeData.tags.map((tag) => (
            <span
              key={tag.id}
              className="tag-badge"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
