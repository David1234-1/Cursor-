import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabaseClient'

export default function AuthGate() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const signInWithGoogle = async () => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/calendar',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: window.location.origin,
      },
    })
    if (error) setError(`${error.message}. Assurez-vous que le provider Google est activé et que les credentials sont configurés.`)
    setLoading(false)
  }

  useEffect(() => {
    document.body.classList.add('theme-apple')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-xl bg-[var(--card)] border border-[var(--border)]">
        <h1 className="text-2xl font-semibold mb-4 text-center">StudyHub</h1>
        <button onClick={signInWithGoogle} disabled={loading} className="w-full mb-4 py-2 rounded-xl bg-black text-white hover:opacity-90 transition">
          {loading ? 'Connexion...' : 'Se connecter avec Google'}
        </button>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <Auth supabaseClient={supabase} providers={[]} appearance={{ theme: ThemeSupa }} redirectTo={window.location.origin} />
        <p className="text-xs text-center mt-4 opacity-70">Connexion persistante activée</p>
      </div>
    </div>
  )
}