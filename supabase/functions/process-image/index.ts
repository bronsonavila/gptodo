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

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://gptodo.app',
  'https://gptodo.netlify.app',
  'https://www.gptodo.app'
]

const CONFIG = {
  ai: {
    model: 'gemini-2.5-pro-preview-03-25',
    schema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING, description: 'A section of text extracted from the image' }
        },
        required: ['text']
      }
    }
  },
  prompt: `Extract text that appears to be items in a list based on the image's visual structure, following these guidelines:
1. Each distinct item identified as part of a visual list should be a separate entry in the JSON array.
2. Preserve the original order of the list items as they appear visually.
3. Include any text segment if it meets these criteria:
   - It is visually grouped and aligned with other items in a way that suggests a list (e.g., vertically stacked, similarly indented).
   - It is clearly legible and appears complete.
4. Exclude any text segment if:
   - It is clearly separate from the visual grouping of the list items (e.g., a title, a paragraph elsewhere on the image).
   - It is significantly obscured or too blurry to read reliably.
   - It is purely decorative or formatting symbols (like bullet points, checkboxes, lines - do not include these symbols in the extracted text).
5. Clean up the extracted text for each item by:
   - Trimming leading/trailing whitespace.
   - Correcting obvious typographical errors if possible without changing the meaning.
   - Removing any list markers (like numbers, letters, or symbols) that might precede the actual text content of the item.
6. If no text segments forming a list structure are found, return an empty array.`
}

serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin')
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)

  const corsHeaders = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0]
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

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

    const textList: string[] = Array.isArray(jsonResponse)
      ? jsonResponse.map(item => item.text).filter(text => typeof text === 'string')
      : []

    return new Response(JSON.stringify(textList), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    const errorResponse: ErrorResponse = { error: error.message }

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
