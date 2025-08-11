import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker

export default function ImportPage() {
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<string>('')

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles(selected)
  }

  const extractPdfText = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((it: any) => it.str).join(' ') + '\n'
    }
    return text
  }

  const extractTxt = async (file: File) => new TextDecoder('utf-8').decode(await file.arrayBuffer())

  const handleImport = async () => {
    setStatus('Extraction...')
    for (const file of files) {
      let content = ''
      if (file.name.toLowerCase().endsWith('.pdf')) content = await extractPdfText(file)
      else if (file.name.toLowerCase().endsWith('.txt')) content = await extractTxt(file)
      else { continue }

      setStatus('Analyse IA...')
      const res = await fetch('/api/analyzeCourse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
      if (!res.ok) { setStatus('Erreur d\'analyse'); return }
      const ai = await res.json()

      const { data: user } = await supabase.auth.getUser()
      const { data: course, error } = await supabase.from('courses').insert({ user_id: user.user?.id, title: file.name, file_name: file.name, content }).select().single()
      if (error) { setStatus('Erreur enregistrement'); return }

      if (ai.qcms?.length) await supabase.from('qcms').insert(ai.qcms.map((q: any) => ({ course_id: course.id, ...q })))
      if (ai.flashcards?.length) await supabase.from('flashcards').insert(ai.flashcards.map((f: any) => ({ course_id: course.id, ...f })))
      if (ai.summary) await supabase.from('summaries').insert({ course_id: course.id, content: ai.summary })
      setStatus('Import terminé ✅')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-4">
      <h2 className="text-lg font-semibold mb-3">Importation de cours</h2>
      <input type="file" accept=".pdf,.txt" multiple onChange={onSelect} className="mb-3" />
      <button onClick={handleImport} className="rounded-xl bg-black text-white px-4 py-2">Importer</button>
      {status && <p className="mt-3 text-sm opacity-80">{status}</p>}
      <ul className="mt-3 space-y-1 text-sm">
        {files.map(f => <li key={f.name} className="opacity-80">{f.name}</li>)}
      </ul>
    </div>
  )
}