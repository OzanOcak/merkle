import { Tooltip } from '@/components/share/tool_tip'
import { useStore } from '@/store'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  onToggle: () => void
}

export const ThemeToggle = ({ onToggle }: ThemeToggleProps) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const theme = useStore((state) => state.theme)
  const setTheme = useStore((state) => state.setTheme)

  // Sync the local state with the store's theme
  useEffect(() => {
    setCurrentTheme(theme)
    console.log('Current theme:', theme)
  }, [theme])

  const handleToggle = () => {
    console.log('Toggling theme...')
    setTheme(theme === 'dark' ? 'light' : 'dark')
    onToggle()
  }

  return (
    <Tooltip text="Toggle theme" delay={80}>
      <button
        onClick={handleToggle}
        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
        aria-label="Toggle theme"
      >
        {currentTheme === 'light' ? (
          <MoonIcon className="h-4 w-4" />
        ) : (
          <SunIcon className="h-4 w-4 " />
        )}
      </button>
    </Tooltip>
  )
}
