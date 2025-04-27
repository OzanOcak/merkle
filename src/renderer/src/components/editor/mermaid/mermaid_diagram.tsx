import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

// 1. Create a singleton initialization pattern
let mermaidInitialized = false

const initializeMermaid = () => {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose'
    })
    mermaidInitialized = true
  }
}

// 2. Modified MermaidDiagram component
export const MermaidDiagram = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      initializeMermaid()

      if (!containerRef.current) return

      const container = containerRef.current
      const mermaidContent = chart
        .replace(/^```mermaid/, '')
        .replace(/```$/, '')
        .trim()

      // Clear previous diagram
      container.innerHTML = ''

      const diagramDiv = document.createElement('div')
      diagramDiv.className = 'mermaid'
      diagramDiv.textContent = mermaidContent
      container.appendChild(diagramDiv)

      // Render with IntersectionObserver
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              mermaid
                .run({
                  nodes: [entry.target as HTMLElement],
                  suppressErrors: true
                })
                .catch((e) => {
                  console.error('Mermaid error:', e)
                  setError('Failed to render diagram')
                })
            }
          })
        },
        { threshold: 0.1 }
      )

      observer.observe(diagramDiv)

      return () => observer.disconnect()
    } catch (e) {
      console.error('Mermaid initialization error:', e)
      setError('Diagram engine failed to load')
    }
    return undefined
  }, [chart])

  if (error) return <div className="mermaid-error">{error}</div>

  return <div ref={containerRef} className="mermaid-container w-2/3" />
}
