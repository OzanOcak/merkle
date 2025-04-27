import { useEffect, useMemo, useState, useRef } from 'react'
import MarkdownIt from 'markdown-it'
import frontmatterPlugin from 'markdown-it-front-matter'
import taskLists from 'markdown-it-task-lists'
import implicitFigures from 'markdown-it-implicit-figures'
import './markdown.css'
import { MermaidRenderer } from './mermaid/mermaid_renderer'

// Add these new imports for Prism.js
import Prism from 'prismjs'
import 'prismjs/themes/prism.css' // Base theme - choose others like 'prism-tomorrow.css'
import 'prismjs/components/prism-javascript' // JS support
import 'prismjs/components/prism-typescript' // TS support
import 'prismjs/components/prism-jsx' // JSX support
import 'prismjs/components/prism-tsx' // TSX support
import 'prismjs/components/prism-bash' // Bash support
import 'prismjs/components/prism-python' // Python support
import 'prismjs/components/prism-css' // CSS support
import 'prismjs/components/prism-json' // JSON support
import markdownItPrism from 'markdown-it-prism'
import mk from 'markdown-it-katex'
import { YouTubeEmbed } from './header/icons/youtube'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkdownItPlugin = (md: MarkdownIt, ...params: any[]) => void

interface MarkdownRendererProps {
  content: string
  className?: string
  onFrontmatter?: (data: string) => void
}

export function MarkdownRenderer({
  content,
  className = '',
  onFrontmatter
}: MarkdownRendererProps) {
  const [processedHtml, setProcessedHtml] = useState('')
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Remove any existing CSP meta tags
    document
      .querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
      .forEach((el) => el.remove())

    // Add permissive CSP
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:;"
    document.head.appendChild(meta)

    return () => {
      // Clean up on unmount if needed
      meta.remove()
    }
  }, [])

  useEffect(() => {
    if (processedHtml) {
      // Create a temporary timeout to ensure DOM is ready
      const highlightTimer = setTimeout(() => {
        Prism.highlightAll()
      }, 100)
      return () => clearTimeout(highlightTimer)
    }
    return undefined
  }, [processedHtml])

  // Return Statement: By adding return undefined; at the end of the useEffect, you ensure that there is
  // a return value for all code paths. This satisfies TypeScript's requirement for a return value.

  const md = useMemo(() => {
    const instance = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })

    instance.use(mk, {
      throwOnError: false,
      output: 'html'
    })

    instance.use(markdownItPrism)

    instance.use(frontmatterPlugin as MarkdownItPlugin, onFrontmatter || (() => {}))
    instance.use(taskLists as MarkdownItPlugin)
    instance.use(implicitFigures as MarkdownItPlugin)

    // Store original image renderer
    const defaultImageRender = instance.renderer.rules.image

    // Only override if default exists
    if (defaultImageRender) {
      instance.renderer.rules.image = (tokens, idx, options, env, self) => {
        // Get default rendered output
        const defaultOutput = defaultImageRender(tokens, idx, options, env, self)

        // Convert to DOM element to modify
        const temp = document.createElement('div')
        temp.innerHTML = defaultOutput
        const img = temp.querySelector('img')

        if (img) {
          // Add class without removing existing ones
          img.classList.add('prose-img')

          // Convert relative URLs to absolute
          try {
            if (!img.src.startsWith('http') && !img.src.startsWith('data:')) {
              img.src = new URL(img.src, window.location.href).toString()
            }
          } catch (e) {
            console.warn('Image URL conversion failed:', img.src, e)
          }
        }

        return temp.innerHTML
      }
    }

    // Keep your original fence renderer exactly as is
    const defaultRender =
      instance.renderer.rules.fence ||
      function (tokens, idx, options, _env, self) {
        return self.renderToken(tokens, idx, options)
      }

    instance.renderer.rules.fence = (tokens, idx) => {
      const token = tokens[idx]
      if (token.info.trim() === 'mermaid') {
        return `<div data-mermaid data-content="${encodeURIComponent(token.content)}"></div>`
      }
      return defaultRender(tokens, idx, {}, {}, instance.renderer)
    }

    //  YouTube tags
    instance.renderer.rules.text = (tokens, idx) => {
      const content = tokens[idx].content
      const youtubeMatch = content.match(/{% youtube (\w+) %}/)
      return youtubeMatch ? `:::youtube-embed:::${youtubeMatch[1]}:::/youtube-embed:::` : content
    }

    return instance
  }, [onFrontmatter])

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      const html = md.render(content)
      setProcessedHtml(html)

      // Highlight all code blocks after rendering
      setTimeout(() => {
        Prism.highlightAll()
      }, 0)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [content, md])

  // Process content and split into parts
  const { htmlParts, youtubeEmbeds } = useMemo(() => {
    let html = md.render(content)
    const embeds: { id: string; index: number }[] = []
    let index = 0

    // Replace YouTube placeholders with markers
    html = html.replace(/:::youtube-embed:::(.*?):::\/youtube-embed:::/g, (_, id) => {
      embeds.push({ id, index })
      return `:::youtube-placeholder-${index++}:::`
    })

    // Split HTML into parts
    const parts = html.split(/:::(youtube-placeholder-\d+):::/)

    return {
      htmlParts: parts,
      youtubeEmbeds: embeds
    }
  }, [content, md])

  return (
    <div className={`prose max-w-none ${className}`}>
      {htmlParts.map((part, i) => {
        // Check if this part should be a YouTube embed
        const embedMatch = part.match(/youtube-placeholder-(\d+)/)
        if (embedMatch) {
          const embedIndex = parseInt(embedMatch[1])
          const embed = youtubeEmbeds.find((e) => e.index === embedIndex)
          return embed ? <YouTubeEmbed key={`yt-${embedIndex}`} id={embed.id} /> : null
        }
        return <div key={`part-${i}`} dangerouslySetInnerHTML={{ __html: part }} />
      })}
      <MermaidRenderer html={processedHtml} />
    </div>
  )
}
