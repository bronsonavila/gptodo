import { TodoItem } from '../types'

export class APIError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'APIError'
  }
}

export interface StreamCallbacks {
  onThought?: (thought: string) => void
  onAnswer?: (answer: string) => void
}

interface SSEData {
  error?: string
  thought?: boolean
  text?: string
}

const handleResponseError = async (response: Response): Promise<void> => {
  try {
    const errorData = await response.json()

    if (errorData.error && errorData.error.includes('503 Service Unavailable')) {
      throw new APIError('The AI model is currently overloaded. Please try again in a few minutes.')
    }

    if (errorData.error) {
      throw new APIError('AI service unavailable. Please try again later.')
    }
  } catch (error) {
    if (error instanceof APIError) throw error
  }

  throw new APIError('Failed to process image')
}

const parseSSELine = (line: string, callbacks?: StreamCallbacks): string => {
  if (!line.trim() || !line.startsWith('data: ')) return ''

  const data = line.slice(6) // Remove 'data: ' prefix.

  if (data === '[DONE]') return ''

  try {
    const parsed: SSEData = JSON.parse(data)

    if (parsed.error) throw new APIError(parsed.error)

    if (parsed.thought && parsed.text && callbacks?.onThought) {
      callbacks.onThought(parsed.text)

      return ''
    } else if (!parsed.thought && parsed.text) {
      if (callbacks?.onAnswer) callbacks.onAnswer(parsed.text)

      return parsed.text
    }
  } catch (error) {
    if (error instanceof APIError) throw error

    console.error('Error parsing SSE data:', error)
  }

  return ''
}

const processStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  callbacks?: StreamCallbacks
): Promise<string> => {
  const decoder = new TextDecoder()

  let buffer = ''
  let fullAnswer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')

      buffer = lines.pop() || '' // Keep incomplete line in buffer.

      for (const line of lines) {
        fullAnswer += parseSSELine(line, callbacks)
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullAnswer
}

const parseFinalResponse = (jsonString: string): TodoItem[] => {
  if (!jsonString) throw new APIError('No response received from the AI model')

  try {
    const jsonResponse = JSON.parse(jsonString)
    const textList: string[] = Array.isArray(jsonResponse)
      ? jsonResponse.map(item => item.text).filter(text => typeof text === 'string')
      : []

    return textList.map((text, index) => ({ completed: false, index, text }))
  } catch (error) {
    console.error('Error parsing final response:', error)

    throw new APIError('Failed to parse AI response')
  }
}

export const processTodoImage = async (base64Image: string, callbacks?: StreamCallbacks): Promise<TodoItem[]> => {
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

  if (!response.ok) await handleResponseError(response)

  const reader = response.body?.getReader()

  if (!reader) throw new APIError('Failed to read response stream')

  const fullAnswer = await processStream(reader, callbacks)

  return parseFinalResponse(fullAnswer)
}
