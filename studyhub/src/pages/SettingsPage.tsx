import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'sonner'

export default function SettingsPage(){
  const [totpUri, setTotpUri] = useState<string| null>(null)
  const [code, setCode] = useState('')

  async function enable2FA(){
    const { data, error } = await (supabase.auth as any).mfa.enroll({ factorType: 'totp' })
    if(error){ toast.error(error.message); return }
    setTotpUri(data.totp.qr_code)
  }

  async function verify2FA(){
    const { error } = await (supabase.auth as any).mfa.verify({ factorId: '', code })
    if(error){ toast.error(error.message); return }
    toast.success('2FA activée')
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="app-card p-4">
        <div className="font-semibold mb-2">Thème</div>
        <div className="flex gap-2">
          <button className="app-button" onClick={()=>{ document.documentElement.classList.remove('dark') }}>Clair</button>
          <button className="app-button" onClick={()=>{ document.documentElement.classList.add('dark') }}>Sombre</button>
        </div>
      </div>
      <div className="app-card p-4">
        <div className="font-semibold mb-2">Sécurité</div>
        <button className="app-button" onClick={enable2FA}>Activer 2FA (TOTP)</button>
        {totpUri && (
          <div className="mt-3">
            <div className="text-sm text-neutral-500">Scannez ce QR code dans Google Authenticator / Authy, puis entrez le code</div>
            <img className="mt-2" src={totpUri} />
            <div className="mt-2 flex gap-2">
              <input className="app-input" placeholder="Code" value={code} onChange={e=>setCode(e.target.value)} />
              <button className="app-button" onClick={verify2FA}>Vérifier</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}