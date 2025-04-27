// hooks/useExportFile.ts
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

export const useExportFile = () => {
  return useMutation({
    mutationFn: async (filename: string) => {
      const response = await axios.get(`/api/transfer/${filename}/export`, {
        responseType: 'blob'
      })
      return response.data
    }
  })
}
