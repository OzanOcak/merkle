// hooks/useRenameFile.ts
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'

interface File {
  originalName: string
  newName: string
}

const API_URL = 'http://localhost:3001/api/file'

const renameFile = async ({
  originalName,
  newName
}: {
  originalName: string
  newName: string
}): Promise<File> => {
  const response = await axios.patch(
    `${API_URL}/${encodeURIComponent(originalName)}/rename`,
    { newName },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  // Check for error message in successful response
  if (response.data.error) {
    throw new Error(response.data.error)
  }

  return response.data
}

const useRenameFile = () => {
  return useMutation({
    mutationFn: renameFile,
    retry: 0,
    onError: (error: Error) => {
      console.error('Rename error:', error.message)
    }
  })
}

export default useRenameFile
