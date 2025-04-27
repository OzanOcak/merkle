import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidRendererProps {
  html: string
}

export function MermaidRenderer({ html }: MermaidRendererProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const observedElements = useRef<Set<Element>>(new Set())

  useEffect(() => {
    // Store the current observer and elements in local variables
    const currentObserver =
      observerRef.current ||
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && observedElements.current.has(entry.target)) {
              mermaid
                .run({
                  nodes: [entry.target as HTMLElement]
                })
                .catch(console.error)
            }
          })
        },
        { threshold: 0.1 }
      )

    observerRef.current = currentObserver

    const currentElements = new Set(observedElements.current)
    const newElements = new Set<Element>()

    const processMermaidElements = () => {
      document.querySelectorAll('[data-mermaid]').forEach((element) => {
        if (element.querySelector('.mermaid') || currentElements.has(element)) return

        const content = decodeURIComponent(element.getAttribute('data-content') || '')
        const container = document.createElement('div')
        container.className = 'mermaid'
        container.textContent = content
        element.replaceWith(container)

        currentObserver.observe(container)
        newElements.add(container)
      })
    }

    processMermaidElements()

    // Update the ref with new elements
    observedElements.current = new Set([...currentElements, ...newElements])

    return () => {
      // Use the locally scoped variables in cleanup
      newElements.forEach((el) => {
        currentObserver.unobserve(el)
      })
      currentElements.forEach((el) => {
        currentObserver.unobserve(el)
      })
    }
  }, [html])

  return null
}
