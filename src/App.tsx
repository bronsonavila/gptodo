import { cacheService } from './services/cacheService'
import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material'
import { darkTheme } from './theme'
import { ErrorNotification } from './components/ErrorNotification'
import { ErrorState } from './types'
import { Footer } from './components/Footer'
import { ImageUpload } from './components/ImageUpload'
import { TodoList } from './components/TodoList'
import { useEffect, useState } from 'react'
import { useImageProcessing } from './hooks/useImageProcessing'
import { useTodoList } from './hooks/useTodoList'

const App = () => {
  const [error, setError] = useState<ErrorState>({ show: false, message: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { todos, handleToggle, updateTodos, clearTodos } = useTodoList()
  const { error: processingError, processImage, hasCachedImage } = useImageProcessing(updateTodos)

  const handleClear = async () => {
    try {
      await cacheService.clearCache()

      clearTodos()
      setSelectedImage(null)
    } catch (error) {
      console.error('Error clearing data:', error)

      handleError('Failed to clear data. Please try again.')
    }
  }

  const handleError = (message: string) => setError({ show: true, message })

  const processSelectedFile = async (file: File): Promise<void> => {
    clearTodos()
    setIsLoading(true)
    setSelectedImage(null)

    const reader = new FileReader()

    reader.onload = async event => {
      const imageData = event.target?.result as string

      try {
        const base64Image = imageData.split(',')[1]

        if (!base64Image) throw new Error('Failed to process the image')

        await cacheService.cacheImage(imageData)

        await processImage(base64Image)

        setSelectedImage(imageData)
      } catch (error) {
        console.error('Error:', error)

        handleError('Failed to process the image. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      handleError('Error reading the file. Please try again.')
      setIsLoading(false)
    }

    reader.readAsDataURL(file)
  }

  // Load cached image on initial render
  useEffect(() => {
    if (!hasCachedImage) return
    ;(async () => {
      try {
        const hasMismatchedState = await cacheService.hasMismatchedCacheState()

        if (hasMismatchedState) {
          await cacheService.clearCachedImages()

          return
        }

        const cachedImage = await cacheService.getCachedImage()

        if (cachedImage) setSelectedImage(cachedImage)
      } catch (err) {
        console.error('Error loading cached image:', err)
      }
    })()
  }, [hasCachedImage])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Box sx={{ minHeight: '100dvh', position: 'relative', width: '100%' }}>
        <Container
          maxWidth="md"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '100dvh',
            px: 2,
            py: 2.5
          }}
        >
          <ImageUpload
            isLoading={isLoading}
            onClear={handleClear}
            onError={handleError}
            onImageSelect={processSelectedFile}
            selectedImage={selectedImage}
          />

          {!isLoading && selectedImage !== null && todos.length > 0 && (
            <TodoList todos={todos} onToggle={handleToggle} />
          )}

          <ErrorNotification
            error={error}
            processingError={processingError}
            onClose={() => setError({ show: false, message: '' })}
          />
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  )
}

export default App
