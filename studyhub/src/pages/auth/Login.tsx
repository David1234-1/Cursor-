import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onEmailLogin(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if(error){ toast.error(error.message); return }
    navigate('/dashboard')
  }

  async function onGoogle(){
    const redirectTo = `${import.meta.env.VITE_SITE_URL}/auth/callback`
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, scopes: 'email profile https://www.googleapis.com/auth/calendar' }
    })
    if(error){
      if(error.message.includes('Unsupported provider')){
        toast.error('Google non activé dans Supabase. Activez le provider Google et ajoutez le scope Calendar.');
      } else {
        toast.error(error.message)
      }
    }
    return data
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="app-card p-6">
        <h1 className="text-2xl font-semibold mb-4">Connexion</h1>
        <form className="space-y-3" onSubmit={onEmailLogin}>
          <input className="app-input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="app-input" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="app-button w-full" disabled={loading}>{loading? 'Connexion…':'Se connecter'}</button>
        </form>
        <div className="my-4 h-px bg-neutral-200 dark:bg-neutral-800" />
        <button onClick={onGoogle} className="app-button w-full bg-white text-neutral-900 border border-neutral-200 dark:bg-neutral-900 dark:text-white dark:border-neutral-700">Continuer avec Google</button>
        <div className="mt-3 text-sm text-neutral-500">Pas de compte ? <Link className="underline" to="/register">Inscription</Link></div>
        <div className="mt-1 text-sm"><Link className="underline" to="/reset-password">Mot de passe oublié</Link></div>
      </div>
    </div>
  )
}