import { TodoItem } from '../types'

const CACHE_NAME = 'gptodo-cache'
const IMAGE_KEY = 'current-image'
const SORT_STATE_KEY = 'sort-state'
const TODO_LIST_KEY = 'todo-list'

/**
 * Cache service to store and retrieve images and todo lists using CacheStorage
 */
export const cacheService = {
  async cacheImage(imageData: string): Promise<void> {
    const cache = await this.initCache()

    await this.clearCachedImage()

    await cache.delete(TODO_LIST_KEY)

    const fullImageData = imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`
    const imageResponse = new Response(fullImageData)

    await cache.put(IMAGE_KEY, imageResponse)
  },

  async cacheSortState(isSorted: boolean): Promise<void> {
    const cache = await this.initCache()
    const sortStateResponse = new Response(JSON.stringify(isSorted))

    await cache.put(SORT_STATE_KEY, sortStateResponse)
  },

  async cacheTodoList(todos: TodoItem[]): Promise<void> {
    const cache = await this.initCache()
    const todoResponse = new Response(JSON.stringify(todos))

    await cache.put(TODO_LIST_KEY, todoResponse)
  },

  async clearCache(): Promise<void> {
    try {
      await caches.delete(CACHE_NAME)
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  },

  async clearCachedImage(): Promise<void> {
    const cache = await this.initCache()

    await cache.delete(IMAGE_KEY)
  },

  async getCachedImage(): Promise<string | null> {
    try {
      const cache = await this.initCache()
      const response = await cache.match(IMAGE_KEY)

      if (!response) return null

      return await response.text()
    } catch (error) {
      console.error('Error retrieving cached image:', error)

      return null
    }
  },

  async getCachedSortState(): Promise<boolean | null> {
    try {
      const cache = await this.initCache()
      const response = await cache.match(SORT_STATE_KEY)

      if (!response) return false

      const sortStateData = await response.text()

      return JSON.parse(sortStateData)
    } catch (error) {
      console.error('Error retrieving cached sort state:', error)

      return false
    }
  },

  async getCachedTodoList(): Promise<TodoItem[] | null> {
    try {
      const cache = await this.initCache()
      const response = await cache.match(TODO_LIST_KEY)

      if (!response) return null

      const todoData = await response.text()

      return JSON.parse(todoData)
    } catch (error) {
      console.error('Error retrieving cached todo list:', error)

      return null
    }
  },

  // Handles cases where a user refreshes or leaves the page while the image is processing
  async hasMismatchedCacheState(): Promise<boolean> {
    try {
      const cachedImage = await this.getCachedImage()
      const cachedTodos = await this.getCachedTodoList()

      // Return true if we have an image but no todos
      return cachedImage !== null && (!cachedTodos || cachedTodos.length === 0)
    } catch (error) {
      console.error('Error checking cache state:', error)

      return false
    }
  },

  async initCache(): Promise<Cache> {
    return await caches.open(CACHE_NAME)
  }
}
