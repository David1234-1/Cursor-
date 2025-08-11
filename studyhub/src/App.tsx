import { Route, Routes, Navigate, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { Toaster, toast } from 'sonner'
import Dashboard from './pages/Dashboard'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import OAuthCallback from './pages/auth/OAuthCallback'
import CalendarPage from './pages/CalendarPage'
import ImportPage from './pages/ImportPage'
import QcmPage from './pages/QcmPage'
import FlashcardsPage from './pages/FlashcardsPage'
import SummariesPage from './pages/SummariesPage'
import GroupsChatPage from './pages/GroupsChatPage'
import ExamPage from './pages/ExamPage'
import SettingsPage from './pages/SettingsPage'

function useSession() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  return { session, loading }
}

function Nav() {
  const { session } = useSession()
  const location = useLocation()
  const path = location.pathname
  const navItem = (to: string, label: string) => (
    <Link className={`px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${path===to?'bg-neutral-100 dark:bg-neutral-800':''}`} to={to}>{label}</Link>
  )
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60 border-b border-neutral-200/60 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to={session?'/':'/'} className="font-semibold">StudyHub</Link>
        {session && (
          <nav className="flex items-center gap-2">
            {navItem('/dashboard','Tableau de bord')}
            {navItem('/calendar','Calendrier')}
            {navItem('/import','Import')}
            {navItem('/qcm','QCM')}
            {navItem('/flashcards','Flashcards')}
            {navItem('/summaries','Résumés')}
            {navItem('/groups','Groupes & Chat')}
            {navItem('/exam','Examen')}
            {navItem('/settings','Réglages')}
          </nav>
        )}
        <div className="flex items-center gap-2">
          <button className="app-button" onClick={()=>{
            document.documentElement.classList.toggle('dark')
          }}>Thème</button>
          {session ? (
            <button className="app-button" onClick={()=> supabase.auth.signOut()}>Déconnexion</button>
          ) : (
            <Link className="app-button" to="/login">Connexion</Link>
          )}
        </div>
      </div>
    </header>
  )
}

function Protected({ children }: { children: JSX.Element }) {
  const { session, loading } = useSession()
  if (loading) return <div className="p-8">Chargement…</div>
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  useEffect(()=>{
    const m = new URLSearchParams(location.search).get('msg')
    if(m) toast.info(m)
  },[])
  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/auth/callback" element={<OAuthCallback/>} />

          <Route path="/dashboard" element={<Protected><Dashboard/></Protected>} />
          <Route path="/calendar" element={<Protected><CalendarPage/></Protected>} />
          <Route path="/import" element={<Protected><ImportPage/></Protected>} />
          <Route path="/qcm" element={<Protected><QcmPage/></Protected>} />
          <Route path="/flashcards" element={<Protected><FlashcardsPage/></Protected>} />
          <Route path="/summaries" element={<Protected><SummariesPage/></Protected>} />
          <Route path="/groups" element={<Protected><GroupsChatPage/></Protected>} />
          <Route path="/exam" element={<Protected><ExamPage/></Protected>} />
          <Route path="/settings" element={<Protected><SettingsPage/></Protected>} />
        </Routes>
      </main>
    </div>
  )
}
