import ClearIcon from '@mui/icons-material/Clear'
import { Fab } from '@mui/material'

interface ClearButtonProps {
  onClick: () => void
}

export const ClearButton = ({ onClick }: ClearButtonProps) => (
  <Fab
    color="error"
    onClick={onClick}
    role={undefined}
    sx={{ height: '44px', minWidth: '44px', p: 0 }}
    tabIndex={0}
    variant="extended"
  >
    <ClearIcon />
  </Fab>
)
