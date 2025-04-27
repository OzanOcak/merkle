import { useStore } from '@/store'
import { useEffect, useState } from 'react'

export default function StoreHydration({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const _hydrated = useStore((state) => state._hydrated)
  const theme = useStore((state) => state.theme)

  useEffect(() => {
    if (!_hydrated) {
      const unsubscribe = useStore.persist.onFinishHydration(() => {
        // Apply theme class to document immediately after hydration
        document.documentElement.classList.toggle('dark', theme === 'dark')
        setIsHydrated(true)
      })

      // Apply theme class before hydration to prevent flash
      const savedTheme = localStorage.getItem('app-store')
        ? JSON.parse(localStorage.getItem('app-store')!).theme
        : 'light'
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')

      useStore.persist.rehydrate()
      return unsubscribe
    } else {
      setIsHydrated(true)
    }
    return undefined
  }, [_hydrated, theme])

  return isHydrated ? children : null
}
