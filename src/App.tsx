import {
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
  ThemeProvider,
  Typography
} from '@mui/material'
import { darkTheme } from './theme'
import { useState, useRef } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

interface TextItem {
  text: string
  completed: boolean
}

const App = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<TextItem[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()

      reader.onload = async event => {
        const imageData = event.target?.result as string

        setSelectedImage(imageData)
        setResponse([])

        try {
          setIsLoading(true)

          const base64Image = imageData.split(',')[1]

          if (!base64Image) throw new Error('Failed to process the image')

          const response = await fetch(
            `https://${import.meta.env.PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/process-image`,
            {
              body: JSON.stringify({ base64Image }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`
              },
              method: 'POST'
            }
          )

          if (!response.ok) throw new Error('Failed to process image')

          const data = await response.json()

          setResponse(data)
        } catch (error) {
          console.error('Error:', error)

          setResponse([{ text: 'Error occurred while processing the image', completed: false }])
        } finally {
          setIsLoading(false)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const handleToggle = (index: number) => {
    setResponse(previous => previous.map((item, i) => (i === index ? { ...item, completed: !item.completed } : item)))
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
          GPTodo
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <input
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
            type="file"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            size="small"
            startIcon={
              isLoading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon fontSize="small" />
            }
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 200 }}
          >
            {isLoading ? 'Processing...' : 'Upload Image'}
          </Button>

          {selectedImage && !isLoading && (
            <Box
              alt="Uploaded"
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

        {response.length > 0 && (
          <Paper elevation={2} sx={{ p: 1 }}>
            <List dense sx={{ py: 0 }}>
              {response.map((item, index) => (
                <ListItem
                  disablePadding
                  key={index}
                  sx={{
                    py: 0.25,
                    textDecoration: item.completed ? 'line-through' : 'none',
                    opacity: item.completed ? 0.7 : 1
                  }}
                >
                  <ListItemButton onClick={() => handleToggle(index)} sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Checkbox edge="start" checked={item.completed} tabIndex={-1} disableRipple size="small" />
                    </ListItemIcon>

                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { fontSize: '0.875rem' }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default App
