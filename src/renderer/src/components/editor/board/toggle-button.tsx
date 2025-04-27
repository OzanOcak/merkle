import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline'

interface EditorToggleButtonProps {
  isExplorerOpen: boolean
  onToggleExplorer: () => void
}

export function EditorToggleButton({ isExplorerOpen, onToggleExplorer }: EditorToggleButtonProps) {
  return (
    <button
      onClick={onToggleExplorer}
      className={`absolute z-30 top-1.5 bg-gray-200 dark:bg-gray-700 p-1 rounded-r-md border-r border-t border-b dark:border-gray-600 shadow-md transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600`}
    >
      {isExplorerOpen ? (
        <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <ChevronDoubleRightIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  )
}
