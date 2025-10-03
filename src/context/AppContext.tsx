import { cacheService } from '../services/cacheService'
import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import { ErrorState, TodoItem } from '../types'
import { useImageProcessing } from '../hooks/useImageProcessing'
import { useTodoList } from '../hooks/useTodoList'
import { useCaptureSupport } from '../hooks/useCaptureSupport'

interface AppContextType {
  // State
  error: ErrorState
  hasCacheBeenChecked: boolean
  isCaptureCheckComplete: boolean
  isLoading: boolean
  isSortedAlphabetically: boolean
  processingError: string | null
  selectedImage: string | null
  supportsCaptureAttribute: boolean
  thoughts: ThoughtItem[]
  todos: TodoItem[]

  // Handlers
  clearError: () => void
  handleClear: () => Promise<void>
  handleError: (message: string) => void
  handleToggleSort: () => void
  handleToggleTodo: (index: number) => void
  processSelectedFile: (file: File) => Promise<void>
}

export interface ThoughtItem {
  heading: string
  body: string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<ErrorState>({ show: false, message: '' })
  const [hasCacheBeenChecked, setHasCacheBeenChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [thoughts, setThoughts] = useState<ThoughtItem[]>([])

  const { isSortedAlphabetically, todos, clearTodos, handleToggleSort, handleToggleTodo, resetSort, updateTodos } =
    useTodoList()
  const { error: processingError, clearProcessingError, processImage } = useImageProcessing(updateTodos)
  const { isCaptureCheckComplete, supportsCaptureAttribute } = useCaptureSupport()

  const clearError = useCallback(() => {
    setError({ show: false, message: '' })

    clearProcessingError?.()
  }, [clearProcessingError])

  const handleError = useCallback((message: string) => setError({ show: true, message }), [])

  const checkCacheOnInitialRender = useCallback(async () => {
    try {
      const hasMismatchedState = await cacheService.hasMismatchedCacheState()

      if (hasMismatchedState) {
        await cacheService.clearCachedImage()

        return
      }

      const cachedImage = await cacheService.getCachedImage()

      if (cachedImage) setSelectedImage(cachedImage)
    } catch (error) {
      console.error('Error checking cache:', error)

      handleError('Failed to load cached data.')
    } finally {
      setHasCacheBeenChecked(true)
    }
  }, [handleError])

  const handleClear = useCallback(async () => {
    try {
      await cacheService.clearCache()

      clearTodos()
      setSelectedImage(null)
      setError({ show: false, message: '' })
      setThoughts([])
    } catch (error) {
      console.error('Error clearing data:', error)

      handleError('Failed to clear data. Please try again.')
    }
  }, [clearTodos, handleError])

  const processSelectedFile = useCallback(
    async (file: File): Promise<void> => {
      clearTodos()
      resetSort()
      setIsLoading(true)
      setSelectedImage(null)
      setError({ show: false, message: '' })
      setThoughts([])

      const reader = new FileReader()

      reader.onload = async event => {
        const imageData = event.target?.result as string

        try {
          const base64Image = imageData.split(',')[1]

          if (!base64Image) throw new Error('Failed to process the image data.')

          await cacheService.cacheImage(imageData)

          await processImage(base64Image, {
            onThought: (thought: string) => {
              const boldMatch = thought.match(/\*\*(.*?)\*\*/) // Extract bold text (text between **...**) as heading.

              if (boldMatch && boldMatch.length > 1) {
                const heading = boldMatch[1]
                const body = thought.replace(/\*\*.*?\*\*/, '').trim() // Remove heading to get the body.

                setThoughts(previous => [...previous, { heading, body }])
              }
            },
            onAnswer: () => {
              // Answer chunks are handled internally by the API.
            }
          })

          setSelectedImage(imageData)
        } catch (error) {
          console.error('Error processing selected file:', error)

          const message = error instanceof Error ? error.message : 'Failed to process the image. Please try again.'

          handleError(message)

          await cacheService.clearCachedImage()
        } finally {
          setIsLoading(false)
        }
      }

      reader.onerror = error => {
        console.error('Error reading file:', error)

        handleError('Error reading the file. Please try again.')
        setIsLoading(false)
      }

      reader.readAsDataURL(file)
    },
    [clearTodos, handleError, processImage, resetSort]
  )

  useEffect(() => {
    checkCacheOnInitialRender()
  }, [checkCacheOnInitialRender])

  const contextValue: AppContextType = {
    error,
    hasCacheBeenChecked,
    isCaptureCheckComplete,
    isLoading,
    isSortedAlphabetically,
    processingError,
    selectedImage,
    supportsCaptureAttribute,
    thoughts,
    todos,
    clearError,
    handleClear,
    handleError,
    handleToggleSort,
    handleToggleTodo,
    processSelectedFile
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)

  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider')

  return context
}
