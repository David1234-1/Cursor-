import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url'

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker

export default function ImportPage(){
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)

  function onPick(e: React.ChangeEvent<HTMLInputElement>){
    const list = e.target.files ? Array.from(e.target.files) : []
    setFiles(prev => [...prev, ...list])
  }

  async function extractText(file: File): Promise<string> {
    if(file.type === 'text/plain'){
      return await file.text()
    }
    if(file.type === 'application/pdf' || file.name.endsWith('.pdf')){
      const data = new Uint8Array(await file.arrayBuffer())
      const pdf = await (pdfjsLib as any).getDocument({ data }).promise
      let text = ''
      for(let i=1; i<=pdf.numPages; i++){
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((it:any)=> it.str).join(' ') + '\n'
      }
      return text
    }
    throw new Error('Format non supporté')
  }

  async function onStart(){
    if(files.length===0){ toast.info('Ajoutez des fichiers'); return }
    setBusy(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) throw new Error('Non connecté')

      for(const file of files){
        // Upload original file to storage
        await supabase.storage.from('courses').upload(`${user.id}/${Date.now()}_${file.name}`, file, { upsert: true })
        // Extract text
        const content = await extractText(file)
        // Insert course
        const { data: course, error: courseErr } = await supabase.from('courses').insert({ user_id: user.id, title: file.name.replace(/\.[^/.]+$/, ''), file_name: file.name, content }).select('*').single()
        if(courseErr) throw courseErr
        // AI analysis
        const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ content }) })
        if(!res.ok) throw new Error('Erreur IA')
        const ai = await res.json()
        // Save QCMs, flashcards, summary
        if(ai.qcms?.length){
          await supabase.from('qcms').insert(ai.qcms.map((q:any)=> ({ course_id: course.id, question: q.question, options: q.options, answer: q.answer })))
        }
        if(ai.flashcards?.length){
          await supabase.from('flashcards').insert(ai.flashcards.map((f:any)=> ({ course_id: course.id, front: f.front, back: f.back })))
        }
        if(ai.summary){
          await supabase.from('summaries').insert({ course_id: course.id, content: ai.summary })
        }
      }
      toast.success('Import et analyse terminés')
    } catch(e:any){
      console.error(e)
      toast.error(e.message || 'Erreur import')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-card p-6">
      <div className="text-xl font-semibold mb-3">Importer des cours (.pdf, .txt)</div>
      <input type="file" multiple accept=".pdf,.txt" onChange={onPick} />
      <div className="mt-3 text-sm text-neutral-500">Fichiers: {files.map(f=>f.name).join(', ') || 'aucun'}</div>
      <div className="mt-4">
        <button className="app-button" disabled={busy} onClick={onStart}>{busy? 'Traitement…':'Lancer l\'import & IA'}</button>
      </div>
    </div>
  )
}