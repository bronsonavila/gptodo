// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { GoogleGenerativeAI, SchemaType } from 'npm:@google/generative-ai@0.24.0'

interface ErrorResponse {
  error: string
}

interface ImageProcessingRequest {
  base64Image: string
}

interface TodoItem {
  text: string
  completed: boolean
}

const CONFIG = {
  ai: {
    model: 'gemini-2.5-pro-preview-03-25',
    schema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING, description: 'A line of text extracted from the image' }
        },
        required: ['text']
      }
    }
  },
  cors: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
  },
  prompt: `Extract all text from this image following these guidelines:
1. Each line of text should be a separate item in the JSON array
2. Preserve the original line breaks and order of the text
3. Only include text that is clearly legible and complete
4. Ignore any text that is:
   - Partially obscured
   - Too blurry to read
   - Part of the background or decorative elements (including bullet points, checkboxes, and other formatting symbols)
5. Clean up the text by:
   - Removing extra whitespace
   - Fixing obvious typos
6. If the text appears to be a list, maintain the list structure in the output, but remove any bullet points`
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CONFIG.cors })

  try {
    const { base64Image } = (await req.json()) as ImageProcessingRequest

    if (!base64Image) throw new Error('No image provided')

    // @ts-ignore
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')

    const model = genAI.getGenerativeModel({
      model: CONFIG.ai.model,
      generationConfig: { responseMimeType: 'application/json', responseSchema: CONFIG.ai.schema }
    })

    const { response } = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
      CONFIG.prompt
    ])

    const jsonResponse = JSON.parse(response.text())

    const transformedResponse: TodoItem[] = jsonResponse.map(item => ({ text: item.text, completed: false }))

    return new Response(JSON.stringify(transformedResponse), {
      headers: { ...CONFIG.cors, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    const errorResponse: ErrorResponse = { error: error.message }

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...CONFIG.cors, 'Content-Type': 'application/json' }
    })
  }
})
