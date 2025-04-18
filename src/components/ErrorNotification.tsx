import { Alert, Snackbar } from '@mui/material'
import { useAppContext } from '../context/AppContext'

export const ErrorNotification = () => {
  const { error, processingError, clearError } = useAppContext()

  return (
    <Snackbar
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      autoHideDuration={6000}
      onClose={clearError}
      open={error.show || !!processingError}
    >
      <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
        {error.message || processingError}
      </Alert>
    </Snackbar>
  )
}
