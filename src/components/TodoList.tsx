import { Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material'
import { useAppContext } from '../context/AppContext'

export const TodoList = () => {
  const { isLoading, selectedImage, todos, handleToggle } = useAppContext()

  if (isLoading || selectedImage === null) return null

  if (todos.length === 0) {
    return (
      <Paper
        aria-label="Empty to-do list"
        elevation={2}
        role="region"
        sx={{ maxWidth: '360px', mb: 5, mt: 2.5, mx: 'auto', p: 3.5, textAlign: 'center' }}
      >
        <Typography color="text.secondary" variant="body1">
          No items found in your to-do list.
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1.5 }} variant="body2">
          Try uploading a clearer image or make sure your to-do list is visible in the picture.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper
      aria-label="Todo list"
      elevation={2}
      role="region"
      sx={{ maxWidth: '500px', mb: 5, mt: 2.5, mx: 'auto', p: 1.5, width: '100%' }}
    >
      <List sx={{ width: '100%', py: 0 }}>
        {todos.map((item, index) => (
          <ListItem
            disablePadding
            key={index}
            sx={{ opacity: item.completed ? 0.7 : 1, textDecoration: item.completed ? 'line-through' : 'none' }}
          >
            <ListItemButton
              aria-checked={item.completed}
              onClick={() => handleToggle(index)}
              role="checkbox"
              sx={{ py: 0.75 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox checked={item.completed} disableRipple edge="start" size="small" tabIndex={-1} />
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
        ))}
      </List>
    </Paper>
  )
}
