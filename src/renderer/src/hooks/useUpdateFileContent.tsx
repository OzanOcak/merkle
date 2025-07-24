import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const API_URL = 'http://localhost:3001/api/file'

interface UpdateFileParams {
  name: string
  content: string
}

interface FileResponse {
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

const updateFileContent = async ({ name, content }: UpdateFileParams): Promise<FileResponse> => {
  const response = await axios.put(`${API_URL}/${encodeURIComponent(name)}/content`, { content })
  return response.data
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useUpdateFileContent = () => {
  const queryClient = useQueryClient()

  return useMutation<FileResponse, Error, UpdateFileParams>({
    mutationFn: updateFileContent,
    // Optional: Add optimistic updates or side effects here
    onMutate: async (variables) => {
      // You could implement optimistic updates here if needed
      console.log('About to update file:', variables.name)
    },
    onError: (error) => {
      console.error('Error updating file:', error)
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fileContent', variables.name] })

      console.log('Successfully updated file:', data.name)
    }
  })
}
