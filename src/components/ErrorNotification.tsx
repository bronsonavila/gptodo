import { Alert, Snackbar } from '@mui/material'
import { useAppContext } from '../context/AppContext'
import { useState, useEffect } from 'react'

export const ErrorNotification = () => {
  const { error, processingError, clearError } = useAppContext()
  const [message, setMessage] = useState<string>('')
  const isOpen = error.show || !!processingError

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return

    clearError()
  }

  useEffect(() => {
    if (isOpen) setMessage(error.message || processingError || '')
  }, [error.message, processingError, isOpen])

  return (
    <Snackbar
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      autoHideDuration={6000}
      onClose={handleClose}
      open={isOpen}
    >
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}
