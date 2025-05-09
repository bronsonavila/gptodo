import { TodoItem } from '../types'

export class APIError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'APIError'
  }
}

export const processTodoImage = async (base64Image: string): Promise<TodoItem[]> => {
  const response = await fetch(
    `https://${import.meta.env.PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/process-image`,
    {
      body: JSON.stringify({ base64Image }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`
      },
      method: 'POST'
    }
  )

  if (!response.ok) {
    try {
      const errorData = await response.json()

      if (errorData.error && errorData.error.includes('503 Service Unavailable')) {
        throw new APIError('The AI model is currently overloaded. Please try again in a few minutes.')
      }

      if (errorData.error) throw new APIError('AI service unavailable. Please try again later.')
    } catch (error) {
      if (error instanceof APIError) throw error
    }

    throw new APIError('Failed to process image')
  }

  const textList: string[] = await response.json()

  const todos: TodoItem[] = textList.map((text, index) => ({ completed: false, index, text }))

  return todos
}
