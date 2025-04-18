import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material'
import { darkTheme } from './theme'
import { ErrorNotification } from './components/ErrorNotification'
import { Footer } from './components/Footer'
import { ImageUpload } from './components/ImageUpload'
import { TodoList } from './components/TodoList'
import { useAppContext } from './context/AppContext'

export const App = () => {
  const { isLoading, selectedImage, hasCacheBeenChecked } = useAppContext()

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {hasCacheBeenChecked && (
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
            <ImageUpload />

            {!isLoading && selectedImage !== null && <TodoList />}

            <ErrorNotification />
          </Container>

          <Footer />
        </Box>
      )}
    </ThemeProvider>
  )
}
