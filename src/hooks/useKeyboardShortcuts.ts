'use client'

import { useEffect, useRef } from 'react'
import { useMindmapStore } from './useMindmapStore'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

/**
 * Global canvas shortcuts:
 *  N            — new idea
 *  Enter        — quick-add child of selected node
 *  Delete       — delete selected idea
 *  Cmd/Ctrl+Z   — undo
 *  Cmd/Ctrl+Shift+Z — redo
 *  Esc          — deselect
 */
export function useKeyboardShortcuts(options: {
  onNewIdea: () => void
  onQuickAddChild: () => void
  onDeleteSelected: () => void
}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const { setSelectedIdeaId, undo, redo, selectedIdeaId } = useMindmapStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return

      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }

      if (mod) return

      switch (e.key) {
        case 'n':
        case 'N':
          e.preventDefault()
          optionsRef.current.onNewIdea()
          break
        case 'Enter':
          if (selectedIdeaId) {
            e.preventDefault()
            optionsRef.current.onQuickAddChild()
          }
          break
        case 'Delete':
        case 'Backspace':
          if (selectedIdeaId) {
            e.preventDefault()
            optionsRef.current.onDeleteSelected()
          }
          break
        case 'Escape':
          setSelectedIdeaId(null)
          break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedIdeaId, undo, redo, setSelectedIdeaId])
}
