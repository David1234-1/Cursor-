import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'

export default function ResetPassword(){
  const [email, setEmail] = useState('')

  async function onReset(e: React.FormEvent){
    e.preventDefault()
    const redirectTo = `${import.meta.env.VITE_SITE_URL}/login?msg=Mot%20de%20passe%20mis%20%C3%A0%20jour`
    const { error } = await supabase.auth.resetPasswordForEmail(email,{ redirectTo })
    if(error) return toast.error(error.message)
    toast.success('Email de réinitialisation envoyé')
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="app-card p-6">
        <h1 className="text-2xl font-semibold mb-4">Mot de passe oublié</h1>
        <form className="space-y-3" onSubmit={onReset}>
          <input className="app-input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="app-button w-full">Envoyer</button>
        </form>
      </div>
    </div>
  )
}