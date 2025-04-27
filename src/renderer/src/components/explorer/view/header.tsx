// components/explorer/header.tsx
import {
  PlusIcon,
  FolderPlusIcon,
  ChevronDownIcon
  //ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { IconButton } from '../../share/icon_button'

type ExplorerHeaderProps = {
  onNewFile?: () => void
  onNewFolder?: () => void
  onCollapseAll?: () => void
  onImport?: () => void
  title?: string
}

export function ExplorerHeader({
  onNewFile,
  onNewFolder,
  onCollapseAll,
  // onImport,
  title = 'Markly'
}: ExplorerHeaderProps) {
  const buttons = [
    {
      icon: <PlusIcon className="h-4 w-4" />,
      onClick: onNewFile,
      tooltipText: 'New File'
    },
    {
      icon: <FolderPlusIcon className="h-4 w-4" />,
      onClick: onNewFolder,
      tooltipText: 'New Folder'
    },
    {
      icon: <ChevronDownIcon className="h-4 w-4 transform rotate-180 z-200" />,
      onClick: onCollapseAll,
      tooltipText: 'Collapse All'
    }
  ]

  return (
    <div className="flex items-center justify-between p-2  border-b bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
      <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
      <div className="flex items-center space-x-1">
        {buttons.map((button, index) => (
          <IconButton
            key={index}
            icon={button.icon}
            onClick={button.onClick}
            tooltipText={button.tooltipText}
          />
        ))}
      </div>
    </div>
  )
}

{
  /*
      icon: <ArrowDownTrayIcon className="h-4 w-4" />, // New import button
      onClick: onImport,
      tooltipText: 'Import'
    */
}
