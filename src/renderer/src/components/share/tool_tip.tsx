import React, { useState, useEffect } from 'react'

interface TooltipProps {
  text?: string
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export const Tooltip = ({ text, children, position = 'bottom', delay = 10 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Set default duration internally (3000ms = 3 seconds)
  const duration = 1000

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  }

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutId) clearTimeout(timeoutId)

    // Show tooltip after delay
    const id = setTimeout(() => {
      setIsVisible(true)
      // Auto-hide after duration
      setTimeoutId(setTimeout(() => setIsVisible(false), duration))
    }, delay)
    setTimeoutId(id)
  }

  const handleMouseLeave = () => {
    // Clear timeouts and hide immediately
    if (timeoutId) clearTimeout(timeoutId)
    setIsVisible(false)
  }

  // Close tooltip when clicking anywhere (including the button)
  useEffect(() => {
    const handleClick = () => handleMouseLeave()
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && text && (
        <div
          className={`absolute ${positionClasses[position]} px-2 py-1 mt-[0.3rem] text-xs text-black bg-white dark:text-gray-100 dark:bg-gray-700 border rounded whitespace-nowrap z-50`}
        >
          {text}
        </div>
      )}
    </div>
  )
}
