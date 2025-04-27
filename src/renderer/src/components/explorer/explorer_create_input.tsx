import { FileIcon, FolderIcon } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import useCreateFile from '@/hooks/useCreateFile'
import { z } from 'zod'
import { useState, useEffect } from 'react'

interface CreationInputProps {
  type: 'file' | 'folder'
  value: string
  onChange: (value: string) => void
  onSubmit: (isValid: boolean) => void // Modified to accept validation status
  onBlur: () => void
  fileExtension?: string
}

const sqliteSafeNameSchema = z
  .string()
  .min(1, 'Name cannot be empty')
  .max(50, 'Name too long ')
  .regex(/^[a-zA-Z0-9_\-.]+$/, {
    message: 'Only letters, numbers, underscore (_), hyphen (-), and period (.) allowed'
  })
  .transform((val) => val.trim())

export const CreationInput = ({
  type,
  value,
  onChange,
  onSubmit,
  onBlur,
  fileExtension = ''
}: CreationInputProps) => {
  const Icon = type === 'file' ? FileIcon : FolderIcon
  const queryClient = useQueryClient()
  const createFileMutation = useCreateFile()
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Validate whenever value changes
  useEffect(() => {
    const baseName =
      type === 'file' ? value.replace(new RegExp(`\\${fileExtension || '.md'}$`), '') : value

    const validation = sqliteSafeNameSchema.safeParse(baseName)
    setIsValid(validation.success)

    // Only show error if user has attempted submission
    setError(hasAttemptedSubmit && !validation.success ? validation.error.errors[0].message : null)
  }, [value, type, fileExtension, hasAttemptedSubmit])

  const handleSubmit = () => {
    setHasAttemptedSubmit(true) // 👈 Mark that user tried to submit
    if (!isValid) return // Prevent submission if invalid

    if (type === 'file') {
      const finalName = value.endsWith(fileExtension || '.md')
        ? value
        : `${value}${fileExtension || '.md'}`

      createFileMutation.mutate(
        { name: finalName, content: '## hello world! \n\nstart writing here...' },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['file'] })
            onSubmit(true)
          },
          onError: (error) => {
            console.error('File creation failed:', error)
            onSubmit(false)
          }
        }
      )
    } else {
      onSubmit(true)
    }
  }

  // Handle blur by checking validation first
  const handleBlur = () => {
    if (!isValid) {
      setHasAttemptedSubmit(true) // 👈 Show errors on blur if invalid
      return // Don't proceed if invalid
    }
    onBlur()
    handleSubmit()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setHasAttemptedSubmit(true) // 👈 Show errors when pressing Enter
      handleSubmit()
    }
  }

  return (
    <div
      className="flex flex-col"
      onClick={(e) => e.stopPropagation()} // 👈 This prevents click from reaching parent
    >
      <div className="relative px-3 pl-6 pt-2 flex items-center bg-blue-100 dark:bg-blue-900">
        <Icon className="h-4 w-4 text-gray-800 dark:text-gray-200" />
        <input
          type="text"
          autoFocus
          className={`w-full px-2 py-1 text-sm focus:outline-none bg-transparent dark:text-white ${
            error ? '' : ''
          }`}
          placeholder={`${type}-name`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur} // Use our custom blur handler
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            if (type === 'file') {
              const dotIndex = e.target.value.lastIndexOf('.')
              if (dotIndex > 0) {
                e.target.setSelectionRange(0, dotIndex)
              }
            } else {
              e.target.select()
            }
          }}
        />
        {type === 'file' && fileExtension && (
          <span className="text-gray-900 dark:text-gray-300 ml-1">{fileExtension}</span>
        )}
      </div>
      <div className="absolute ml-6 mt-[-.5rem]">
        {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
      </div>
    </div>
  )
}
