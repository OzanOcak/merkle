import { useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useBackendCheck = () => {
  const [isReady, setIsReady] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 5

    const checkConnection = async (): Promise<void> => {
      try {
        // Try any existing API endpoint
        const response = await fetch('http://localhost:3001/api/file', {
          method: 'HEAD', // Just check if endpoint exists
          cache: 'no-store'
        })

        if (response.ok) {
          // Smooth progress completion
          setProgress(100)
          setTimeout(() => setIsReady(true), 500) // Short delay for smooth transition
          return
        }
        throw new Error('Endpoint not ready')
      } catch (error) {
        retryCount++
        setProgress(Math.min(20 + retryCount * 20, 90))
        console.log(error)

        if (retryCount < maxRetries) {
          setTimeout(checkConnection, 1000)
        } else {
          // If all retries fail, still show the app
          setProgress(100)
          setTimeout(() => setIsReady(true), 500)
        }
      }
    }

    checkConnection()

    return () => {
      // Cleanup
    }
  }, [])

  return { isReady, progress }
}
