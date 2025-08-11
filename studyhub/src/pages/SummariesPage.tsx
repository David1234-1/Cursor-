import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'

export default function SummariesPage(){
  const [items, setItems] = useState<any[]>([])
  useEffect(()=>{ load() },[])
  async function load(){
    const { data, error } = await supabase.from('summaries').select('*, courses(title)').order('created_at',{ascending:false})
    if(error) toast.error(error.message)
    setItems(data as any || [])
  }
  return (
    <div className="space-y-4">
      {items.map(i=> (
        <div key={i.id} className="app-card p-5">
          <div className="font-semibold">{i.courses?.title || 'Cours'}</div>
          <div className="text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap mt-2">{i.content}</div>
        </div>
      ))}
    </div>
  )
}