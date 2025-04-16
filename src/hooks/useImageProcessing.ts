import { useState } from 'react'
import { processTodoImage } from '../services/api'
import type { TodoItem } from '../types'

export const useImageProcessing = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [todos, setTodos] = useState<TodoItem[]>([])

  const processImage = async (base64Image: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await processTodoImage(base64Image)

      setTodos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, todos, processImage }
}
