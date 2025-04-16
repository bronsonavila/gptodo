import {
  Container,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  CircularProgress,
  ThemeProvider,
  CssBaseline,
  Checkbox
} from '@mui/material'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { darkTheme } from './theme'
import { toTitleCase } from './utils'
import { useState, useRef } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

interface TextItem {
  text: string
  completed: boolean
}

const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: { text: { type: SchemaType.STRING, description: 'A line of text extracted from the image' } },
        required: ['text']
      }
    }
  }
})

const App = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<TextItem[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()

      reader.onload = e => {
        setSelectedImage(e.target?.result as string)
        setResponse([])
      }

      reader.readAsDataURL(file)
    }
  }

  const handleToggle = (index: number) => {
    setResponse(previous => previous.map((item, i) => (i === index ? { ...item, completed: !item.completed } : item)))
  }

  const handleApiCall = async () => {
    if (!selectedImage) return

    try {
      setIsLoading(true)

      const base64Image = selectedImage.split(',')[1]

      if (!base64Image) throw new Error('Failed to process the image')

      const { response } = await model.generateContent([
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        'Extract all the text from this image and return it as a JSON array of strings. Each string should be a separate line of text from the image. Only include text that is clearly visible and readable.'
      ])

      const jsonResponse = JSON.parse(response.text())

      setResponse(jsonResponse.map((item: { text: string }) => ({ text: toTitleCase(item.text), completed: false })))
    } catch (error) {
      console.error('Error:', error)

      setResponse([{ text: 'Error occurred while processing the image', completed: false }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Gemini Vision API Demo
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />

          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<CloudUploadIcon />}
            size="small"
          >
            {selectedImage ? 'Image uploaded' : 'Upload image'}
          </Button>

          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Uploaded"
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                borderRadius: 1,
                boxShadow: 3
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            onClick={handleApiCall}
            disabled={isLoading || !selectedImage}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Processing...' : 'Extract Text from Image'}
          </Button>
        </Box>

        {response.length > 0 && (
          <Paper elevation={3} sx={{ p: 2 }}>
            <List dense sx={{ py: 0 }}>
              {response.map((item, index) => (
                <ListItem
                  key={index}
                  disablePadding
                  sx={{
                    py: 0.5,
                    textDecoration: item.completed ? 'line-through' : 'none',
                    opacity: item.completed ? 0.7 : 1
                  }}
                >
                  <ListItemButton onClick={() => handleToggle(index)} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox edge="start" checked={item.completed} tabIndex={-1} disableRipple size="small" />
                    </ListItemIcon>

                    <ListItemText primary={item.text} primaryTypographyProps={{ variant: 'body2' }} />
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
