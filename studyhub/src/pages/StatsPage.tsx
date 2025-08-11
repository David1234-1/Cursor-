export default function StatsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-4">
      <h2 className="text-lg font-semibold mb-3">Statistiques</h2>
      <div className="rounded-2xl border p-6 bg-[var(--card)] border-[var(--border)]">
        <p className="opacity-80">Ici s\'afficheront vos stats de révision, heatmap et progression.</p>
      </div>
    </div>
  )
}