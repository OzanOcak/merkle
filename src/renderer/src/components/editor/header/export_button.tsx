// components/editor/ExportButton.tsx
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useExportFile } from '@/hooks/useExportFile'
import { useStore } from '@/store'

interface ExportMarkDownButtonProps {
  showText?: boolean
}

export const ExportMarkDownButton = ({ showText = true }: ExportMarkDownButtonProps) => {
  const fileName = useStore((state) => state.currentFileName)
  const { mutate: exportFile, isPending: isExporting } = useExportFile()

  const handleExport = () => {
    if (!fileName) return

    exportFile(fileName, {
      onSuccess: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName}.md`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      },
      onError: (error) => {
        console.error('Export failed:', error)
        // Handle error (show toast, etc.)
      }
    })
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`p-1 flex items-center rounded hover:scale-110 active:scale-95 ${
        isExporting
          ? 'text-gray-400 dark:text-gray-500'
          : 'text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-gray-700'
      }`}
      title="Export"
    >
      <ArrowUpTrayIcon className="h-4 w-4" />
      {showText && (
        <span className="ml-1 text-xs hidden sm:inline dark:text-gray-300">
          {isExporting ? 'Exporting...' : 'Export'}
        </span>
      )}
    </button>
  )
}
