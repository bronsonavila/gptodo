import { Container, CssBaseline, ThemeProvider } from '@mui/material'
import { darkTheme } from './theme'
import { ErrorState, TodoItem } from './types'
import { useImageProcessing } from './hooks/useImageProcessing'
import { useState } from 'react'
import { ImageUpload } from './components/ImageUpload'
import { TodoList } from './components/TodoList'
import { ErrorNotification } from './components/ErrorNotification'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const MAX_FILE_SIZE = 6 * 1024 * 1024 // 6MB

const App = () => {
  const [error, setError] = useState<ErrorState>({ show: false, message: '' })
  const [hasProcessedImage, setHasProcessedImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { isLoading, error: processingError, todos, processImage, setTodos } = useImageProcessing()

  const handleError = (message: string) => setError({ show: true, message })

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file || !validateFile(file)) return

    setHasProcessedImage(false)

    setTodos([])

    const reader = new FileReader()

    reader.onload = async event => {
      const imageData = event.target?.result as string

      setSelectedImage(imageData)

      try {
        const base64Image = imageData.split(',')[1]

        if (!base64Image) throw new Error('Failed to process the image')

        await processImage(base64Image)

        setHasProcessedImage(true)
      } catch (error) {
        console.error('Error:', error)

        handleError('Failed to process the image. Please try again.')
      }
    }

    reader.onerror = () => handleError('Error reading the file. Please try again.')

    reader.readAsDataURL(file)
  }

  const handleToggle = (index: number) => {
    setTodos((prevTodos: TodoItem[]) => {
      const newTodos = [...prevTodos]

      newTodos[index] = { ...newTodos[index], completed: !newTodos[index].completed }

      return newTodos
    })
  }

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      handleError('Please upload a valid image file (JPEG, PNG, or WebP)')

      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      handleError('File size should be less than 6MB')

      return false
    }

    return true
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Container
        maxWidth="md"
        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', px: 2, py: 2.5 }}
      >
        <ImageUpload isLoading={isLoading} selectedImage={selectedImage} onImageUpload={handleImageUpload} />

        {hasProcessedImage && <TodoList todos={todos} onToggle={handleToggle} />}

        <ErrorNotification
          error={error}
          processingError={processingError}
          onClose={() => setError({ show: false, message: '' })}
        />
      </Container>
    </ThemeProvider>
  )
}

export default App
