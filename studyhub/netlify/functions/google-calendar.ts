import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if(event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }
  try {
    const { accessToken, action, event: ev } = JSON.parse(event.body || '{}')
    if(!accessToken) return { statusCode: 400, body: 'Missing accessToken' }

    if(action === 'create'){
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(ev)
      })
      const data = await res.json()
      if(!res.ok) return { statusCode: res.status, body: JSON.stringify(data) }
      return { statusCode: 200, body: JSON.stringify({ ok: true, id: data.id }) }
    }

    return { statusCode: 400, body: 'Unknown action' }
  } catch (e:any) {
    return { statusCode: 500, body: e.message || 'error' }
  }
}