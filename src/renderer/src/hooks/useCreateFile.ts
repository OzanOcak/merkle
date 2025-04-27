// src/hooks/useCreateFile.ts
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'

interface File {
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

const API_URL = 'http://localhost:3001/api/file'

const createFile = async (file: { name: string; content: string }): Promise<File> => {
  const response = await axios.post(API_URL, file)
  return response.data
}

const useCreateFile = () => {
  return useMutation<File, Error, { name: string; content: string }>({
    mutationFn: createFile
  })
}

export default useCreateFile
