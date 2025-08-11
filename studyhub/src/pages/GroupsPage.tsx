import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [currentGroup, setCurrentGroup] = useState<string | null>(null)

  const load = async () => {
    const { data } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
    setGroups(data || [])
  }

  useEffect(() => {
    load()
    const g = supabase.channel('groups').on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, load).subscribe()
    return () => { supabase.removeChannel(g) }
  }, [])

  const createGroup = async () => {
    const name = prompt('Nom du groupe ?')
    if (!name) return
    const { data: user } = await supabase.auth.getUser()
    const { error } = await supabase.from('groups').insert({ name, owner_id: user.user?.id })
    if (error) alert('Erreur création groupe: ' + error.message)
  }

  const openGroup = async (id: string) => {
    setCurrentGroup(id)
    const { data } = await supabase.from('messages').select('*').eq('group_id', id).order('created_at')
    setMessages(data || [])
    const ch = supabase.channel('messages-' + id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${id}` }, (payload) => setMessages(m => [...m, payload.new as any])).subscribe()
    return () => { supabase.removeChannel(ch) }
  }

  const send = async () => {
    if (!currentGroup || !text.trim()) return
    const { data: user } = await supabase.auth.getUser()
    await supabase.from('messages').insert({ group_id: currentGroup, user_id: user.user?.id, content: text.trim() })
    setText('')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Groupes</h3>
          <button className="text-sm border rounded-xl px-2 py-1" onClick={createGroup}>Créer</button>
        </div>
        <ul className="space-y-1">
          {groups.map(g => (
            <li key={g.id}><button className="w-full text-left hover:underline" onClick={() => openGroup(g.id)}>{g.name}</button></li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3 flex flex-col">
        <div className="flex-1 overflow-auto space-y-2">
          {messages.map(m => (
            <div key={m.id} className="text-sm opacity-90">{m.content}</div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} className="flex-1 border rounded-xl px-3 py-2 bg-transparent" placeholder="Votre message..." />
          <button onClick={send} className="rounded-xl bg-black text-white px-4">Envoyer</button>
        </div>
      </div>
    </div>
  )
}