import { processTodoImage } from '../services/api'
import { useState } from 'react'
import type { TodoItem } from '../types'

export const useImageProcessing = (onProcessSuccess: (todos: TodoItem[]) => void) => {
  const [error, setError] = useState<string | null>(null)

  const processImage = async (base64Image: string) => {
    setError(null)

    try {
      const data = await processTodoImage(base64Image)

      onProcessSuccess(data)

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')

      throw err
    }
  }

  return { error, processImage }
}
