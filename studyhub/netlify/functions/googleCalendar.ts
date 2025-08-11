import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }
  const auth = event.headers['authorization'] || ''
  const accessToken = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!accessToken) return { statusCode: 401, body: 'Missing access token' }
  const body = JSON.parse(event.body || '{}')

  const { action, event: ev } = body
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

  if (action === 'insert') {
    const res = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(ev) })
    const data = await res.text()
    return { statusCode: res.status, body: data }
  }

  return { statusCode: 400, body: 'Unknown action' }
}