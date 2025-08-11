import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-4">
      <h2 className="text-lg font-semibold mb-3">Réglages</h2>
      <div className="rounded-2xl border p-6 bg-[var(--card)] border-[var(--border)] space-y-4">
        <div>
          <div className="font-medium mb-1">Thème</div>
          <div className="flex gap-2">
            <button onClick={() => setTheme('light')} className={`rounded-xl border px-3 py-1 ${theme==='light'?'bg-black text-white':''}`}>Clair</button>
            <button onClick={() => setTheme('dark')} className={`rounded-xl border px-3 py-1 ${theme==='dark'?'bg-black text-white':''}`}>Sombre</button>
          </div>
        </div>
        <div>
          <div className="font-medium mb-1">Authentification à deux facteurs</div>
          <p className="text-sm opacity-80">Bientôt: activer TOTP avec Supabase Auth.</p>
        </div>
      </div>
    </div>
  )
}