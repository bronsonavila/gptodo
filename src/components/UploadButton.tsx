import { Fab, styled } from '@mui/material'
import React from 'react'

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface UploadButtonProps {
  capture?: 'user' | 'environment'
  icon: React.ReactNode
  inputRef: React.RefObject<HTMLInputElement | null>
  label: string
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const UploadButton = ({ capture, icon, inputRef, label, onFileSelect }: UploadButtonProps) => (
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
