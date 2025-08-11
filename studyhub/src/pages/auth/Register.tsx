import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onRegister(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if(error){ toast.error(error.message); return }
    toast.success('Vérifiez votre email pour confirmer votre compte')
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="app-card p-6">
        <h1 className="text-2xl font-semibold mb-4">Inscription</h1>
        <form className="space-y-3" onSubmit={onRegister}>
          <input className="app-input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="app-input" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="app-button w-full" disabled={loading}>{loading? 'Inscription…':'Créer mon compte'}</button>
        </form>
        <div className="mt-3 text-sm">Déjà un compte ? <Link className="underline" to="/login">Connexion</Link></div>
      </div>
    </div>
  )
}