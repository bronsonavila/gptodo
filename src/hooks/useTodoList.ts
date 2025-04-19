import { useState, useEffect } from 'react'
import { TodoItem } from '../types'
import { cacheService } from '../services/cacheService'

export const useTodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([])

  const clearTodos = () => setTodos([])

  const handleToggle = (index: number) => {
    setTodos((prevTodos: TodoItem[]) => {
      const newTodos = [...prevTodos]

      newTodos[index] = { ...newTodos[index], completed: !newTodos[index].completed }

      return newTodos
    })
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
      }
    })()
  }, [])

  // Cache todos whenever they change
  useEffect(() => {
    if (todos.length > 0) cacheService.cacheTodoList(todos)
  }, [todos])

  return { todos, clearTodos, handleToggle, updateTodos }
}
