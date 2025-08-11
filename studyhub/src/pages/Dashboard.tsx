import { Link } from 'react-router-dom'

export default function Dashboard(){
  const cards = [
    { to:'/calendar', title:'Calendrier', emoji:'📅', desc:'Planifiez vos révisions' },
    { to:'/import', title:'Import de cours', emoji:'📂', desc:'PDF/TXT, OCR et audio' },
    { to:'/qcm', title:'QCM', emoji:'📝', desc:'Générez et révisez' },
    { to:'/flashcards', title:'Flashcards', emoji:'🎯', desc:'Spaced repetition' },
    { to:'/summaries', title:'Résumés', emoji:'📜', desc:'IA résume vos cours' },
    { to:'/groups', title:'Groupes & Chat', emoji:'👥', desc:'Travaillez ensemble' },
    { to:'/exam', title:'Examen', emoji:'⏱️', desc:'Mode test chronométré' },
    { to:'/settings', title:'Réglages', emoji:'⚙️', desc:'Profil, 2FA, thèmes' },
  ]
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(c=> (
        <Link key={c.to} to={c.to} className="app-card p-5 hover:shadow-lg transition">
          <div className="text-3xl">{c.emoji}</div>
          <div className="mt-3 text-xl font-semibold">{c.title}</div>
          <div className="text-neutral-500">{c.desc}</div>
        </Link>
      ))}
    </div>
  )
}