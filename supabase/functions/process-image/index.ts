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
  prompt: `Extract only list-formatted text from this image following these guidelines:
1. Each list item should be a separate item in the JSON array
2. Preserve the original order of the list items
3. Only include text that is:
   - Clearly part of a list or checklist
   - Clearly legible and complete
4. Ignore any text that is:
   - Not part of a list structure
   - Partially obscured
   - Too blurry to read
   - Part of the background or decorative elements (including bullet points, checkboxes, and other formatting symbols)
5. Clean up the text by:
   - Removing extra whitespace
   - Fixing obvious typos
   - Removing any list markers (bullet points, numbers, etc.)
6. If no list items are found, return an empty array`
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
