import type { Metadata } from 'next'
import { MindmapView } from '@/components/mindmap/MindmapView'

export const metadata: Metadata = {
  title: 'Mindmap — Ideabank',
}

export default function MindmapPage() {
  return <MindmapView />
}
