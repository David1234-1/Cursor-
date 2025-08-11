import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface EventItem {
  id: string
  title: string
  start_at: string
  end_at: string | null
  category: string | null
  color: string | null
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('start_at')
    if (!error && data) setEvents(data as any)
  }

  useEffect(() => {
    fetchEvents().finally(() => setLoading(false))
    const channel = supabase.channel('events-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const createEvent = async (arg: any) => {
    const title = prompt('Titre de l\'événement?')
    if (!title) return
    const { data: user } = await supabase.auth.getUser()
    const insert = {
      user_id: user.user?.id,
      title,
      start_at: arg.dateStr,
      end_at: null,
      category: null,
      color: '#0ea5e9',
    }
    const { data, error } = await supabase.from('events').insert(insert).select().single()
    if (error) alert('Erreur création: ' + error.message)
    else setEvents((e) => [...e, data as any])
  }

  const updateEvent = async (change: any) => {
    const { id, start, end } = change.event
    const { error } = await supabase.from('events').update({ start_at: start?.toISOString(), end_at: end?.toISOString() }).eq('id', id)
    if (error) alert('Erreur mise à jour: ' + error.message)
  }

  const deleteEvent = async (clickInfo: any) => {
    if (!confirm(`Supprimer "${clickInfo.event.title}" ?`)) return
    const { error } = await supabase.from('events').delete().eq('id', clickInfo.event.id)
    if (error) alert('Erreur suppression: ' + error.message)
  }

  const syncToGoogle = async (evt: any) => {
    const session = (await supabase.auth.getSession()).data.session
    const accessToken = (session as any)?.provider_token
    if (!accessToken) {
      alert('Pas de jeton Google. Reconnectez-vous via Google avec consentement offline.')
      return
    }
    const res = await fetch('/api/googleCalendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ action: 'insert', event: {
        summary: evt.title,
        start: { dateTime: evt.start_at },
        end: { dateTime: evt.end_at || evt.start_at },
      } }),
    })
    if (!res.ok) alert('Sync Google a échoué')
    else alert('Événement synchronisé sur Google Calendar')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Calendrier</h2>
        <button className="text-sm rounded-xl border px-3 py-1" onClick={() => events[0] && syncToGoogle(events[0])}>Sync Google (dernier)</button>
      </div>
      {!loading && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
          events={events.map(e => ({ id: e.id, title: e.title, start: e.start_at, end: e.end_at, backgroundColor: e.color || undefined }))}
          selectable
          selectMirror
          dateClick={createEvent}
          eventDrop={updateEvent}
          eventResize={updateEvent}
          eventClick={deleteEvent}
          height="auto"
        />
      )}
    </div>
  )
}