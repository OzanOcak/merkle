import { Outlet } from 'react-router-dom'
import StoreHydration from '@/lib/store-hydration'
import { useStore } from '@/store'
import { useEffect, useState } from 'react'

const MainLayout = () => {
  const theme = useStore((state) => state.theme)
  const [videoHistory, setVideoHistory] = useState<string[]>([])

  useEffect(() => {
    // Apply theme class whenever it changes
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    // Handle back button navigation
    const handlePopState = () => {
      if (videoHistory.length > 0) {
        // Remove the last video from history
        setVideoHistory((prev) => prev.slice(0, -1))

        // Pause any playing videos
        document.querySelectorAll('iframe').forEach((iframe) => {
          iframe.contentWindow?.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            '*'
          )
        })
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [videoHistory])

  // Function to handle video open
  const handleVideoOpen = (videoId: string) => {
    setVideoHistory((prev) => [...prev, videoId])
    window.history.pushState({ videoId }, '', window.location.pathname)
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <main className="flex-grow">
        <StoreHydration>
          {/* Provide video control context to all children */}
          <Outlet context={{ handleVideoOpen, videoHistory }} />
        </StoreHydration>
      </main>
    </div>
  )
}

export default MainLayout
