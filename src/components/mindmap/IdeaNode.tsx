'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { MindmapNodeData, IdeaStatus } from '@/lib/types'

const STATUS_STYLES: Record<IdeaStatus, { border: string; badge: string; label: string }> = {
  inbox: {
    border: 'border-dashed border-2 border-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    label: 'inbox',
  },
  exploring: {
    border: 'border-solid border-2 border-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700',
    label: 'exploring',
  },
  validated: {
    border: 'border-solid border-2 border-green-500',
    badge: 'bg-green-100 text-green-700',
    label: 'validated',
  },
  archived: {
    border: 'border-solid border-2 border-slate-300',
    badge: 'bg-slate-100 text-slate-500',
    label: 'archived',
  },
}

export type IdeaNodeProps = NodeProps

export function IdeaNode({ data, selected }: IdeaNodeProps) {
  const nodeData = data as MindmapNodeData
  const status: IdeaStatus = nodeData.status ?? 'inbox'
  const style = STATUS_STYLES[status]

  return (
    <div className={`idea-node ${selected ? 'selected' : ''} ${style.border}`}>
      <Handle type="target" position={Position.Left} />
      <div className="idea-node-header">
        <span className="idea-node-title">{nodeData.title}</span>
        <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${style.badge}`}>
          {style.label}
        </span>
      </div>
      {nodeData.description && <p className="idea-node-desc">{nodeData.description}</p>}
      {nodeData.tags && nodeData.tags.length > 0 && (
        <div className="idea-node-tags">
          {nodeData.tags.map((tag) => (
            <span key={tag.id} className="tag-badge" style={{ backgroundColor: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
