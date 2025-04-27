// utils/exportUtils.ts
import { saveAs } from 'file-saver'

export const exportAsMarkdown = (content: string, filename: string): void => {
  try {
    // Create blob with proper MIME type
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })

    // Use file-saver to trigger download
    saveAs(blob, `${filename}`)

    console.log(`Markdown exported: ${filename}.md`)
  } catch (error) {
    console.error('Error exporting Markdown:', error)
    throw new Error('Failed to export Markdown')
  }
}
