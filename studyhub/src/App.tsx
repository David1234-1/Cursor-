import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import AuthGate from './components/AuthGate'
import Dashboard from './pages/Dashboard'
import CalendarPage from './pages/CalendarPage'
import ImportPage from './pages/ImportPage'
import GroupsPage from './pages/GroupsPage'
import ExamPage from './pages/ExamPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const [session, setSession] = useState<any>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  if (!session) return <AuthGate />

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/import" element={<ImportPage />} />
      <Route path="/groups" element={<GroupsPage />} />
      <Route path="/exam" element={<ExamPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
