import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'

interface Qcm { id:string; course_id:string; question:string; options:string[]; answer:number }

export default function QcmPage(){
  const [qcms, setQcms] = useState<Qcm[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [score, setScore] = useState(0)

  useEffect(()=>{ load() },[])
  async function load(){
    const { data, error } = await supabase.from('qcms').select('*').order('created_at',{ascending:false})
    if(error) toast.error(error.message)
    setQcms(data as any || [])
  }

  function onAnswer(i: number){
    if(selected!==null) return
    setSelected(i)
    if(i === qcms[idx].answer) setScore(s=>s+1)
  }

  function next(){ setIdx(i=> Math.min(i+1, qcms.length-1)); setSelected(null) }

  if(qcms.length===0) return <div className="p-4">Aucun QCM</div>
  const q = qcms[idx]

  return (
    <div className="max-w-2xl mx-auto app-card p-5">
      <div className="text-sm text-neutral-500 mb-2">Question {idx+1}/{qcms.length} — Score: {score}</div>
      <div className="text-lg font-semibold mb-3">{q.question}</div>
      <div className="space-y-2">
        {q.options.map((o, i)=> (
          <button key={i} onClick={()=>onAnswer(i)} className={`w-full text-left px-4 py-3 rounded-xl border ${selected===null? 'hover:bg-neutral-50 dark:hover:bg-neutral-800':''} ${selected!==null && i===q.answer ? 'border-green-500 bg-green-50/70 dark:bg-green-900/30' : ''} ${selected!==null && i===selected && i!==q.answer ? 'border-red-500 bg-red-50/70 dark:bg-red-900/30':''}`}>{o}</button>
        ))}
      </div>
      <div className="mt-4">
        <button onClick={next} className="app-button">Suivant</button>
      </div>
    </div>
  )
}