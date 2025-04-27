import React, { ReactElement, useState, useRef, useEffect } from 'react'
import {
  ArrowsRightLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  ChartPieIcon,
  CircleStackIcon,
  CodeBracketSquareIcon,
  MapIcon,
  QueueListIcon,
  RectangleGroupIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline'
import { Tooltip } from '@/components/share/tool_tip'

interface MermaidDiagramMenuProps {
  onInsert: (snippet: string) => void
}

interface DiagramType {
  icon: ReactElement
  snippet: string
  title: string
}

export const MermaidDiagramMenu: React.FC<MermaidDiagramMenuProps> = ({ onInsert }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside or mouse leaves
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleMouseLeave = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.relatedTarget as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isOpen])

  const diagramTypes: DiagramType[] = [
    {
      icon: <Square3Stack3DIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\nflowchart \n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n```',
      title: 'Flowchart'
    },
    {
      icon: <QueueListIcon className="h-4 w-4" />,
      snippet:
        "```mermaid\nsequenceDiagram\n    participant Alice\n    participant Bob\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>Alice: I'm good thanks!\n```",
      title: 'Sequence'
    },
    {
      icon: <RectangleGroupIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\nclassDiagram\n    class Animal\n    Animal : +String name\n    Animal : +String sound()\n```',
      title: 'Class'
    },
    {
      icon: <CalendarIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\ngantt\n    title Project Timeline\n    dateFormat  YYYY-MM-DD\n    section Phase 1\n    Task 1 :done, des1, 2023-01-01, 30d\n    Task 2 :active, des2, after des1, 20d\n```',
      title: 'Gantt'
    },
    {
      icon: <ChartPieIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\npie\n    title Popular Pets\n    "Dogs" : 45\n    "Cats" : 30\n    "Fish" : 25\n```',
      title: 'Pie'
    },
    {
      icon: <ArrowsRightLeftIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\nstateDiagram-v2\n    [*] --> Still\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]\n```',
      title: 'State'
    },
    {
      icon: <CodeBracketSquareIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\ngitGraph\n    commit\n    commit\n    branch develop\n    commit\n    commit\n    checkout main\n    merge develop\n```',
      title: 'Git Graph'
    },
    {
      icon: <CircleStackIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\nerDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses\n```',
      title: 'ER Diagram'
    },
    {
      icon: <MapIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\njourney\n    title My work day\n    section Morning\n      Make coffee: 5: Me\n      Write code: 3: Me\n    section Afternoon\n      Meetings: 2: Me, Boss\n```',
      title: 'Journey'
    },
    {
      icon: <ChartBarSquareIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\nquadrantChart\n    title Tech Adoption\n    x-axis Low Adoption --> High Adoption\n    y-axis Low Value --> High Value\n    quadrant-1 Should adopt\n    quadrant-2 Re-evaluate\n    React: [0.8, 0.7]\n    Angular: [0.6, 0.5]\n```',
      title: 'Quadrant'
    },
    {
      icon: <ChartBarIcon className="h-4 w-4" />,
      snippet:
        '```mermaid\nxychart-beta\n    title "Monthly Sales"\n    x-axis [Jan, Feb, Mar, Apr]\n    y-axis "Revenue" 0 --> 10000\n    bar [5000, 6000, 7500, 8200]\n    line [5000, 6000, 7500, 8200]\n```',
      title: 'XY Chart'
    }
  ]

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p- text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)}
      >
        <Square3Stack3DIcon className="h-4 w-4" />
      </div>

      {isOpen && (
        <div
          className="absolute left-[-120px] mt-2 w-auto bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex p-1 space-x-0.5">
            {diagramTypes.map((item, index) => (
              <Tooltip key={index} text={item.title} delay={80}>
                <div
                  onClick={() => {
                    onInsert(item.snippet)
                    setIsOpen(false)
                  }}
                  className="p-2 flex flex-col items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onInsert(item.snippet)
                      setIsOpen(false)
                    }
                  }}
                >
                  {item.icon}
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
