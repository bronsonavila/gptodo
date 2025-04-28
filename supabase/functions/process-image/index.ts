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

const AI_MODEL = 'gemini-2.5-pro-preview-03-25'

const AI_PROMPT = `Extract text representing items in a list from the image, following these guidelines:
0. First, analyze the overall image content to understand its context. Use this understanding to help interpret the list structure in the following steps.
1. Identify potential list items: Look for text lines arranged with consistent visual alignment (e.g., vertical stacking, similar starting positions, shared indentation). Consider each such line as a potential distinct list item initially.
2. Treat each potential item line (from step 1) as separate by default. Combine a line with the preceding one ONLY if:
   a) It is clearly indented relative to the preceding line, OR
   b) It is unambiguously part of a single wrapped sentence, OR
   c) It is NOT indented but its content and close proximity clearly suggest it is a subordinate description/detail for the item on the preceding line, AND the preceding line appears to be the primary item name/title.
   Do NOT combine distinct, self-contained items (like names in a simple list) that are merely stacked vertically, even if aligned or within the same visual block.
3. Each distinct list item identified should be a separate entry in the JSON array.
4. Preserve the original order of the list items.
5. Include all text segments that maintain the identified visual alignment (ignore color differences) and are legible, regardless of content differences (e.g., capitalization, text vs. numbers), unless explicitly excluded by the rules below.
6. Exclude text only if it is:
   - Positioned or formatted in a way that *clearly breaks* the main visual flow or alignment of the list (e.g., a distinct title or subheading set significantly apart or formatted differently, a paragraph elsewhere).
   - Part of legends, keys, footnotes, or disclaimers explaining symbols or terms, even if visually arranged in a list-like manner.
   - Significantly obscured or too blurry to read reliably.
   - Purely decorative or formatting symbols (e.g., bullet points, horizontal lines).
7. Clean up the extracted text for each item by:
   - Trimming leading/trailing whitespace.
   - Joining multi-line text belonging to the same item with a single space.
   - Correcting obvious typographical errors if possible without changing the meaning.
8. If no text forming a list structure is found, return an empty array.`

const AI_SCHEMA = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      text: { type: SchemaType.STRING, description: 'A section of text extracted from the image' }
    },
    required: ['text']
  }
}

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://gptodo.app',
  'https://gptodo.netlify.app',
  'https://www.gptodo.app'
]

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
      model: AI_MODEL,
      generationConfig: { responseMimeType: 'application/json', responseSchema: AI_SCHEMA, temperature: 0 }
    })

    const { response } = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
      AI_PROMPT
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
