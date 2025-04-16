import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  CssBaseline,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  ThemeProvider,
  Typography,
  styled
} from '@mui/material'
import { darkTheme } from './theme'
import { ErrorState, TodoItem } from './types'
import { useImageProcessing } from './hooks/useImageProcessing'
import { useState } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 6 * 1024 * 1024 // 6MB

const VisuallyHiddenInput = styled('input')({
  bottom: 0,
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  left: 0,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1
})

const App = () => {
  const [error, setError] = useState<ErrorState>({ show: false, message: '' })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { isLoading, error: processingError, todos, processImage, setTodos } = useImageProcessing()

  const handleError = (message: string) => setError({ show: true, message })

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file || !validateFile(file)) return

    const reader = new FileReader()

    reader.onload = async event => {
      const imageData = event.target?.result as string

      setSelectedImage(imageData)

      try {
        const base64Image = imageData.split(',')[1]

        if (!base64Image) throw new Error('Failed to process the image')

        await processImage(base64Image)
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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
          GPTodo
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Button
            component="label"
            disabled={isLoading}
            role={undefined}
            startIcon={
              isLoading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon fontSize="small" />
            }
            sx={{ minWidth: 200 }}
            tabIndex={-1}
            variant="contained"
          >
            {isLoading ? 'Processing...' : 'Upload Image'}

            <VisuallyHiddenInput
              accept={ALLOWED_FILE_TYPES.join(',')}
              capture="environment"
              onChange={handleImageUpload}
              type="file"
            />
          </Button>

          {selectedImage && !isLoading && (
            <Box
              alt="Uploaded todo list"
              component="img"
              src={selectedImage}
              sx={{
                borderRadius: 1,
                boxShadow: 2,
                maxHeight: 200,
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          )}
        </Box>

        {todos.length > 0 && (
          <Paper elevation={2} sx={{ p: 1 }} role="region" aria-label="Todo list">
            <List dense sx={{ py: 0 }}>
              {todos.map((item, index) => (
                <ListItem
                  disablePadding
                  key={index}
                  sx={{
                    opacity: item.completed ? 0.7 : 1,
                    py: 0.25,
                    textDecoration: item.completed ? 'line-through' : 'none'
                  }}
                >
                  <ListItemButton
                    aria-checked={item.completed}
                    onClick={() => handleToggle(index)}
                    role="checkbox"
                    sx={{ py: 0.25 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Checkbox edge="start" checked={item.completed} tabIndex={-1} disableRipple size="small" />
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {item.text}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={6000}
          onClose={() => setError({ show: false, message: '' })}
          open={error.show || !!processingError}
        >
          <Alert onClose={() => setError({ show: false, message: '' })} severity="error" sx={{ width: '100%' }}>
            {error.message || processingError}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  )
}

export default App
