import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material'
import { darkTheme } from './theme'
import { ErrorNotification } from './components/ErrorNotification'
import { Footer } from './components/Footer'
import { ImageUpload } from './components/ImageUpload'
import { TodoList } from './components/TodoList'
import { useAppContext } from './context/AppContext'

export const App = () => {
  const { hasCacheBeenChecked, isCaptureCheckComplete, selectedImage, todos } = useAppContext()

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {hasCacheBeenChecked && isCaptureCheckComplete && (
        <Box sx={{ minHeight: '100dvh', position: 'relative', width: '100%' }}>
          <Container
            maxWidth="md"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: { xs: selectedImage && todos.length > 0 ? 'flex-start' : 'center', sm: 'center' },
              minHeight: '100dvh',
              px: 2,
              py: 2.5
            }}
          >
            <ImageUpload />

            {/* Allows scrolling short todo lists to the top of the viewport on mobile. */}
            <Box sx={{ minHeight: { xs: selectedImage && todos.length > 0 ? 'calc(100dvh - 20px)' : 0, sm: 0 } }}>
              <TodoList />
            </Box>

            <ErrorNotification />
          </Container>

          <Footer />
        </Box>
      )}
    </ThemeProvider>
  )
}
