// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { GoogleGenAI } from 'npm:@google/genai@1.3.0'

interface ErrorResponse {
  error: string
}

interface ImageProcessingRequest {
  base64Image: string
}

const AI_MODEL = 'gemini-2.5-pro'

const AI_PROMPT = `Extract text representing items in a list from the image, following these guidelines:
1. First, analyze the overall image content to understand its context. Use this understanding to help interpret the list structure in the following steps. CRITICAL: Look for repeating patterns where a visually prominent element (bold, larger, or differently formatted) is followed by subordinate descriptive text. These form single logical units and must be combined into one list item.
2. Identify potential list items: Look for text lines arranged with consistent visual alignment (e.g., vertical stacking, similar starting positions, shared indentation). When analyzing structure, consider dot leaders (sequences of dots like "......" or "• • •" that visually connect text) as indicators of list formatting, but these should not appear in the final extracted text. CRUCIAL: Identify visual hierarchy cues such as font size, weight (bold vs regular), color, and formatting differences. When you see a repeating pattern where prominent text is followed by subordinate text, treat each primary-plus-subordinate group as ONE complete list item.
3. Before determining final list items, analyze the repeating structure: If multiple sections follow the pattern of [Primary Text] followed immediately by [Subordinate Text], this indicates each primary element and ALL its subordinate content should be merged into a single list item. Examples of primary elements: bold headings, larger text, capitalized labels. Examples of subordinate elements: regular weight text, smaller font, descriptive details, italicized text positioned directly below the primary element.
4. Combine lines into single list items when:
   a) A line is clearly indented relative to the preceding line, OR
   b) It is unambiguously part of a single wrapped sentence, OR
   c) The line uses subordinate visual formatting (lighter weight, smaller size, different style) and appears directly below a primary element (bold, larger, or prominent) that serves as a label or heading. ALL such subordinate content should be appended to the primary element to form one complete list item.
   Do NOT treat visually subordinate descriptive text as a separate item when it appears directly beneath a primary label.
5. Each distinct list item identified should be a separate entry in the array.
6. Preserve the original order of the list items.
7. Include all text segments that maintain the identified visual alignment (ignore color differences) and are legible, regardless of content differences (e.g., capitalization, text vs. numbers), unless explicitly excluded by the rules below.
8. Exclude text only if it is:
   - Positioned or formatted in a way that *clearly breaks* the main visual flow or alignment of the list (e.g., a distinct title or subheading set significantly apart or formatted differently, a paragraph elsewhere).
   - Part of legends, keys, footnotes, or disclaimers explaining symbols or terms, even if visually arranged in a list-like manner.
   - Significantly obscured or too blurry to read reliably.
   - Purely decorative or formatting symbols (e.g., bullet points, horizontal lines).
9. Clean up the extracted text for each item by:
   - Trimming leading/trailing whitespace.
   - Joining multi-line text belonging to the same item with a single space.
   - Correcting obvious typographical errors if possible without changing the meaning.
   - Removing dot leaders (sequences of dots, periods, or similar characters used as visual guides, such as "........" or "• • •") that appear between text elements.
10. If no text forming a list structure is found, return an empty array.

Return your response as an array where each element is an object with a "text" property containing the extracted list item.`

const AI_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: { text: { type: 'STRING', description: 'A section of text extracted from the image' } },
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
    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') || '' })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: AI_MODEL,
            contents: [
              {
                role: 'user',
                parts: [{ inlineData: { data: base64Image, mimeType: 'image/jpeg' } }, { text: AI_PROMPT }]
              }
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: AI_SCHEMA,
              temperature: 0,
              thinkingConfig: {
                includeThoughts: true,
                thinkingBudget: 1024
              }
            }
          })

          for await (const chunk of response) {
            const candidate = chunk.candidates?.[0]

            if (!candidate) continue

            const parts = candidate.content?.parts

            if (!parts || !Array.isArray(parts)) continue // Parts may not be iterable (undefined, null, or non-array).

            for (const part of parts) {
              if (!part.text) continue

              const eventData = { thought: part.thought || false, text: part.text }

              const sseMessage = `data: ${JSON.stringify(eventData)}\n\n`

              controller.enqueue(encoder.encode(sseMessage))
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          const errorData = { error: error.message }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    })
  } catch (error) {
    const errorResponse: ErrorResponse = { error: error.message }

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
