import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI, SchemaType } from 'npm:@google/generative-ai@0.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { base64Image } = await req.json()

    if (!base64Image) throw new Error('No image provided')

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro-preview-03-25',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              text: { type: SchemaType.STRING, description: 'A line of text extracted from the image' }
            },
            required: ['text']
          }
        }
      }
    })

    const { response } = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
      `Extract all text from this image following these guidelines:
1. Each line of text should be a separate item in the JSON array
2. Preserve the original line breaks and order of the text
3. Only include text that is clearly legible and complete
4. Ignore any text that is:
   - Partially obscured
   - Too blurry to read
   - Written in a different language
   - Part of the background or decorative elements
5. Clean up the text by:
   - Removing extra whitespace
   - Fixing obvious typos
   - Standardizing bullet points or checkboxes to a consistent format
6. If the text appears to be a list, maintain the list structure in the output`
    ])

    const jsonResponse = JSON.parse(response.text())
    const transformedResponse = jsonResponse.map(item => ({ text: item.text, completed: false }))

    return new Response(JSON.stringify(transformedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
