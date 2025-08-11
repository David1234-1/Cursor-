import { useRef, useState } from 'react'
import Tesseract from 'tesseract.js'
import { supabase } from '../lib/supabaseClient'

export default function AudioOcrExtras(){
  const [text, setText] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  async function start(){
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    mediaRecorderRef.current = mr
    chunksRef.current = []
    mr.ondataavailable = (e)=> chunksRef.current.push(e.data)
    mr.start()
  }
  async function stop(){
    const mr = mediaRecorderRef.current
    if(!mr) return
    await new Promise(res=>{ mr.onstop = res as any; mr.stop() })
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.storage.from('media').upload(`${user!.id}/${Date.now()}.webm`, blob, { upsert: true })
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return
    const { data } = await Tesseract.recognize(await f.arrayBuffer(), 'eng+fra')
    setText(data.text)
  }

  return (
    <div className="app-card p-4">
      <div className="font-semibold">Audio & OCR</div>
      <div className="mt-2 flex gap-2">
        <button className="app-button" onClick={start}>Enregistrer</button>
        <button className="app-button" onClick={stop}>Stop</button>
      </div>
      <div className="mt-4">
        <input type="file" accept="image/*" onChange={onImage} />
        <div className="mt-2 whitespace-pre-wrap text-sm text-neutral-500">{text}</div>
      </div>
    </div>
  )
}