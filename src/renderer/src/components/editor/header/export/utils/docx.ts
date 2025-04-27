// utils/exportUtils.ts
import { Document, Paragraph, Packer, TextRun, HeadingLevel } from 'docx'
import saveAs from 'file-saver'

/**
 * Exports content as a DOCX (Word) file
 * @param content - The markdown/plain text content to export
 * @param filename - The base filename (without extension)
 */
export const exportAsDocx = async (content: string, filename: string): Promise<void> => {
  try {
    // Convert markdown headings to appropriate levels
    const paragraphs = content.split('\n').map((line) => {
      if (line.startsWith('### ')) {
        return new Paragraph({
          text: line.replace('### ', ''),
          heading: HeadingLevel.HEADING_3
        })
      } else if (line.startsWith('## ')) {
        return new Paragraph({
          text: line.replace('## ', ''),
          heading: HeadingLevel.HEADING_2
        })
      } else if (line.startsWith('# ')) {
        return new Paragraph({
          text: line.replace('# ', ''),
          heading: HeadingLevel.HEADING_1
        })
      }
      return new Paragraph({
        children: [new TextRun(line)]
      })
    })

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs
        }
      ]
    })

    const buffer = await Packer.toBuffer(doc)
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })

    saveAs(blob, `${filename}.docx`)
    console.log(`DOCX exported: ${filename}.docx`)
  } catch (error) {
    console.error('Error exporting DOCX:', error)
    throw new Error('Failed to export DOCX')
  }
}
