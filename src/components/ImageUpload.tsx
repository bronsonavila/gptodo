import { Box, Paper, Typography } from '@mui/material'
import { ClearButton } from './ClearButton'
import { Loader } from './Loader'
import { UploadButton, ALLOWED_FILE_TYPES } from './UploadButton'
import { useCaptureSupport } from '../hooks/useCaptureSupport'
import { useRef } from 'react'
import PermMediaIcon from '@mui/icons-material/PermMedia'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface ImageUploadProps {
  isLoading: boolean
  onClear: () => void
  onError?: (message: string) => void
  onImageSelect: (file: File) => Promise<void>
  selectedImage: string | null
}

export const ImageUpload = ({ isLoading, onClear, onError, onImageSelect, selectedImage }: ImageUploadProps) => {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supportsCaptureAttribute = useCaptureSupport()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file && validateFile(file)) {
      onImageSelect(file).catch(() => onError?.('An error occurred while processing the image.'))
    }

    // Reset the file input value to allow re-uploading the same file
    if (event.target) event.target.value = ''
  }

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      onError?.('Please upload a valid image file (JPEG, PNG, or WebP)')

      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      onError?.('File size should be less than 10MB')

      return false
    }

    return true
  }

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {!isLoading && selectedImage === null && (
        <Typography align="center" sx={{ opacity: 0.7 }}>
          Select a photo of your to-do list
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, justifyContent: 'center', minHeight: '44px' }}>
        {isLoading ? (
          <Loader />
        ) : (
          <>
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

            {selectedImage && <ClearButton onClick={onClear} />}
          </>
        )}
      </Box>

      {selectedImage && !isLoading && (
        <Paper elevation={2} sx={{ borderRadius: 1, maxWidth: '500px', mt: 0.5, overflow: 'hidden', width: '100%' }}>
          <Box
            alt="Uploaded image"
            component="img"
            src={selectedImage}
            sx={{ display: 'block', maxHeight: 'calc(50vh)', maxWidth: '100%', objectFit: 'contain', width: '100%' }}
          />
        </Paper>
      )}
    </Box>
  )
}
