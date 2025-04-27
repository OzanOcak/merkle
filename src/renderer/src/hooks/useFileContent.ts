import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useContentStore } from '@/store/content-store'
import { useEffect } from 'react'

const API_URL = 'http://localhost:3001/api/file'

interface FileContentResponse {
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

const fetchFileContent = async (name: string | null): Promise<string> => {
  if (!name) return ''
  const response = await axios.get<FileContentResponse>(`${API_URL}/${encodeURIComponent(name)}`)
  return response.data.content
}

export const useFileContent = (name: string | null) => {
  const queryClient = useQueryClient()
  const setContent = useContentStore((state) => state.actions.setContent)

  const query = useQuery({
    queryKey: ['fileContent', name], // More specific key
    queryFn: () => fetchFileContent(name),
    enabled: !!name,
    staleTime: Infinity, // 👈 Never stale
    gcTime: Infinity, // 👈 Never garbage collect
    refetchOnMount: false // 👈 Never refetch on mount
    //staleTime: 1000 * 60 * 5 // 5 minutes cache
  })

  // Handle side effects with useEffect
  useEffect(() => {
    if (query.data !== undefined) {
      setContent(query.data)
    }
  }, [query.data, setContent])

  // Manual fetch function
  const manualFetch = async (fileName: string) => {
    try {
      const content = await queryClient.fetchQuery({
        queryKey: ['fileContent', fileName],
        queryFn: () => fetchFileContent(fileName)
      })
      setContent(content) // Manually update Zustand
      return content
    } catch (error) {
      console.error('Manual fetch failed:', error)
      throw error
    }
  }

  return {
    ...query,
    manualFetch,
    isLoading: query.isLoading && query.fetchStatus !== 'idle'
  }
}

/**
 
  const currentFileName = useStore(state => state.currentFile?.name)
  const setCurrentFile = useStore(state => state.actions.setCurrentFile)
  
  const { data: fileContent, isLoading, isError } = useFileContent(currentFileName ?? null)

  useEffect(() => {
    if (fileContent && currentFileName) {
      setCurrentFile(currentFileName, fileContent)
    }
  }, [fileContent, currentFileName, setCurrentFile])
 
 */
