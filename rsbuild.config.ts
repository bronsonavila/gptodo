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

    tags: [
      {
        tag: 'script',
        attrs: {
          async: true,
          src: `https://www.googletagmanager.com/gtag/js?id=${process.env.PUBLIC_GOOGLE_ANALYTICS_ID}`
        }
      },
      {
        tag: 'script',
        children: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.PUBLIC_GOOGLE_ANALYTICS_ID}');
        `
      }
    ],

    title: 'GPTodo'
  },

  plugins: [pluginReact()]
})
