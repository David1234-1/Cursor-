import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'

interface Card { id:string; course_id:string; front:string; back:string }

export default function FlashcardsPage(){
  const [cards, setCards] = useState<Card[]>([])
  const [idx, setIdx] = useState(0)
  const [showBack, setShowBack] = useState(false)

  useEffect(()=>{ load() },[])
  async function load(){
    const { data, error } = await supabase.from('flashcards').select('*').order('created_at',{ascending:false})
    if(error) toast.error(error.message)
    setCards(data as any || [])
  }

  async function review(grade: 0|1|2){
    const card = cards[idx]
    await supabase.from('srs_reviews').insert({ card_id: card.id, grade })
    setShowBack(false)
    setIdx(i=> (i+1) % cards.length)
  }

  if(cards.length===0) return <div className="p-4">Aucune flashcard</div>
  const card = cards[idx]

  return (
    <div className="max-w-xl mx-auto app-card p-6 text-center">
      <div className="text-sm text-neutral-500 mb-2">Carte {idx+1}/{cards.length}</div>
      <div className="text-2xl font-semibold min-h-[96px] flex items-center justify-center">{showBack ? card.back : card.front}</div>
      <div className="mt-4 flex justify-center gap-2">
        {!showBack ? (
          <button className="app-button" onClick={()=> setShowBack(true)}>Voir la réponse</button>
        ) : (
          <>
            <button className="app-button bg-neutral-200 text-neutral-900" onClick={()=>review(0)}>Oubli</button>
            <button className="app-button" onClick={()=>review(1)}>Difficile</button>
            <button className="app-button" onClick={()=>review(2)}>Facile</button>
          </>
        )}
      </div>
    </div>
  )
}