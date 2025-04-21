import { cacheService } from '../services/cacheService'
import { TodoItem } from '../types'
import { useState, useEffect, useMemo, useCallback } from 'react'

export const useTodoList = () => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [isSortedAlphabetically, setIsSortedAlphabetically] = useState(false)
  const [todos, setTodos] = useState<TodoItem[]>([])

  // Sort todos:
  // 1. Separate into incomplete and complete
  // 2. If sorting alphabetically, sort each group by text
  // 3. If not sorting alphabetically, sort each group by index
  // 4. Concatenate incomplete and complete groups
  const sortedTodos = useMemo(() => {
    const incomplete = todos.filter(todo => !todo.completed)
    const complete = todos.filter(todo => todo.completed)

    const sortFn = isSortedAlphabetically
      ? (a: TodoItem, b: TodoItem) => a.text.localeCompare(b.text)
      : (a: TodoItem, b: TodoItem) => a.index - b.index

    incomplete.sort(sortFn)
    complete.sort(sortFn)

    return [...incomplete, ...complete]
  }, [todos, isSortedAlphabetically])

  const clearTodos = () => setTodos([])

  const handleToggleSort = useCallback(() => setIsSortedAlphabetically(prev => !prev), [])

  const handleToggleTodo = (todoIndex: number) => {
    setTodos(previousTodos =>
      previousTodos.map(todo => (todo.index === todoIndex ? { ...todo, completed: !todo.completed } : todo))
    )
  }

  const resetSort = useCallback(() => setIsSortedAlphabetically(false), [])

  const updateTodos = (newTodos: TodoItem[]) => setTodos(newTodos)

  // Load cached todo list on initial render
  useEffect(() => {
    ;(async () => {
      try {
        const cachedSortState = await cacheService.getCachedSortState()
        const cachedTodos = await cacheService.getCachedTodoList()

        if (cachedSortState !== null) setIsSortedAlphabetically(cachedSortState)

        if (cachedTodos && cachedTodos.length > 0) setTodos(cachedTodos)
      } catch (error) {
        console.error('Error loading cached data:', error)
      } finally {
        setInitialLoadComplete(true)
      }
    })()
  }, [])

  // Cache sort state whenever it changes
  useEffect(() => {
    if (!initialLoadComplete) return

    cacheService.cacheSortState(isSortedAlphabetically)
  }, [isSortedAlphabetically, initialLoadComplete])

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

  return {
    isSortedAlphabetically,
    todos: sortedTodos,
    clearTodos,
    handleToggleTodo,
    handleToggleSort,
    resetSort,
    updateTodos
  }
}
