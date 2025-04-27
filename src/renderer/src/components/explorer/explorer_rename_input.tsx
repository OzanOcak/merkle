// components/explorer/inputs/RenameInput.tsx
import useRenameFile from '@/hooks/useRenameFile'
import { useStore } from '@/store'
import { useQueryClient } from '@tanstack/react-query'
import { FileIcon, FolderIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'

interface RenameInputProps {
  type: 'file' | 'folder'
  value: string
  oldValue?: string
  onChange: (value: string) => void
  onSubmit: () => void // This will close the input when called
  onBlur: () => void
  fileExtension?: string
  onRenameComplete?: (success: boolean) => void
  onSuccess?: () => void
}

const sqliteSafeNameSchema = z
  .string()
  .min(1, 'Name cannot be empty')
  .max(50, 'Name too long ')
  .regex(/^[a-zA-Z0-9_\-.]+$/, {
    message: 'Only letters, numbers, underscore (_), hyphen (-), and period (.) allowed'
  })
  .transform((val) => val.trim())

export const RenameInput = ({
  type,
  value,
  oldValue,
  onChange,
  onSubmit,
  onBlur,
  fileExtension = '',
  onRenameComplete, // Parent callback
  onSuccess
}: RenameInputProps) => {
  const Icon = type === 'file' ? FileIcon : FolderIcon
  const queryClient = useQueryClient()
  const renameFileMutation = useRenameFile()
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const setCurrentFile = useStore((state) => state.actions.setCurrentFile)

  // Validate whenever value changes
  useEffect(() => {
    const baseName =
      type === 'file' ? value.replace(new RegExp(`\\${fileExtension || '.md'}$`), '') : value

    const validation = sqliteSafeNameSchema.safeParse(baseName)
    console.log('validating...')

    setIsValid(validation.success)
    setError(validation.success ? null : validation.error.errors[0].message)
  }, [value, type, fileExtension])

  const handleSubmit = () => {
    if (!oldValue) return

    if (!isValid) {
      onSubmit() // Close even if invalid
      return
    }

    if (type === 'file') {
      const finalName = value.endsWith(fileExtension || '.md')
        ? value
        : `${value}${fileExtension || '.md'}`

      renameFileMutation.mutate(
        { originalName: oldValue!, newName: finalName },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['file'] })
            setCurrentFile(finalName) // update current file
            onSuccess?.() // Update parent state if needed
            onSubmit() // Close immediately after success
            onRenameComplete?.(true) // Notify parent of success
          },
          onError: (error) => {
            console.error('File rename error:', error)
            onSubmit() // Close on error too
            onRenameComplete?.(false) // Notify parent of failure
          }
        }
      )
    } else {
      onSubmit() // Close for folders
    }
  }

  // Handle blur by checking validation first
  const handleBlur = () => {
    handleSubmit()
    onBlur()
  }

  return (
    <div
      className="relative px-3 pl-6 pt-2 flex items-center bg-blue-100 dark:bg-blue-900"
      onClick={(e) => e.stopPropagation()} // 👈 This prevents click from reaching parent
    >
      <Icon className="h-4 w-4 text-gray-800 dark:text-gray-200" />
      <input
        type="text"
        autoFocus
        className="w-full px-2 py-1 text-sm bg-transparent focus:outline-none dark:text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit()
          } else if (e.key === 'Escape') {
            onSubmit() // Allow cancel with Escape
          }
        }}
        onFocus={(e) => {
          if (type === 'file') {
            const dotIndex = e.target.value.lastIndexOf('.')
            if (dotIndex > 0) {
              e.target.setSelectionRange(0, dotIndex)
            } else {
              e.target.select()
            }
          } else {
            e.target.select()
          }
        }}
      />
      {type === 'file' && fileExtension && (
        <span className="text-gray-900 dark:text-gray-300 ml-1">{fileExtension}</span>
      )}
      {error && (
        <div className="absolute ml-6 mt-[-.5rem]">
          <span className="text-red-500 text-xs mt-1">{error}</span>
        </div>
      )}
    </div>
  )
}
