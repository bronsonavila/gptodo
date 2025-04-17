import { cacheService } from '../services/cacheService'
import { processTodoImage } from '../services/api'
import { useEffect, useState } from 'react'
import type { TodoItem } from '../types'

export const useImageProcessing = (onProcessSuccess: (todos: TodoItem[]) => void) => {
  const [error, setError] = useState<string | null>(null)
  const [hasCachedImage, setHasCachedImage] = useState(false)

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

  // Check if we have a cached image on initial render
  useEffect(() => {
    ;(async () => {
      try {
        const cachedImage = await cacheService.getCachedImage()

        if (cachedImage) setHasCachedImage(true)
      } catch (err) {
        console.error('Error checking cached image:', err)
      }
    })()
  }, [])

  return { error, hasCachedImage, processImage }
}
