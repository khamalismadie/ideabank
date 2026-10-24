export type Relationship = 'parent' | 'related' | 'causes' | 'inspires'

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Idea {
  id: string
  title: string
  description?: string | null
  content?: string | null
  createdAt: string
  updatedAt: string
  tags: Tag[]
}

export interface Connection {
  id: string
  sourceId: string
  targetId: string
  relationship: Relationship
}

export interface MindmapNodeData extends Record<string, unknown> {
  title: string
  description?: string | null
  tags: Tag[]
}

export interface MindmapEdgeData extends Record<string, unknown> {
  relationship: Relationship
}

export interface MindmapGraph {
  nodes: Array<{
    id: string
    type: 'idea'
    data: MindmapNodeData
    position: { x: number; y: number }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    type: 'relationship'
    data: MindmapEdgeData
  }>
}

export interface CreateIdeaInput {
  title: string
  description?: string
  content?: string
  tagIds?: string[]
}

export interface CreateConnectionInput {
  sourceId: string
  targetId: string
  relationship: Relationship
}

export interface CreateTagInput {
  name: string
  color?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  tagId?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}
