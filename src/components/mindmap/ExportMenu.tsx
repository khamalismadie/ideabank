'use client'

import { useCallback, useState } from 'react'
import { toPng } from 'html-to-image'
import { useReactFlow } from '@xyflow/react'

type ExportFormat = 'png' | 'json' | 'pdf'

export function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { getNodes, getEdges } = useReactFlow()

  const exportPNG = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement
    if (!element) return

    setIsExporting(true)
    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `ideabank-mindmap-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export PNG failed:', err)
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }, [])

  const exportJSON = useCallback(() => {
    const graph = {
      nodes: getNodes().map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: getEdges(),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(graph, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `ideabank-mindmap-${Date.now()}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }, [getNodes, getEdges])

  const exportPDF = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement
    if (!element) return

    setIsExporting(true)
    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })
      const printWindow = window.open('', '_blank')
      if (!printWindow) return
      printWindow.document.write(`
        <html>
          <head><title>Ideabank Mindmap</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
            <img src="${dataUrl}" style="max-width:100%;max-height:100%;" />
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    } catch (err) {
      console.error('Export PDF failed:', err)
    } finally {
      setIsExporting(false)
      setIsOpen(false)
    }
  }, [])

  const handleExport = (format: ExportFormat) => {
    if (format === 'png') exportPNG()
    else if (format === 'json') exportJSON()
    else exportPDF()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[140px]">
            <button
              onClick={() => handleExport('png')}
              disabled={isExporting}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {isExporting ? 'Exporting...' : 'Export PNG'}
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Export JSON
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Export PDF
            </button>
          </div>
        </>
      )}
    </div>
  )
}
