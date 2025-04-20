import { cacheService } from '../services/cacheService'
import { TodoItem } from '../types'
import { useState, useEffect, useMemo } from 'react'

export const useTodoList = () => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [todos, setTodos] = useState<TodoItem[]>([])

  // Sort todos: incomplete first, then by index
  const sortedTodos = useMemo(
    () => [...todos].sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0) || a.index - b.index),
    [todos]
  )

  const clearTodos = () => setTodos([])

  const handleToggle = (todoIndex: number) => {
    setTodos(previousTodos =>
      previousTodos.map(todo => (todo.index === todoIndex ? { ...todo, completed: !todo.completed } : todo))
    )
  }

  const updateTodos = (newTodos: TodoItem[]) => setTodos(newTodos)

  // Load cached todo list on initial render
  useEffect(() => {
    ;(async () => {
      try {
        const cachedTodos = await cacheService.getCachedTodoList()

        if (cachedTodos && cachedTodos.length > 0) setTodos(cachedTodos)
      } catch (error) {
        console.error('Error loading cached todos:', error)
      } finally {
        setInitialLoadComplete(true)
      }
    })()
  }, [])

  // Cache todos whenever they change
  useEffect(() => {
    // Prevent premature cache operations until initial load is done
    if (!initialLoadComplete) return

    if (todos.length > 0) {
      cacheService.cacheTodoList(todos)
    } else {
      // If the list becomes empty *after* loading, clear the entire cache (image + todos)
      cacheService.clearCache()
    }
  }, [todos, initialLoadComplete])

  return { todos: sortedTodos, clearTodos, handleToggle, updateTodos }
}
