import { Box, CircularProgress, styled, Fab } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { useCaptureSupport } from '../hooks/useCaptureSupport'
import { useRef } from 'react'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ImageUploadProps {
  isLoading: boolean
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  selectedImage: string | null
}

interface UploadButtonProps {
  capture?: 'user' | 'environment'
  color: 'primary' | 'secondary'
  icon: React.ReactNode
  inputRef: React.RefObject<HTMLInputElement | null>
  label: string
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const ImageUpload = ({ isLoading, onImageUpload, selectedImage }: ImageUploadProps) => {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supportsCaptureAttribute = useCaptureSupport()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    onImageUpload(event)

    // Reset the file input value to allow re-uploading the same file
    if (event.target) event.target.value = ''
  }

  return (
    <Box sx={{ mb: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, width: '100%' }}>
      {isLoading ? (
        <CircularProgress size={52} thickness={4} />
      ) : supportsCaptureAttribute ? (
        <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <UploadButton
            color="primary"
            icon={<CloudUploadIcon sx={{ mr: 1 }} />}
            inputRef={fileInputRef}
            label="Upload"
            onImageUpload={handleImageUpload}
          />

          <UploadButton
            capture="environment"
            color="secondary"
            icon={<PhotoCameraIcon sx={{ mr: 1 }} />}
            inputRef={cameraInputRef}
            label="Camera"
            onImageUpload={handleImageUpload}
          />
        </Box>
      ) : (
        <UploadButton
          color="primary"
          icon={<CloudUploadIcon sx={{ mr: 1 }} />}
          inputRef={fileInputRef}
          label="Upload"
          onImageUpload={handleImageUpload}
        />
      )}

      {selectedImage && !isLoading && (
        <Box
          alt="Uploaded todo list"
          component="img"
          src={selectedImage}
          sx={{ borderRadius: 1, boxShadow: 2, maxHeight: 220, maxWidth: '100%', mt: 0.5, objectFit: 'contain' }}
        />
      )}
    </Box>
  )
}

const UploadButton = ({ capture, color, icon, inputRef, label, onImageUpload }: UploadButtonProps) => (
  <Fab
    color={color}
    component="label"
    role={undefined}
    sx={{ height: 'auto', minHeight: '44px', px: 2.5, py: 0.75 }}
    tabIndex={-1}
    variant="extended"
  >
    {icon}

    {label}

    <VisuallyHiddenInput
      accept={ALLOWED_FILE_TYPES.join(',')}
      capture={capture}
      onChange={onImageUpload}
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
