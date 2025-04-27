import { ResizableHandle } from '@/components/ui/resizable'

export function SplitViewHandle() {
  return (
    <ResizableHandle
      withHandle
      className={`relative w-0.5 bg-gray-100 dark:bg-gray-800 border-r border-t border-b dark:border-gray-700
                shadow-md transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700
                after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2
                after:w-5 after:h-5 after:flex after:items-center after:justify-center
                after:text-gray-800 after:content-['<<>>'] hover:after:text-gray-900
                after:dark:text-gray-100 hover:after:dark:text-gray-200`}
    />
  )
}
