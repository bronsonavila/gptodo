import { Typography } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import type { ThoughtItem } from '../context/AppContext'

interface ThoughtsDisplayProps {
  thoughts: ThoughtItem[]
  isLoading: boolean
}

export const ThoughtsDisplay = ({ thoughts, isLoading }: ThoughtsDisplayProps) => {
  if (!isLoading) return null

  const latestThought = thoughts[thoughts.length - 1]
  const displayText = `${latestThought ? latestThought.heading : 'Uploading'}…`

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        initial={{ opacity: 0, y: 5 }}
        key={displayText}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Typography
          align="center"
          sx={{ color: 'text.secondary', fontSize: '0.875rem', fontStyle: 'italic', opacity: 0.7 }}
        >
          {displayText}
        </Typography>
      </motion.div>
    </AnimatePresence>
  )
}
