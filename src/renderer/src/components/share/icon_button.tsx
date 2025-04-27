// components/share/icon_button.tsx
import { ReactNode, useState } from 'react'
import { Tooltip } from './tool_tip'

type IconButtonProps = {
  icon: ReactNode
  onClick?: (e: React.MouseEvent) => void
  tooltipText?: string
  tooltipDelay?: number
  className?: string
}

export function IconButton({
  icon,
  onClick,
  tooltipText,
  tooltipDelay = 80,
  className = 'p-1 rounded hover:bg-blue-100 dark:hover:bg-gray-700'
}: IconButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
    onClick?.(e)
  }

  const button = (
    <button
      onClick={(e) => {
        //  e.stopPropagation()
        handleClick(e)
        // onClick?.(e)
      }}
      className={`${className} transition-transform duration-200 ${
        isPressed ? 'scale-120' : 'scale-100'
      }`}
    >
      {icon}
    </button>
  )

  return tooltipText ? (
    <Tooltip text={tooltipText} delay={tooltipDelay}>
      {button}
    </Tooltip>
  ) : (
    button
  )
}
