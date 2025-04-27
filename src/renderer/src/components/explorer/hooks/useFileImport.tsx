// hooks/useFileImport.ts
import { useCallback } from 'react'
import { FolderType } from '../utils/types'

type FileImportOptions = {
  allowedExtensions?: string[]
  multiple?: boolean
  directory?: boolean
}

export function useFileImport(
  onImportComplete: (files: FolderType[]) => void,
  options: FileImportOptions = {}
) {
  const { allowedExtensions, multiple = true, directory = false } = options

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = multiple

    // Enable directory upload if requested
    if (directory) {
      input.webkitdirectory = true
    }

    // Set file type restrictions if provided
    if (allowedExtensions) {
      input.accept = allowedExtensions.map((ext) => `.${ext}`).join(',')
    }

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const files = Array.from(target.files || [])

      if (files.length === 0) return

      const importedFiles: FolderType[] = files.map((file) => {
        // For Electron, preserve the full path information
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // const path = "path" in file ? (file as any).path : file.name;

        return {
          name: file.name,
          // Store additional metadata that might be useful
          fileData: {
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            // In Electron, this will be the full path
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            path: 'path' in file ? (file as any).path : undefined
          }
        }
      })

      onImportComplete(importedFiles)
    }

    input.click()
  }, [allowedExtensions, multiple, directory, onImportComplete])

  return { handleImport }
}
