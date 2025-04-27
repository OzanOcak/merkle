export const LoadingScreen = ({ isReady, progress }: { isReady: boolean; progress: number }) => {
  if (isReady) return null

  return (
    <div
      className={`
      fixed inset-0 z-50 flex flex-col items-center justify-center
      bg-white dark:bg-gray-900 transition-opacity duration-300
      ${isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}
    `}
    >
      <div className="w-64 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
        {progress < 100 ? 'Starting application...' : 'Ready!'}
      </p>
    </div>
  )
}
