import React, { ReactElement, useState } from 'react'
import {
  HashtagIcon,
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  QueueListIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
  TableCellsIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  CommandLineIcon,
  ViewColumnsIcon,
  RectangleGroupIcon,
  ClipboardDocumentCheckIcon,
  CalculatorIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { FrontMatterSettings } from '../front_matter_settings'
import { Tooltip } from '../../share/tool_tip'
import { ThemeToggle } from './icons/toggle'
import { MermaidDiagramMenu } from '../mermaid/mermaid_menu'
import { SaveButton } from './save_button'
import { ExportDropdown } from './export/dropdown'
import { useStore } from '@/store'

interface EditorHeaderProps {
  filePath: string
  isSplitView: boolean
  onInsertSnippet: (snippet: string) => void
  onExport: () => void
  onToggleTheme: () => void
  onToggleSplitView: () => void
}

interface AdvancedItem {
  icon?: ReactElement
  component?: ReactElement
  snippet?: string
  title?: string
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  // filePath,
  isSplitView,
  onInsertSnippet,
  //onExport,
  onToggleTheme,
  onToggleSplitView
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const latex = useStore((state) => state.latex)
  const setLatex = useStore((state) => state.actions.setLatex)

  const openSettings = () => setIsSettingsOpen(true)
  const closeSettings = () => setIsSettingsOpen(false)

  const handleInsertFrontMatter = (frontMatter: string) => {
    onInsertSnippet(frontMatter)
  }

  const insertSnippet = (snippet: string) => {
    onInsertSnippet(snippet)
  }

  // Grouped snippets (removed unused calendar and math snippets)
  const basicFormatting = [
    {
      icon: <HashtagIcon className="h-4 w-4" />,
      snippet: '# Heading\n',
      title: 'Heading'
    },
    {
      icon: <BoldIcon className="h-4 w-4" />,
      snippet: '**bold text**',
      title: 'Bold'
    },
    {
      icon: <ItalicIcon className="h-4 w-4" />,
      snippet: '*italic text*',
      title: 'Italic'
    },
    {
      icon: <EyeSlashIcon className="h-4 w-4" />,
      snippet: '~~strikethrough~~',
      title: 'Strikethrough'
    }
  ]

  const lists = [
    {
      icon: <ListBulletIcon className="h-4 w-4" />,
      snippet: '- List item 1\n- List item 2\n- List item 3\n',
      title: 'Unordered List'
    },
    {
      icon: <QueueListIcon className="h-4 w-4" />,
      snippet: '1. List item\n2. List item\n3. List item\n',
      title: 'Ordered List'
    },
    {
      icon: <CheckCircleIcon className="h-4 w-4" />,
      snippet: '- [ ] Task item 1\n- [ ] Task item 2\n- [x] Task item 3\n',
      title: 'Task List'
    }
  ]

  const media = [
    {
      icon: <PhotoIcon className="h-4 w-4" />,
      snippet: '![Sample GIF](https://media.giphy.com/media/3o7aD2sa1g0g0g0g0g/giphy.gif)',
      title: 'Image'
    },
    {
      icon: <VideoCameraIcon className="h-4 w-4" />,
      snippet: `{% youtube dQw4w9WgXcQ %}`,
      title: 'YouTube Video'
    },
    {
      icon: <LinkIcon className="h-4 w-4" />,
      snippet: '[Wikipedia](https://en.wikipedia.org/wiki/Main_Page)',
      title: 'Link'
    }
  ]

  const advanced: AdvancedItem[] = [
    {
      icon: <CodeBracketIcon className="h-4 w-4" />,
      snippet:
        '```ts\n// Works in both TypeScript and JavaScript\ntype Result = "pass" | "fail"\n\nfunction verify(result) {\n  if (result === "pass") {\n    console.log("Passed")\n  } else {\n    console.log("Failed")\n  }\n}\n```',
      title: 'Code Block'
    },
    {
      icon: <CommandLineIcon className="h-4 w-4" />,
      snippet: '`const place_holder = () => return 42;`',
      title: 'Inline Code'
    },
    {
      icon: <ChatBubbleLeftRightIcon className="h-4 w-4" />,
      snippet: "> You are what you do, not what you say you'll do. - Carl Jung",
      title: 'Blockquote'
    },
    {
      icon: <TableCellsIcon className="h-4 w-4" />,
      snippet: `| Syntax      | Description |\n| ----------- | ----------- |\n| Header      | Title       |\n| Paragraph   | Text        |\n`,
      title: 'Table'
    },
    {
      icon: <MermaidDiagramMenu onInsert={insertSnippet} />,
      title: 'Diagrams'
    },
    {
      icon: (
        <Tooltip delay={80}>
          {latex ? (
            <EyeIcon
              className="h-4 w-4 text-blue-500 dark:text-blue-400"
              onClick={() => setLatex(false)}
            />
          ) : (
            <CalculatorIcon
              className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              onClick={() => setLatex(true)}
            />
          )}
        </Tooltip>
      ),
      title: latex ? 'Preview' : 'LaTeX Math'
    }
  ]

  return (
    <div className="border-b p-[0.3rem] pl-10 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
      {/* Left-aligned formatting icons */}
      <div className="flex items-center space-x-2">
        {basicFormatting.map((item, index) => (
          <Tooltip text={item.title} delay={80} key={index}>
            <button
              onClick={() => insertSnippet(item.snippet)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              {item.icon}
            </button>
          </Tooltip>
        ))}

        {lists.map((item, index) => (
          <Tooltip text={item.title} delay={80} key={index}>
            <button
              onClick={() => insertSnippet(item.snippet)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              {item.icon}
            </button>
          </Tooltip>
        ))}

        {media.map((item, index) => (
          <Tooltip text={item.title} delay={80} key={index}>
            <button
              onClick={() => insertSnippet(item.snippet)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              {item.icon}
            </button>
          </Tooltip>
        ))}

        {advanced.map((item, index) => {
          if (item.component) {
            return <div key={index}>{item.component}</div>
          }
          return (
            <Tooltip key={index} text={item.title!} delay={40}>
              <button
                onClick={() => item.snippet && insertSnippet(item.snippet)}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
              >
                {item.icon}
              </button>
            </Tooltip>
          )
        })}
      </div>

      {/* Right-aligned controls */}
      <div className="flex items-center space-x-2">
        {/* First separator */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Front Matter Button */}
        <Tooltip text="front matter" delay={80}>
          <button
            onClick={openSettings}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <ClipboardDocumentCheckIcon className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* Theme Toggle */}
        <ThemeToggle onToggle={onToggleTheme} />

        {/* View controls */}
        <Tooltip text={isSplitView ? 'editor only' : 'split view'} delay={80}>
          <button
            onClick={onToggleSplitView}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
          >
            {isSplitView ? (
              <ViewColumnsIcon className="h-4 w-4" />
            ) : (
              <RectangleGroupIcon className="h-4 w-4" />
            )}
          </button>
        </Tooltip>

        {/* Second separator */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Action buttons */}
        <SaveButton showText />

        <ExportDropdown />
      </div>

      {/* Settings Modal */}
      <FrontMatterSettings
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        onInsertFrontMatter={handleInsertFrontMatter}
      />
    </div>
  )
}

export default EditorHeader
