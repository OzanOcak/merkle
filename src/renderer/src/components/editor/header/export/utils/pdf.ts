import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import mermaid from 'mermaid'
import { /*createHtmlDocument,*/ createMarkdownItInstance } from './html'

export const exportAsPdf = async (markdownContent: string, filename: string) => {
  // 1. Convert to HTML
  const md = createMarkdownItInstance()

  const processed_html = md.render(markdownContent)
  const processedHtml = await renderMermaidDiagrams(processed_html)

  // Create HTML with CSS placeholders
  const htmlWithCss = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${getPdfStyles()}
        </style>
      </head>
      <body>
        <div id="pdf-content">${processedHtml}</div>
      </body>
    </html>
  `

  // 2. Create temporary iframe (don't append yet)
  const iframe = document.createElement('iframe')
  iframe.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 210mm;
    height: 297mm;
    border: none;
    visibility: hidden;
    margin: 0 !important;
  `

  try {
    // 3. FIRST append to DOM
    document.body.appendChild(iframe)

    // 4. THEN write styled content to iframe
    const iDoc = iframe.contentDocument
    if (!iDoc) throw new Error('Failed to access iframe document')

    iDoc.open()
    iDoc.write(htmlWithCss)
    iDoc.close()

    // 5. Process elements AFTER content is loaded
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve()
      setTimeout(resolve, 1000) // Fallback timeout
    })

    // 6. Additional DOM processing
    processIframeContent(iframe)

    // 7. Make visible right before capture
    iframe.style.visibility = 'visible'

    // ===== CRITICAL SECTION START =====
    // Wait for Mermaid diagrams to fully render
    await waitForMermaidRendering(iframe)

    // Additional safety delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    // ===== CRITICAL SECTION END =====

    const body = iframe.contentDocument?.body
    if (!body) throw new Error('Failed to render document')

    // PDF generation settings
    const a4WidthMM = 210
    const a4HeightMM = 297
    const horizontalPaddingMM = 0 // Equal left/right padding (was 8)
    //const contentWidthMM = a4WidthMM - 2 * horizontalPaddingMM // 210 - 30 = 180mm
    const verticalPaddingMM = 15
    const scale = 2
    const mmToPx = (mm: number) => mm * 3.779527559
    const contentWidthPx = mmToPx(a4WidthMM - 2 * horizontalPaddingMM)
    const contentHeightPx = mmToPx(a4HeightMM - 2 * verticalPaddingMM)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    let currentPosition = 0
    let pageNum = 0
    const totalHeight = body.scrollHeight

    while (currentPosition < totalHeight) {
      const remainingHeight = totalHeight - currentPosition
      const captureHeight = Math.min(contentHeightPx, remainingHeight)

      const canvas = await html2canvas(body, {
        scale,
        width: contentWidthPx,
        height: captureHeight,
        x: 0,
        y: currentPosition,
        scrollX: 0,
        scrollY: currentPosition,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure styles are applied in the cloned document
          const style = clonedDoc.createElement('style')
          style.textContent = getPdfStyles()
          clonedDoc.head.appendChild(style)
        }
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const imgWidthMM = a4WidthMM - 2 * horizontalPaddingMM
      const imgHeightMM = (canvas.height * imgWidthMM) / canvas.width

      if (pageNum > 0) pdf.addPage()

      pdf.addImage(
        imgData,
        'PNG',
        horizontalPaddingMM,
        verticalPaddingMM,
        imgWidthMM,
        imgHeightMM,
        undefined,
        'FAST'
      )

      currentPosition += captureHeight
      pageNum++
    }

    const cleanFilename = filename.replace(/\.(md|markdown)$/i, '').replace(/[^\w\-.]/g, '_')
    pdf.save(`${cleanFilename}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error('Failed to generate PDF')
  } finally {
    if (iframe.parentNode) {
      document.body.removeChild(iframe)
    }
  }
}

// Helper functions
function getPdfStyles(): string {
  return `
    :root {
      --content-width: 85%;
      --max-content-width: 170mm;
      --page-padding: 15mm;
      --safe-zone: 10mm;
    }
    body {
      margin: 0;
      padding: var(--page-padding);
      min-height: calc(297mm - 2 * var(--page-padding));
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      background-color: #ffffff;
      font-family: "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
    }
     /* Main content container */
    #pdf-content {
      width: 100% !important;
      max-width: var(--max-content-width);
      margin: 0 auto !important;
      padding: 0 !important; /* Remove all padding here */
      box-sizing: border-box;
    }

    /* Equal padding for all direct children */
    #pdf-content > * {
      padding-left: 15px !important;
      padding-right: 15px !important;
    }

    /* Special cases */
    #pdf-content pre,
    #pdf-content code,
    #pdf-content img,
    #pdf-content table {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    /* Lists need consistent indentation */
    #pdf-content ul,
    #pdf-content ol {
      padding-left: 2em !important;
      padding-right: 0 !important;
    }
    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
      position: relative;
      padding-bottom: 5mm;
      margin-bottom: 5mm;
    }
    h1, h2, h3 {
      text-align: center;
      break-after: avoid;
    }
    p, ul, ol {
      margin: 0 0 1em 0;
    }
    pre, code, table, img {
      break-inside: avoid;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em auto;
    }
      img {
  /* Basic image protection */
  page-break-inside: avoid;
  break-inside: avoid;
  
  /* Layout control */
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
  
  /* Extra protection */
  position: relative;
  z-index: 1;
}

/* Special case for tall images */
@media print {
  img.tall-image {
    page-break-before: auto;
    break-before: avoid;
  }
}

.image-protection {
  page-break-inside: avoid !important;
  break-inside: avoid-page !important;
  display: inline-block;
  width: 100%;
  position: relative;
}

/* For very large images that must break */
.allow-break {
  max-height: 250mm; /* Slightly less than A4 height */
  object-fit: contain;
}
  .mermaid {
  display: block;
  margin: 1em auto;
  max-width: 100%;
  page-break-inside: avoid;
  break-inside: avoid;
}

.mermaid svg {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
      /* Mermaid specific styles */
    .mermaid {
      display: block;
      margin: 20px auto;
      background: white;
      page-break-inside: avoid !important;
      break-inside: avoid-page !important;
    }
    
    .mermaid-container {
      width: 100%;
      overflow: visible;
    }
    
    .mermaid svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    
    /* Ensure diagrams don't get cut */
    .mermaid-diagram-protection {
      display: block;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      position: relative;
      z-index: 10;
    }
          /* Flowchart specific styles */
    .mermaid .flowchart-link {
      stroke-width: 2px !important;
    }
    
    .mermaid .node rect,
    .mermaid .node circle,
    .mermaid .node polygon {
      stroke-width: 2px !important;
    }
    
    .mermaid .label {
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
    }
    
    /* Ensure flowcharts don't get cut */
    .flowchart-container {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: visible !important;
    }

        /* Mermaid base styles */
    .mermaid-rendered {
      display: block;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin: 1em 0;
      width: 100%;
      overflow: visible;
    }
    
    .mermaid-rendered svg {
      width: 100% !important;
      height: auto !important;
      max-width: 100% !important;
      display: block !important;
      margin: 0 auto !important;
    }
    
    /* Diagram-specific adjustments */
    .mermaid-rendered .label {
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
    }
    
    .mermaid-rendered .node rect,
    .mermaid-rendered .node circle,
    .mermaid-rendered .node polygon {
      stroke-width: 2px !important;
    }
    
    .mermaid-rendered .flowchart-link {
      stroke-width: 2px !important;
    }
    
    /* Error fallback */
    .mermaid-error {
      background: #ffebee;
      border: 1px solid #ef9a9a;
      padding: 1em;
      color: #c62828;
      font-family: monospace;
    }

     .mermaid-protection {
     page-break-inside: avoid !important;
     break-inside: avoid !important;
     margin: 1em 0 !important;
     }

.mermaid-protection svg {
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 0 auto !important;
}

.mermaid-failed {
  background: #ffebee;
  border: 1px solid #ef9a9a;
  padding: 1em;
  color: #c62828;
  font-family: monospace;
}

    /* Code block styles */
    .code-block-protection {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin: 1em 0 !important;
      width: 100%;
    }
    
    pre {
      background-color: #f5f5f5 !important;
      border-radius: 4px !important;
      padding: 1em !important;
      overflow-x: auto !important;
      font-family: 'Courier New', monospace !important;
      font-size: 0.9em !important;
      line-height: 1.5 !important;
      color: #1849a9 !important;
      border: 1px solid #ddd !important;
    }
    
    code {
      font-family: 'Courier New', monospace !important;
      background-color: rgba(175, 184, 193, 0.2) !important;
      padding: 0.4em 0.4em !important;
      border-radius: 3px !important;
    }
    
    /* Syntax highlighting (adjust colors as needed) */
    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
      color: #6a9955 !important;
    }
    
    .token.punctuation {
      color: #d4d4d4 !important;
    }
    
    .token.property,
    .token.tag,
    .token.boolean,
    .token.number,
    .token.constant,
    .token.symbol {
      color: #b5cea8 !important;
    }
    .code-block-protection {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin: 1em 0 !important;
      width: 100%;
      background: transparent !important; /* Critical fix */
      border: none !important; /* Remove any outer border */
      padding: 0 !important;
    }

    /* The actual pre/code element styling */
    .code-block-protection > pre {
      background-color: #f8f8f8 !important; /* Single background */
      border: 1px solid #e1e1e8 !important; /* Single border */
      border-radius: 6px !important;
      padding: 1em !important;
      margin: 0 !important; /* Remove default margins */
      overflow-x: auto !important;
      font-family: 'Courier New', monospace !important;
      font-size: 0.9em !important;
      line-height: 1.5 !important;
      color: #333 !important;
      box-shadow: none !important; /* Remove any shadows */
    }

    /* Code element inside pre */
    .code-block-protection > pre > code {
      background: transparent !important; /* Remove duplicate background */
      padding: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      display: block !important;
      overflow: visible !important;
    }

    /* Remove any nested backgrounds */
    .code-block-protection > pre * {
      background: transparent !important;
    }

        /* Table styling */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 1em 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      font-size: 0.9em !important;
      border: 1px solid #ddd !important;
    }

    th, td {
      border: 1px solid #ddd !important;
      padding: 8px 12px !important;
      text-align: left !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    th {
      background-color: #f2f2f2 !important;
      font-weight: bold !important;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9 !important;
    }

    /* Ensure tables don't overflow */
    table {
      max-width: 100% !important;
      overflow-wrap: break-word !important;
    }
    .table-container {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin: 1em 0 !important;
    width: 100% !important;
    overflow: visible !important;
    }

    /* Special case for wide tables */
    .wide-table {
      display: block !important;
      overflow-x: auto !important;
      white-space: nowrap !important;
    }
      /* ===== List Styling ===== */
    /* Base list styles */
    ul, ol {
      padding-left: 1.8em !important;
      margin: 0.75em 0 !important;
    }
    
    /* Regular list items */
    li {
      margin: 0.4em 0 !important;
      line-height: 1.5 !important;
      vertical-align: middle !important;
    }
    
    /* Bullet alignment fix */
    ul:not(.contains-task-list) li {
      position: relative;
      list-style: none !important;
    }
    
    ul:not(.contains-task-list) li::before {
      content: "•";
      position: absolute;
      left: -1.2em;
      top: 0.1em;
      font-size: 1.1em;
    }
    
    /* Task list container */
    .contains-task-list {
      padding-left: 0 !important;
      margin-left: 0.5em !important;
      list-style: none !important;
    }

   /* Task list items container */
    .contains-task-list {
      padding-left: 0 !important;
      list-style: none !important;
    }

    /* Individual task items */
    .task-list-item {
      display: flex !important;
      align-items: flex-start !important; / /* Changed from center to baseline */
      min-height: 1.5em !important;
      margin: 0.25em 0 !important;
      padding: 0 0 0 0.5em !important;
    }

    /* Checkbox perfect alignment */
    .task-list-item-checkbox {
      margin: 0 0.5em 0.15em 0 !important;
      /* top right bottom left - adjusted bottom margin */
      transform: scale(1.15);
      vertical-align: text-bottom !important;
      position: relative;
      top: 0.8em; /* Fine micro-adjustment */
    }

    /* Text paragraph alignment */
    .task-list-item > p {
      margin: 0.15em 0 0 0 !important;
      display: inline !important;
      vertical-align: baseline !important;
    }
    
    /* Numbered lists */
    ol {
      counter-reset: item;
    }
    
    ol li {
      counter-increment: item;
      list-style: none !important;
    }
    
    ol li::before {
      content: counter(item) ".";
      position: absolute;
      left: -0.5em;
      width: 1.5em;
      text-align: right;
    }

       /* Blockquote styling for PDF */
    .pdf-blockquote {
      border-left: 4px solid #4285f4;
      padding: 0.5em 1em;
      margin: 1em 0;
      background: #f8f9fa;
      color: #202124;
      font-style: italic;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
    }
    
    /* Nested blockquote styling */
    .pdf-blockquote.nested-level-1 {
      border-left-color: #34a853;
      background: #f1f3f4;
    }
    
    .pdf-blockquote.nested-level-2 {
      border-left-color: #ea4335;
      background: #fce8e6;
    }
    
    .blockquote-wrapper {
      page-break-inside: avoid;
      break-inside: avoid-page;
    }
    
    @media print {
      .pdf-blockquote {
        border-left-width: 3px !important;
      }
    }
      .pdf-link {
      color: #1a73e8;
      text-decoration: none;
      border-bottom: 1px solid rgba(26, 115, 232, 0.3);
    }
    
    .pdf-link-invalid {
      color: #d32f2f !important;
      border-bottom-color: rgba(211, 47, 47, 0.3) !important;
    }
    
    .pdf-link-url {
      color: #5f6368;
      font-size: 0.85em;
      font-family: monospace;
      opacity: 0.8;
    }
    
    @media print {
      .pdf-link-invalid::after {
        content: " (invalid link)";
        color: #d32f2f !important;
      }
    }
  `
}

function processIframeContent(iframe: HTMLIFrameElement) {
  const doc = iframe.contentDocument
  if (!doc) return

  const content = doc.getElementById('pdf-content')
  if (!content) return
  if (content) {
    content.style.marginLeft = '0'
    content.style.marginRight = '0'
    content.style.paddingLeft = '15px'
    content.style.paddingRight = '15px'
  }

  // Wrap vulnerable elements
  const elements = content.querySelectorAll('p, ul, ol, pre, table, img, h1, h2, h3')
  elements.forEach((el) => {
    const wrapper = doc.createElement('div')
    wrapper.className = 'no-break'
    el.parentNode?.insertBefore(wrapper, el)
    wrapper.appendChild(el)
  })

  // Special handling for large elements
  const largeElements = doc.querySelectorAll('pre, table, img')
  largeElements.forEach((el) => {
    if (el.clientHeight > 180) {
      // ~50mm
      el.classList.add('allow-break')
    }
  })

  // Wrap images in protected containers
  const images = doc.querySelectorAll('img')
  images.forEach((img) => {
    // Detect tall images (more than 50% page height)
    if (img.naturalHeight > 297 * 0.5 * 3.78) {
      // ~50% of A4 height
      img.classList.add('tall-image')
    }

    // Wrap in protection div
    const wrapper = doc.createElement('div')
    wrapper.className = 'image-protection'
    wrapper.style.display = 'inline-block'
    wrapper.style.pageBreakInside = 'avoid'
    wrapper.style.breakInside = 'avoid'
    img.parentNode?.insertBefore(wrapper, img)
    wrapper.appendChild(img)
  })

  // Special handling for Mermaid diagrams
  const diagrams = doc.querySelectorAll('.mermaid, .mermaid-container, pre code.language-mermaid')
  diagrams.forEach((diagram) => {
    try {
      // 1. Create protective wrapper
      const wrapper = document.createElement('div')
      wrapper.className = 'mermaid-protection'
      Object.assign(wrapper.style, {
        display: 'block',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        width: '100%',
        overflow: 'visible'
      })

      // 2. Wrap the diagram
      diagram.parentNode?.insertBefore(wrapper, diagram)
      wrapper.appendChild(diagram)

      // 3. Process SVG if exists
      const svg = diagram.querySelector('svg')
      if (svg) {
        // Remove problematic auto dimensions
        svg.removeAttribute('height')
        svg.removeAttribute('width')

        // Set proper dimensions based on viewBox
        const viewBox = svg.getAttribute('viewBox')
        if (viewBox) {
          const [, , , height] = viewBox.split(/\s+/)
          svg.setAttribute('width', '100%')
          svg.setAttribute('height', `${height}px`)
        } else {
          // Fallback dimensions
          svg.setAttribute('width', '100%')
          svg.setAttribute('height', 'auto')
        }

        // Ensure responsive scaling
        svg.style.maxWidth = '100%'
        svg.style.height = 'auto'
        svg.style.display = 'block'
        svg.style.margin = '0 auto'
      }
    } catch (error) {
      console.error('Error processing Mermaid diagram:', error)
      // Fallback: Keep original content but mark as failed
      diagram.classList.add('mermaid-failed')
    }
  })

  // Process code blocks
  const codeBlocks = Array.from(doc.querySelectorAll('pre code:not(.language-mermaid)'))
  codeBlocks.forEach((codeBlock) => {
    try {
      const preElement = codeBlock.closest('pre')
      if (!preElement || !preElement.parentNode) return

      // Clean up existing styles
      preElement.style.background = ''
      preElement.style.border = ''
      //codeBlock.style.background = ''
      //codeBlock.style.border = ''

      // Create clean wrapper
      const wrapper = doc.createElement('div')
      wrapper.className = 'code-block-protection'

      // Insert and move elements
      preElement.parentNode.insertBefore(wrapper, preElement)
      wrapper.appendChild(preElement)

      // Force style reset
      preElement.className = 'code-content' // Reset classes
      preElement.style.cssText = '' // Clear inline styles
    } catch (error) {
      console.error('Code block processing error:', error)
    }
  })

  // Process tables
  const tables = doc.querySelectorAll('table')
  tables.forEach((table) => {
    try {
      // Add wrapper for protection
      const wrapper = doc.createElement('div')
      wrapper.className = 'table-container'
      table.parentNode?.insertBefore(wrapper, table)
      wrapper.appendChild(table)

      // Check if table is too wide
      if (table.scrollWidth > table.clientWidth) {
        table.classList.add('wide-table')
      }

      // Ensure header cells have proper scope
      const headers = table.querySelectorAll('th')
      headers.forEach((th) => {
        if (!th.hasAttribute('scope')) {
          th.setAttribute('scope', 'col')
        }
      })
    } catch (error) {
      console.error('Error processing table:', error)
    }
  })

  // ===== BLOCKQUOTE PROCESSING =====
  const blockquotes = doc.querySelectorAll('blockquote')
  blockquotes.forEach((blockquote) => {
    // 1. Add styling classes
    blockquote.classList.add('pdf-blockquote')

    // 2. Ensure no page breaks inside
    blockquote.style.pageBreakInside = 'avoid'
    blockquote.style.breakInside = 'avoid-page'

    // 3. Handle nested blockquotes
    const nestedLevel = getNestedLevel(blockquote)
    if (nestedLevel > 0) {
      blockquote.classList.add(`nested-level-${nestedLevel}`)
    }

    // Helper function to get nesting level
    function getNestedLevel(el: Element): number {
      let level = 0
      let current = el.parentElement

      while (current) {
        if (current.tagName === 'BLOCKQUOTE') {
          level++
        }
        current = current.parentElement
      }

      return level
    }

    // 4. Wrap content in protection div
    const wrapper = doc.createElement('div')
    wrapper.className = 'blockquote-wrapper'
    wrapper.style.pageBreakInside = 'avoid'
    blockquote.parentNode?.insertBefore(wrapper, blockquote)
    wrapper.appendChild(blockquote)
  })

  // ===== LINK PROCESSING =====
  const links = doc.querySelectorAll<HTMLAnchorElement>('a[href]')
  links.forEach((link) => {
    // 1. Add styling class
    link.classList.add('pdf-link')

    // 2. Extract and clean URL
    try {
      const url = new URL(link.href)
      const cleanUrl = url.hostname + url.pathname.replace(/\/$/, '')

      // 3. Add URL badge (only for external links)
      if (!link.href.startsWith('#')) {
        const urlBadge = doc.createElement('span')
        urlBadge.className = 'pdf-link-url'
        urlBadge.textContent = ` (${cleanUrl})`
        link.appendChild(urlBadge)
      }

      // 4. Special handling for PDF
      link.dataset.pdfHref = link.href
    } catch (error) {
      console.warn('Invalid URL found:', link.href, 'with error of', error)
      // Fallback: Keep original link but mark as invalid
      link.classList.add('pdf-link-invalid')
    }
  })
}

async function renderMermaidDiagrams(html: string): Promise<string> {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // Initialize Mermaid with all diagram support
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Arial',
    flowchart: { useMaxWidth: false },
    sequence: { useMaxWidth: false },
    gantt: { useMaxWidth: false },
    pie: { useMaxWidth: false },
    er: { useMaxWidth: false },
    journey: { useMaxWidth: false }
  })

  const diagrams = tempDiv.querySelectorAll('.mermaid, pre code.language-mermaid')
  for (const diagram of diagrams) {
    const container = document.createElement('div')

    try {
      const graphDefinition = diagram.textContent?.trim() || ''
      container.className = 'mermaid-rendered'

      // Replace original element
      diagram.parentNode?.replaceChild(container, diagram)

      // Render with unique ID
      const { svg } = await mermaid.render(
        `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        graphDefinition
      )

      // Fix SVG attributes
      const fixedSvg = svg
        .replace(/height="auto"/gi, '')
        .replace(/width="auto"/gi, '')
        .replace(/<svg /i, '<svg width="100%" height="100%" ')

      container.innerHTML = fixedSvg

      // Force redraw
      container.style.display = 'none'
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      container.offsetHeight // Trigger reflow
      container.style.display = 'block'
    } catch (error) {
      if (error instanceof Error) {
        console.error('Mermaid render error:', error)
        container.innerHTML = `<div class="mermaid-error">Diagram render failed: ${error.message}</div>`
      } else {
        console.error('Mermaid render error:', error)
        container.innerHTML = `<div class="mermaid-error">Diagram render failed: Unknown error occurred.</div>`
      }
    }
  }

  return tempDiv.innerHTML
}

// New helper function
async function waitForMermaidRendering(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!iframe.contentDocument) {
      reject(new Error('Iframe document not accessible'))
      return
    }

    let attempts = 0
    const maxAttempts = 50 // 5 seconds max (100ms * 50)

    const checkDiagrams = () => {
      attempts++
      try {
        const diagrams = Array.from(
          iframe.contentDocument?.querySelectorAll('.mermaid, .mermaid-container') || []
        )

        if (diagrams.length === 0) {
          // No diagrams found, proceed anyway
          resolve()
          return
        }

        const allRendered = diagrams.every((d) => {
          const svg = d.querySelector('svg')
          return svg && svg.getBoundingClientRect().width > 0
        })

        if (allRendered || attempts >= maxAttempts) {
          if (attempts >= maxAttempts) {
            console.warn('Mermaid rendering timeout reached, proceeding with partial render')
          }
          resolve()
        } else {
          setTimeout(checkDiagrams, 100)
        }
      } catch (error) {
        reject(error)
      }
    }

    checkDiagrams()
  })
}
