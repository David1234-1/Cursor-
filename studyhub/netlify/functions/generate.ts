import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if(event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }
  try {
    const { content } = JSON.parse(event.body || '{}')
    if(!content) return { statusCode: 400, body: 'Missing content' }

    const openaiKey = process.env.OPENAI_API_KEY
    if(!openaiKey) return { statusCode: 500, body: 'Missing OPENAI_API_KEY' }

    const prompt = `Tu es un assistant pédagogique. À partir du cours suivant, génère:\n- Un résumé concis (200-300 mots)\n- 8 QCM (4 options, 1 correcte). Format JSON {question, options[4], answer:index}\n- 12 flashcards. Format JSON {front, back}\nCours:\n\n${content.substring(0, 12000)}`

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu rends du JSON strict: {"summary": string, "qcms": [...], "flashcards": [...]} et rien d\'autre.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    })

    const data = await resp.json()
    const text = data.choices?.[0]?.message?.content || ''

    // Try parse JSON; if fails, fallback minimal
    let parsed: any = {}
    try { parsed = JSON.parse(text) } catch { parsed = { summary: '', qcms: [], flashcards: [] } }

    return { statusCode: 200, body: JSON.stringify(parsed) }
  } catch (e:any) {
    return { statusCode: 500, body: e.message || 'error' }
  }
}