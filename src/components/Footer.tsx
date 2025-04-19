import { Box, IconButton } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'

export const Footer = () => {
  return (
    <Box sx={{ bottom: 16, position: 'absolute', right: 16, zIndex: 1 }}>
      <IconButton
        aria-label="GitHub repository"
        color="inherit"
        component="a"
        href="https://github.com/bronsonavila/gptodo"
        rel="noopener noreferrer"
        size="small"
        sx={{ '&:hover': { opacity: 0.8 } }}
        target="_blank"
      >
        <GitHubIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}
