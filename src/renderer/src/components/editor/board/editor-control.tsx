import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface EditorControlsProps {
  isSplitView: boolean
  onToggleSplitView: () => void
  onToggleHtmlView: () => void
  onRefresh: () => void
}

export const EditorControls = ({
  isSplitView,
  onToggleSplitView,
  onToggleHtmlView,
  onRefresh
}: EditorControlsProps) => (
  <div className="absolute right-0 top-0 h-full w-8 flex flex-col items-start justify-start pt-2 group">
    <button
      className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      title="Toggle fullscreen"
    >
      {isSplitView ? (
        <ArrowsPointingOutIcon onClick={onToggleSplitView} className="h-5 w-5" />
      ) : (
        <ArrowsPointingInIcon onClick={onToggleSplitView} className="h-5 w-5" />
      )}
    </button>
    <button
      className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      title="Toggle fullscreen"
    >
      {!isSplitView && <EyeIcon onClick={onToggleHtmlView} className="h-5 w-5" />}
    </button>
    <button
      className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      title="Toggle fullscreen"
    >
      {isSplitView && <ArrowPathIcon onClick={onRefresh} className="h-5 w-5" />}
    </button>
  </div>
)
