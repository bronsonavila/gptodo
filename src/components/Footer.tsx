import { Box, IconButton } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'

export const Footer = () => {
  return (
    <Box
      sx={{
        bottom: 16,
        left: '50%',
        position: 'absolute',
        transform: 'translateX(-50%)',
        zIndex: 1
      }}
    >
      <IconButton
        aria-label="GitHub repository"
        color="inherit"
        onClick={() => window.open('https://github.com/bronsonavila/gptodo', '_blank')}
        size="small"
        sx={{ '&:hover': { opacity: 0.8 } }}
      >
        <GitHubIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}
