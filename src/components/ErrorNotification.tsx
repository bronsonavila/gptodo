import { Alert, Snackbar } from '@mui/material'
import { ErrorState } from '../types'

interface ErrorNotificationProps {
  error: ErrorState
  onClose: () => void
  processingError: string | null
}

export const ErrorNotification = ({ error, onClose, processingError }: ErrorNotificationProps) => {
  return (
    <Snackbar
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      autoHideDuration={6000}
      onClose={onClose}
      open={error.show || !!processingError}
    >
      <Alert onClose={onClose} severity="error" sx={{ width: '100%' }}>
        {error.message || processingError}
      </Alert>
    </Snackbar>
  )
}
