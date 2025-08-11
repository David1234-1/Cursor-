import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'

export default function GroupsChatPage(){
  const [groups, setGroups] = useState<any[]>([])
  const [sel, setSel] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState<any[]>([])

  useEffect(()=>{ loadGroups() },[])

  async function loadGroups(){
    const { data, error } = await supabase.from('groups').select('*').order('created_at',{ascending:false})
    if(error){ toast.error(error.message); return }
    setGroups(data || [])
  }

  async function createGroup(){
    const name = prompt('Nom du groupe ?')
    if(!name) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('groups').insert({ name, owner_id: user!.id }).select('*').single()
    if(error){ toast.error(error.message); return }
    await supabase.from('group_members').insert({ group_id: data.id, user_id: user!.id })
    setGroups(g=> [data, ...g])
  }

  useEffect(()=>{
    if(!sel) return
    loadMessages(sel.id)
    const channel = supabase.channel('messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `group_id=eq.${sel.id}` }, (payload) => {
      if(payload.eventType==='INSERT') setMessages(m=> [...m, payload.new])
    }).subscribe()
    return () => { channel.unsubscribe() }
  }, [sel?.id])

  async function loadMessages(groupId: string){
    const { data, error } = await supabase.from('messages').select('*').eq('group_id', groupId).order('created_at')
    if(!error) setMessages(data || [])
  }

  async function send(){
    if(!sel || !msg.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('messages').insert({ group_id: sel.id, user_id: user!.id, content: msg.trim() })
    setMsg('')
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4 app-card p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Groupes</div>
          <button className="app-button" onClick={createGroup}>Créer</button>
        </div>
        <div className="mt-3 space-y-2">
          {groups.map(g=> (
            <button key={g.id} onClick={()=> setSel(g)} className={`w-full text-left px-3 py-2 rounded-lg ${sel?.id===g.id? 'bg-neutral-100 dark:bg-neutral-800':''}`}>{g.name}</button>
          ))}
        </div>
      </div>
      <div className="col-span-8 app-card p-4">
        {!sel ? (
          <div>Sélectionnez un groupe</div>
        ) : (
          <div className="flex flex-col h-[600px]">
            <div className="font-semibold mb-2">{sel.name}</div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((m:any)=> (
                <div key={m.id} className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 w-fit max-w-[80%]">{m.content}</div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input className="app-input" placeholder="Votre message" value={msg} onChange={e=>setMsg(e.target.value)} />
              <button className="app-button" onClick={send}>Envoyer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}