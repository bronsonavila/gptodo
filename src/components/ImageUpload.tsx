import { Box, Paper, Typography } from '@mui/material'
import { ClearButton } from './ClearButton'
import { Loader } from './Loader'
import { motion } from 'framer-motion'
import { ThoughtsDisplay } from './ThoughtsDisplay'
import { UploadButton, ALLOWED_FILE_TYPES } from './UploadButton'
import { useAppContext } from '../context/AppContext'
import { useRef, useCallback } from 'react'
import PermMediaIcon from '@mui/icons-material/PermMedia'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

const MAX_FILE_SIZE_IN_MB = 10

export const ImageUpload = () => {
  const {
    isLoading,
    selectedImage,
    supportsCaptureAttribute,
    thoughts,
    handleClear,
    handleError,
    processSelectedFile
  } = useAppContext()

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): boolean => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        handleError('Please upload a valid image file (JPEG, PNG, or WebP)')

        return false
      }

      if (file.size > MAX_FILE_SIZE_IN_MB * 1024 * 1024) {
        handleError(`File size should be less than ${MAX_FILE_SIZE_IN_MB}MB`)

        return false
      }

      return true
    },
    [handleError]
  )

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (file && validateFile(file)) {
        processSelectedFile(file).catch(error => {
          console.error('Error during file processing chain:', error)

          handleError('An error occurred while processing the image.')
        })
      }

      // Reset the file input value to allow re-uploading the same file
      if (event.target) event.target.value = ''
    },
    [validateFile, processSelectedFile, handleError]
  )

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {!isLoading && selectedImage === null && (
        <Typography align="center" sx={{ opacity: 0.7 }}>
          Select a photo of your to-do list
        </Typography>
      )}

      <Box sx={{ alignContent: 'center', justifyItems: 'center', position: 'relative', width: '100%' }}>
        {isLoading ? (
          <>
            <Loader />

            <Box sx={{ left: 0, position: 'absolute', right: 0, top: '60px' }}>
              <ThoughtsDisplay isLoading={isLoading} thoughts={thoughts} />
            </Box>
          </>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={!isLoading && selectedImage === null ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
            style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <UploadButton
              icon={<PermMediaIcon sx={{ mr: 1 }} />}
              inputRef={fileInputRef}
              label="Browse"
              onFileSelect={handleFileSelect}
            />

            {supportsCaptureAttribute && (
              <UploadButton
                capture="environment"
                icon={<PhotoCameraIcon sx={{ mr: 1 }} />}
                inputRef={cameraInputRef}
                label="Camera"
                onFileSelect={handleFileSelect}
              />
            )}

            {selectedImage && <ClearButton onClick={handleClear} />}
          </motion.div>
        )}
      </Box>

      {selectedImage && !isLoading && (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          style={{ width: '100%', maxWidth: '500px', marginTop: '4px' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Paper elevation={2} sx={{ borderRadius: 1, overflow: 'hidden', width: '100%' }}>
            <Box
              alt="Uploaded image"
              component="img"
              src={selectedImage}
              sx={{ display: 'block', maxHeight: 'calc(50vh)', maxWidth: '100%', objectFit: 'contain', width: '100%' }}
            />
          </Paper>
        </motion.div>
      )}
    </Box>
  )
}
