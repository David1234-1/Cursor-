import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'

interface DbEvent { id: string; title: string; start_at: string; end_at: string | null; color: string | null; category: string | null; details: any }

export default function CalendarPage(){
  const [events, setEvents] = useState<DbEvent[]>([])
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [googleAccessToken, setGoogleAccessToken] = useState<string|null>(null)

  useEffect(()=>{ load() },[])

  async function load(){
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return
    const { data, error } = await supabase.from('events').select('*').eq('user_id', user.id).order('start_at')
    if(error) toast.error(error.message)
    setEvents((data as any) || [])

    // Try get Google token from identities
    const { data: s } = await supabase.auth.getSession()
    const identities = s.session?.user?.identities || []
    const google = identities.find((i: any) => i.provider === 'google')
    const token = google?.identity_data?.access_token || null
    setGoogleAccessToken(token)
    setGoogleEnabled(Boolean(token))
  }

  async function createEvent(arg: any){
    const title = prompt('Titre de l\'événement ?')
    if(!title) return
    const { data: { user } } = await supabase.auth.getUser()
    const payload = { title, start_at: arg.startStr, end_at: arg.endStr, color: '#0A84FF', category: 'Révision', user_id: user!.id }
    const { data, error } = await supabase.from('events').insert(payload).select('*').single()
    if(error){ toast.error(error.message); return }
    setEvents(prev=>[...prev, data as any])

    if(googleEnabled && googleAccessToken){
      try {
        await fetch('/api/google-calendar', {
          method: 'POST', headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ accessToken: googleAccessToken, action:'create', event: { summary: title, start: { dateTime: arg.startStr }, end: { dateTime: arg.endStr } } })
        })
      } catch (e:any) {
        console.warn(e)
      }
    }
  }

  async function updateEvent(changeInfo: any){
    const id = changeInfo.event.id
    const start_at = changeInfo.event.start?.toISOString() || null
    const end_at = changeInfo.event.end?.toISOString() || null
    const { error } = await supabase.from('events').update({ start_at, end_at }).eq('id', id)
    if(error) toast.error(error.message)
  }

  async function deleteEvent(clickInfo: any){
    if(!confirm('Supprimer cet événement ?')) return
    const id = clickInfo.event.id
    const { error } = await supabase.from('events').delete().eq('id', id)
    if(error){ toast.error(error.message); return }
    setEvents(prev => prev.filter(e=> e.id !== id))
  }

  const fcEvents = useMemo(()=> events.map(e=>({ id: e.id, title: e.title, start: e.start_at, end: e.end_at || undefined, color: e.color || undefined })), [events])

  return (
    <div className="app-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xl font-semibold">Calendrier</div>
          <div className="text-sm text-neutral-500">Créer, déplacer, supprimer des événements</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Google Calendar</span>
          <input type="checkbox" checked={googleEnabled} onChange={()=> setGoogleEnabled(s=>!s)} />
        </div>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
        selectable
        editable
        events={fcEvents}
        select={createEvent}
        eventChange={updateEvent}
        eventClick={deleteEvent}
        height={720}
      />
    </div>
  )
}