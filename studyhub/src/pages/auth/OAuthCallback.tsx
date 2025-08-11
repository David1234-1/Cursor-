import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function OAuthCallback(){
  const navigate = useNavigate()
  useEffect(()=>{
    async function run(){
      const { data } = await supabase.auth.getSession()
      if(data.session) navigate('/dashboard')
      else navigate('/login')
    }
    run()
  },[])
  return <div className="p-6">Connexion en cours…</div>
}