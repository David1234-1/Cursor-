import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ExamPage(){
  const [qcms, setQcms] = useState<any[]>([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number|null>(null)
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(60*10)
  const [done, setDone] = useState(false)

  useEffect(()=>{ load() },[])
  async function load(){
    const { data } = await supabase.from('qcms').select('*').limit(20)
    setQcms(data || [])
  }

  useEffect(()=>{
    if(done) return
    const id = setInterval(()=> setSeconds(s=> s>0 ? s-1 : 0), 1000)
    return ()=> clearInterval(id)
  }, [done])

  useEffect(()=>{ if(seconds===0) setDone(true) }, [seconds])

  function answer(i: number){
    if(selected!==null) return
    setSelected(i)
    if(i===qcms[idx].answer) setScore(s=>s+1)
  }
  function next(){ if(idx+1<qcms.length){ setIdx(i=>i+1); setSelected(null) } else setDone(true) }

  if(done) return (
    <div className="max-w-xl mx-auto app-card p-6 text-center">
      <div className="text-2xl font-semibold">Résultat</div>
      <div className="mt-2 text-neutral-500">{score} / {qcms.length}</div>
    </div>
  )

  if(qcms.length===0) return <div className="p-4">Chargement…</div>

  const q = qcms[idx]
  const mm = Math.floor(seconds/60).toString().padStart(2,'0')
  const ss = (seconds%60).toString().padStart(2,'0')

  return (
    <div className="max-w-2xl mx-auto app-card p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-neutral-500">Question {idx+1}/{qcms.length}</div>
        <div className="text-lg font-mono">{mm}:{ss}</div>
      </div>
      <div className="text-lg font-semibold mb-3">{q.question}</div>
      <div className="space-y-2">
        {q.options.map((o:string, i:number)=> (
          <button key={i} onClick={()=>answer(i)} className={`w-full text-left px-4 py-3 rounded-xl border ${selected!==null && i===q.answer ? 'border-green-500 bg-green-50/70 dark:bg-green-900/30' : ''} ${selected!==null && i===selected && i!==q.answer ? 'border-red-500 bg-red-50/70 dark:bg-red-900/30':''}`}>{o}</button>
        ))}
      </div>
      <div className="mt-4 flex justify-end"><button className="app-button" onClick={next}>Suivant</button></div>
    </div>
  )
}