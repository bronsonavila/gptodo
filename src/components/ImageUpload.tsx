import { Box, styled, Fab } from '@mui/material'
import { Loader } from './Loader'
import { useCaptureSupport } from '../hooks/useCaptureSupport'
import { useRef } from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const MAX_FILE_SIZE = 6 * 1024 * 1024 // 6MB

interface ImageUploadProps {
  isLoading: boolean
  onClear: () => void
  onError?: (message: string) => void
  onImageSelect: (file: File) => Promise<void>
  selectedImage: string | null
}

interface UploadButtonProps {
  capture?: 'user' | 'environment'
  icon: React.ReactNode
  inputRef: React.RefObject<HTMLInputElement | null>
  label: string
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const ClearButton = ({ onClick }: { onClick: () => void }) => (
  <Fab
    color="error"
    onClick={onClick}
    role={undefined}
    sx={{ height: '44px', p: 0, minWidth: '44px' }}
    tabIndex={0}
    variant="extended"
  >
    <ClearIcon />
  </Fab>
)

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
      onError?.('File size should be less than 6MB')

      return false
    }

    return true
  }

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, justifyContent: 'center', minHeight: '44px' }}>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <UploadButton
              icon={<CloudUploadIcon sx={{ mr: 1 }} />}
              inputRef={fileInputRef}
              label="Upload"
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
        <Box
          alt="Uploaded image"
          component="img"
          src={selectedImage}
          sx={{ borderRadius: 1, maxHeight: 'calc(50vh)', maxWidth: '500px', mt: 0.5, objectFit: 'contain' }}
        />
      )}
    </Box>
  )
}

const UploadButton = ({ capture, icon, inputRef, label, onFileSelect }: UploadButtonProps) => (
  <Fab component="label" role={undefined} sx={{ height: 'auto', minHeight: '44px' }} tabIndex={-1} variant="extended">
    {icon}

    {label}

    <VisuallyHiddenInput
      accept={ALLOWED_FILE_TYPES.join(',')}
      capture={capture}
      onChange={onFileSelect}
      ref={inputRef}
      type="file"
    />
  </Fab>
)

const VisuallyHiddenInput = styled('input')({
  bottom: 0,
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  left: 0,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1
})
