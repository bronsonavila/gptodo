# GPTodo

GPTodo uses AI to convert photos of handwritten or typed todo lists into interactive digital checklists.

[Live Demo (WIP)](https://gptodo.app)

### The Problem

I have a dry erase board on my refrigerator where I write down groceries to buy. When I go shopping, I take a photo of the board, but I can't mark items off in the photo. This makes it hard to track what I've already picked up.

### The Solution

GPTodo converts my shopping list photo into an interactive checklist. I take a picture of my whiteboard, upload it, and check off items as I shop.

---

### Technical Overview

- Frontend: React with TypeScript
- Build System: Rsbuild
- Backend: Supabase Edge Functions running on Deno runtime
  - `process-image`: Uses Google Gemini AI to extract text from images
- AI Integration: Google Gemini AI for image processing and text extraction
- Deployment: Netlify
