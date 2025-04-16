import { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, Box, Button, Container, Typography } from '@mui/material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Something went wrong
            </Typography>

            <Alert severity="error" sx={{ mb: 2 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Alert>

            <Button
              variant="contained"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              Try again
            </Button>
          </Box>
        </Container>
      )
    }

    return this.props.children
  }
}
