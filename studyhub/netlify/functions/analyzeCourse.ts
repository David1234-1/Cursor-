import type { Handler } from '@netlify/functions'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }
  const { content } = JSON.parse(event.body || '{}')
  if (!content) return { statusCode: 400, body: 'Missing content' }

  const prompt = `Tu es un assistant pédagogique. À partir du cours ci-dessous, génère: \n1) Un résumé (200-300 mots).\n2) 8 QCM (question, 4 options, index de la bonne réponse).\n3) 12 flashcards (front, back).\n\nCours:\n${content.slice(0, 8000)}`

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Réponds en JSON avec les clés: summary, qcms, flashcards' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  })

  const text = response.choices[0]?.message?.content || '{}'
  try {
    const json = JSON.parse(text)
    return { statusCode: 200, body: JSON.stringify(json) }
  } catch {
    return { statusCode: 200, body: JSON.stringify({ summary: text, qcms: [], flashcards: [] }) }
  }
}