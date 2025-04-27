// components/editor/SaveButton.tsx
import { useUpdateFileContent } from '@/hooks/useUpdateFileContent'
import { useStore } from '@/store'
import { useContentStore } from '@/store/content-store'
import { DocumentCheckIcon } from '@heroicons/react/24/outline'

interface SaveButtonProps {
  isSaving?: boolean
  showText?: boolean
}

export const SaveButton = ({ isSaving = false, showText = true }: SaveButtonProps) => {
  const fileName = useStore((state) => state.currentFileName)
  const content = useContentStore((state) => state.currentContent)
  //console.log(fileName, content)

  const { mutate: updateFile /*, isLoading, isError, error*/ } = useUpdateFileContent()

  const handleSave = (fileName: string, content: string) => {
    updateFile(
      { name: fileName, content },
      {
        onSuccess: (data) => {
          console.log('File saved:', data.name)
          // Optionally update local state or show success notification
        },
        onError: (error) => {
          console.error('Save failed:', error)
          // Handle error (show toast, etc.)
        }
      }
    )
  }

  return (
    <button
      onClick={() => handleSave(fileName!, content!)}
      disabled={isSaving}
      className={`p-1 flex items-center rounded hover:scale-110 active:scale-95  ${
        isSaving
          ? 'text-gray-400 dark:text-gray-500'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
      }`}
      title="Save"
    >
      <DocumentCheckIcon className="h-4 w-4" />
      {showText && (
        <span className="ml-1 text-xs hidden sm:inline dark:text-gray-300 ">
          {isSaving ? 'Saving...' : 'Save'}
        </span>
      )}
    </button>
  )
}
