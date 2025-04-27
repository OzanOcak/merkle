// utils/html.ts
import { saveAs } from 'file-saver'
import MarkdownIt from 'markdown-it'
import markdownItTaskLists from 'markdown-it-task-lists'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/plugins/line-numbers/prism-line-numbers'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import markdownItPrism from 'markdown-it-prism'
import mk from 'markdown-it-katex'
//import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import markdownItHighlightjs from 'markdown-it-highlightjs'

export const exportAsHtml = (markdownContent: string, filename: string) => {
  const md = createMarkdownItInstance()
  const processedHtml = md.render(markdownContent)
  const htmlDocument = createHtmlDocument(processedHtml, filename)

  // Robust filename handling
  const cleanFilename = filename
    .replace(/\.(md|markdown)$/i, '') // Remove any markdown extension
    .replace(/[^\w\-.]/g, '_') // Sanitize special chars

  const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' })
  saveAs(blob, `${cleanFilename}.html`)
}

export function createMarkdownItInstance() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str: string, lang: string): string => {
      // Add the return type annotation ': string'
      if (lang && Prism.languages[lang]) {
        try {
          return Prism.highlight(str, Prism.languages[lang], lang)
        } catch (err) {
          console.warn(`Error highlighting code for language ${lang}:`, err)
        }
      }
      return '' // use external default escaping
    }
  })
    .use(mk)
    .use(markdownItTaskLists)
    .use(markdownItPrism)
    .use(markdownItHighlightjs) // Simple highlighting
    .use(markdownItTaskLists)

  // Custom image renderer
  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx]
    const src = token.attrs?.find(([name]) => name === 'src')?.[1] || ''
    const alt = token.content || ''

    return `<img src="${src}" alt="${alt}" class="prose-img">`
  }

  // Custom task list item renderer
  md.renderer.rules.list_item_open = (tokens, idx, options, _env, self) => {
    const token = tokens[idx]
    if (token.info?.includes('task')) {
      return '<li class="task-list-item"><input type="checkbox" disabled'
    }
    return self.renderToken(tokens, idx, options)
  }

  // Mermaid diagram support and code block handling
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const lang = token.info.trim()

    // Handle mermaid diagrams
    if (lang === 'mermaid') {
      return `<div class="mermaid">${token.content}</div>`
    }

    // Let markdownItPrism handle code highlighting
    const defaultRender =
      md.renderer.rules.fence ||
      ((tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const code = self.rules.fence!(tokens, idx, options, env, self)
        return code || `<pre><code>${md.utils.escapeHtml(token.content)}</code></pre>`
      })

    return defaultRender(tokens, idx, options, env, self)
  }

  // Minimal parameter version that satisfies both functionality and type checking
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]
    const lang = token.info.trim()

    // Handle mermaid diagrams
    if (lang === 'mermaid') {
      return `<div class="mermaid">${token.content}</div>`
    }

    // Let markdownItPrism handle everything else
    return `<pre class="language-${lang || 'text'}"><code class="language-${lang || 'text'}">${md.utils.escapeHtml(token.content)}</code></pre>`
  }

  // Custom inline code renderer
  md.renderer.rules.code = (tokens, _, options, env, self) => {
    return `<code class="inline-code">${self.renderInline(tokens, options, env)}</code>`
  }

  return md
}

export function createHtmlDocument(content: string, title: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.x/dist/typography.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    /* ============ BASE STYLES ============ */
.prose {
  color: #374151;
  line-height: 1.6;
  max-width: 100%;
  font-size: 1rem;
  margin: 0 auto;
}

/* ============ TYPOGRAPHY ============ */
/* Headings */
.prose h1,
.prose h2,
.prose h3 {
  text-align: center;
  margin-bottom: 2rem;
  font-weight: bold;
}

.prose h1 {
  font-size: 2em;
  margin: 0.67em 0;
}
.prose h2 {
  font-size: 1.5em;
  margin: 0.83em 0;
}
.prose h3 {
  font-size: 1.17em;
  margin: 1em 0;
}

.prose h4 {
  font-size: 1em;
  margin: 1em 0;
  font-weight: bold;
}
.prose h5 {
  font-size: 0.8em;
  margin: 1em 0;
  font-weight: bold;
}
.prose h6 {
  font-size: 0.6em;
  margin: 1em 0;
  font-weight: bold;
}

/* Text Formatting */
.prose strong {
  font-weight: 600;
  color: #111827;
}

.prose em {
  font-style: italic;
}
.prose del {
  text-decoration: line-through;
  color: #6b7280;
}

/* ============ LISTS ============ */
.prose ul:not(.contains-task-list),
.prose ol {
  list-style-type: none; /* Remove all bullets/numbers */
  padding-left: 1em; /* Adjust padding as needed */
}

/* Keep checkboxes in task lists */
.prose ul.contains-task-list {
  list-style-type: none;
  padding-left: 0;
}

.prose .task-list-item {
  list-style-type: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5em 0;
}

.prose .task-list-item input[type="checkbox"] {
  list-style-type: none;
  margin-right: 0.5rem;
  width: 1.1em;
  height: 1.1em;
}

/* Complete reset for lists */
.prose ul, 
.prose ol,
.prose li {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Explicit task list styles */
.prose ul.contains-task-list {
  list-style: none;
  padding-left: 0;
}

.prose .task-list-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.prose .task-list-item::before {
  content: none !important; /* Remove any pseudo-elements */
}

/* ============ CODE & PRE ============ */
.prose code {
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  background-color: #e8e8e899;
  color:#248766;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-size: 0.9em;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 1em 0;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
}

/* ============ LINKS ============ */
.prose a {
  color: #3b82f6;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s ease;
}

.prose a:hover {
  color: #2563eb;
}

/* ============ BLOCKQUOTES ============ */
.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  color: #4b5563;
  font-style: italic;
}

/* ============ HORIZONTAL RULE ============ */
.prose hr {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 1.5em auto;
  width: 80%;
}

/* ============ TABLES ============ */
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem auto;
  font-size: 0.9rem;
  line-height: 1.5;
  table-layout: fixed;
}

.prose thead tr {
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.prose th,
.prose td {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prose th {
  font-weight: 600;
}

.prose tr:hover td {
  background-color: #f1f5f9;
}

/* Column width adjustments */
.prose table:nth-of-type(1) {
  width: 60%;
} /* 2 columns */
.prose table:nth-of-type(2) {
  width: 90%;
} /* 3 columns */
.prose table:nth-of-type(n + 3) {
  width: 100%;
} /* 4+ columns */

/* ============ MEDIA ============ */
.prose img,
.prose video {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 0.5em;
  margin: 2em auto;
}

.prose video {
  background-color: #000;
}

/* YouTube Embeds */
.youtube-embed,
.yt-video {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  margin: 1.5rem 0;
  border-radius: 8px;
}

.youtube-embed iframe,
.yt-video iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-caption {
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
}

a.youtube-thumbnail {
  display: block;
  margin: 1.5rem auto;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease;
  max-width: 100%;
}

a.youtube-thumbnail:hover {
  transform: translateY(-2px);
}

/* ============ SPECIAL BLOCKS ============ */
.prose .math,
.prose .calendar,
.prose .mermaid {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5em;
  margin: 1em auto;
  text-align: center;
}

.mermaid-container {
  display: inline-block;
  margin: 0 auto;
}

.mermaid {
  display: block;
  width: auto !important;
  max-width: none !important;
  background: white;
}

.mermaid svg {
  display: block;
  margin: 0 auto;
}

.mermaid-placeholder {
  min-height: 100px;
  margin: 1rem 0;
  background: rgba(0, 0, 0, 0.05);
}


/* ============ UTILITY CLASSES ============ */
.resizable-panel {
  transition: flex 0.3s ease-in-out;
}

/* Center alignment utility */
.text-center {
  text-align: center;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
/* ============ MERMAID DIAGRAMS ============ */
.prose .mermaid {
  display: block;
  margin: 2rem auto;
  text-align: center;
  background-color: #f3f4f6; /* Light gray background */
  padding: 1rem;
  border-radius: 0.5rem;
  overflow: visible; /* Fix for scrollbar positioning */
}

.prose .mermaid svg {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  background-color: #f3f4f6 !important; /* Ensure gray background */
}

/* Fix for scrollbar positioning */
.prose pre {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.prose pre::-webkit-scrollbar {
  height: 6px;
}

.prose pre::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 0 0 0.5rem 0.5rem;
}

.prose pre::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

/* ============ YOUTUBE THUMBNAIL TO VIDEO ============ */
/* YouTube thumbnail that transforms into embedded video when clicked */
.youtube-thumbnail {
  display: block;
  position: relative;
  width: 100%;
  max-width: 800px; /* Match your content width */
  margin: 2rem auto;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.youtube-thumbnail:hover {
  transform: scale(1.02);
}

.youtube-thumbnail img {
  width: 100%;
  height: auto;
  display: block;
}

.youtube-thumbnail::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 68px;
  height: 48px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><path d="M66.5 7.7c-.8-2.9-2.5-5.4-5.4-6.2C55.8.1 34 0 34 0S12.2.1 6.9 1.5C4 2.3 2.2 4.8 1.5 7.7.1 13 0 24 0 24s.1 11 1.5 16.3c.8 2.9 2.5 5.4 5.4 6.2C12.2 47.9 34 48 34 48s21.8-.1 27.1-1.5c2.9-.8 4.6-3.3 5.4-6.2C67.9 35 68 24 68 24s-.1-11-1.5-16.3z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg>')
    no-repeat;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));
}

/* ============ YOUTUBE EMBED ============ */
/* Embedded YouTube video matching paragraph width */
.youtube-embed,
.yt-video {
  position: relative;
  width: 100%;
  max-width: 800px; /* Match your content width */
  margin: 2rem auto;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: 8px;
}

.youtube-embed iframe,
.yt-video iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-caption {
  text-align: center;
  margin: 0.5rem auto 2rem;
  font-style: italic;
  max-width: 800px; /* Match video width */
}

/* ============ IMAGES ============ */
.prose img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 2rem auto;
  border-radius: 8px;
}

/* For images with captions */
.prose figure {
  margin: 2rem auto;
  text-align: center;
  max-width: 800px; /* Match your content width */
}

.prose figcaption {
  margin-top: 0.5rem;
  font-style: italic;
  color: #6b7280;
}

/* ============ CONTENT WIDTH CONSISTENCY ============ */
/* Set consistent max-width for text content and aligned elements */
.prose {
  max-width: 1800px; /* Adjust this to match your desired content width */
  margin-left: auto;
  margin-right: auto;
  padding: 0 20%;
}

.full-screen {
  padding: 0 96px;
}
.prose > *:not(table):not(figure):not(.youtube-embed):not(.yt-video):not(.youtube-thumbnail) {
  width: 100%;
}

/*========================= CODE =======================*/

/* ========== Light Theme ========== */
.prose code {
  background-color: #f3f4f6;
  color: #111827;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-size: 0.9em;
}

.prose pre {
  background-color: #f3f4f6;
  color: #111827;
  border-radius: 0.5em;
  padding: 1em;
  overflow-x: auto;
  margin: 1.25em 0;
  line-height: 1.5;
}

.prose pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: 0.95em;
}

/* ========== Dark Theme ========== */
.prose code {
  background-color: #1e293b;
  color: #e2e8f0;
}

.prose pre {
  background-color: #0f172a;
  color: #f8fafc;
  border: 1px solid #1e293b;
}

/* Base Styles */
pre[class*="language-"] {
  background: #e8e8e899;
  color: #000000;
  padding: 1em;
  margin: 1em 0;
  overflow: auto;
  border-radius: 0.5em;
  font-family: 'Consolas', 'Monaco', 'Andale Mono', monospace;
  font-size: 0.95em;
  line-height: 1.5;
  tab-size: 4;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
}

code[class*="language-"] {
  color: inherit;
  background: transparent;
  padding: 0;
}

/* Token Colors */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6272a4;
  font-style: italic;
}

.token.punctuation {
  color: #f8f8f2;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #ff79c6;
}

.token.boolean,
.token.number {
  color: #bd93f9;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #50fa7b;
}

.token.operator,
.token.entity,
.token.url {
  color: #f8f8f2;
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #8be9fd;
}

.token.function,
.token.class-name {
  color: #ffb86c;
}

.token.regex,
.token.important,
.token.variable {
  color: #f1fa8c;
}

/* Line Numbers (optional) */
.line-numbers .line-numbers-rows {
  border-right: 1px solid #4a4a4a;
}

.line-numbers-rows > span:before {
  color: #6d8a88;
}

 /* KaTeX specific styles */
    .katex { font-size: 1.05em; }
    .katex-display {
      overflow-x: auto;
      overflow-y: hidden;
      margin: 1em 0;
      padding: 0.5em 0;
    }

  </style>
</head>
<body class="prose dark:prose-invert max-w-none">
  ${content}
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default'
    });
  </script>
  <!-- Then initialize -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
  </script>

</body>
</html>`
}
