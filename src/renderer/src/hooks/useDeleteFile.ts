import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
//import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:3001/api/file'

const deleteFile = async (name: string): Promise<void> => {
  await axios.delete(`${API_URL}/${encodeURIComponent(name)}`)
}

export const useDeleteFile = () => {
  const queryClient = useQueryClient()
  // const navigate = useNavigate()

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['file'] })
      window.location.href = '/'
    },
    onError: (error) => {
      console.error('Failed to delete file:', error)
    }
  })
}
