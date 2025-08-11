import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ExamPage() {
  const [qcms, setQcms] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [seconds, setSeconds] = useState(20 * 60)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.from('qcms').select('*').limit(30).then(({ data }) => setQcms(data || []))
  }, [])

  useEffect(() => {
    if (done) return
    const id = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [done])

  useEffect(() => {
    if (seconds <= 0) setDone(true)
  }, [seconds])

  const score = useMemo(() => qcms.reduce((acc, q) => acc + ((answers[q.id] ?? -1) === q.answer ? 1 : 0), 0), [answers, qcms])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Mode Examen</h2>
        <div className="font-mono">{Math.max(0, Math.floor(seconds/60)).toString().padStart(2,'0')}:{Math.max(0, seconds%60).toString().padStart(2,'0')}</div>
      </div>
      {!done ? (
        <div className="space-y-4">
          {qcms.map((q, idx) => (
            <div key={q.id} className="rounded-2xl border p-4 bg-[var(--card)] border-[var(--border)]">
              <div className="font-medium mb-2">{idx+1}. {q.question}</div>
              <div className="grid gap-2">
                {q.options?.map((opt: string, i: number) => (
                  <label key={i} className="flex items-center gap-2">
                    <input type="radio" name={q.id} checked={(answers[q.id] ?? -1) === i} onChange={() => setAnswers(a => ({ ...a, [q.id]: i }))} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setDone(true)} className="rounded-xl bg-black text-white px-4 py-2">Terminer</button>
        </div>
      ) : (
        <div className="rounded-2xl border p-6 bg-[var(--card)] border-[var(--border)]">
          <div className="text-xl font-semibold mb-2">Score: {score} / {qcms.length}</div>
          <div className="space-y-2">
            {qcms.map((q) => (
              <div key={q.id} className="text-sm">
                <div className="font-medium">{q.question}</div>
                <div>Votre réponse: {q.options?.[answers[q.id] ?? -1] ?? '—'}</div>
                <div>Bonne réponse: {q.options?.[q.answer]}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}