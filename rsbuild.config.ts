import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  html: {
    favicon: './public/favicon.svg',
    meta: {
      author: 'Bronson Avila',
      description: 'GPTodo uses AI to convert photos of handwritten or typed to-do lists into interactive checklists.',
      keywords: 'ai, checklist, gemini, image recognition, list, todo, vision'
    },
    title: 'GPTodo'
  },

  plugins: [pluginReact()]
})
