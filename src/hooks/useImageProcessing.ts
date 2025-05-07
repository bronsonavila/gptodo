import { processTodoImage } from '../services/api'
import { useState, useCallback } from 'react'
import type { TodoItem } from '../types'

export const useImageProcessing = (onProcessSuccess: (todos: TodoItem[]) => void) => {
  const [error, setError] = useState<string | null>(null)

  const clearProcessingError = useCallback(() => setError(null), [])

  const processImage = async (base64Image: string) => {
    setError(null)

    try {
      const data = await processTodoImage(base64Image)

      onProcessSuccess(data)

      return data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')

      throw error
    }
  }

  return { error, clearProcessingError, processImage }
}
