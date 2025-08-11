import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">StudyHub</h1>
        <button className="text-sm opacity-70 hover:opacity-100" onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
      </header>
      <main className="px-4 pb-12">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Tile to="/calendar" title="Calendrier" emoji="📅" />
          <Tile to="/import" title="Importation" emoji="📂" />
          <Tile to="/exam" title="Mode examen" emoji="⏱️" />
          <Tile to="/stats" title="Statistiques" emoji="📊" />
          <Tile to="/groups" title="Groupes & Chat" emoji="👥" />
          <Tile to="/settings" title="Réglages" emoji="⚙️" />
        </div>
      </main>
    </div>
  )
}

function Tile({ to, title, emoji }: { to: string, title: string, emoji: string }) {
  return (
    <Link to={to} className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] shadow hover:shadow-lg transition block">
      <div className="text-3xl mb-3">{emoji}</div>
      <div className="text-lg font-medium">{title}</div>
    </Link>
  )
}