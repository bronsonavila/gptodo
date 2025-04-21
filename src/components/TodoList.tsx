import {
  Box,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Switch,
  Typography
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../context/AppContext'

const SHARED_MOTION_PROPS = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 5 },
  transition: { duration: 0.25, ease: 'easeOut' }
}

export const TodoList = () => {
  const { isLoading, isSortedAlphabetically, selectedImage, todos, handleToggleSort, handleToggleTodo } =
    useAppContext()

  if (isLoading || selectedImage === null) return null

  if (todos.length === 0) {
    return (
      <motion.div {...SHARED_MOTION_PROPS} style={{ width: '100%', maxWidth: '360px', margin: '20px auto 40px auto' }}>
        <Paper
          aria-label="Empty to-do list"
          elevation={2}
          role="region"
          sx={{ p: 3.5, textAlign: 'center', width: '100%' }}
        >
          <Typography color="text.secondary" variant="body1">
            No items found in your to-do list.
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
            Try uploading a clearer image or make sure your to-do list is visible in the picture.
          </Typography>
        </Paper>
      </motion.div>
    )
  }

  return (
    <motion.div {...SHARED_MOTION_PROPS} style={{ width: '100%', maxWidth: '500px', margin: '20px auto 40px auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.25 }}>
        <FormControlLabel
          control={<Switch checked={isSortedAlphabetically} onChange={handleToggleSort} size="small" />}
          label={<Typography sx={{ fontSize: '0.8rem', pl: 0.5 }}>Sort A–Z</Typography>}
          sx={{ mr: 0.5 }}
        />
      </Box>

      <Paper aria-label="Todo list" elevation={2} role="region" sx={{ p: 1.5, width: '100%' }}>
        <List sx={{ width: '100%', py: 0 }}>
          <AnimatePresence mode="popLayout">
            {todos.map(item => (
              <motion.li
                animate={{ opacity: item.completed ? 0.5 : 1 }}
                initial={{ opacity: item.completed ? 0.5 : 1 }}
                key={item.index}
                layout
                style={{ listStyle: 'none', textDecoration: item.completed ? 'line-through' : 'none' }}
                transition={{ type: 'spring', bounce: 0.125, visualDuration: 0.25 }}
              >
                <ListItem component="div" disablePadding>
                  <ListItemButton
                    aria-checked={item.completed}
                    onClick={() => handleToggleTodo(item.index)}
                    role="checkbox"
                    sx={{ py: 0.75 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox checked={item.completed} edge="start" size="small" tabIndex={-1} />
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: '0.95rem' }} variant="body2">
                          {item.text}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </motion.li>
            ))}
          </AnimatePresence>
        </List>
      </Paper>
    </motion.div>
  )
}
