export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-[var(--bg)]">
      <div className="w-64 shrink-0 border-r border-[var(--border)]" />
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-7 w-56 rounded bg-[var(--surface-2)]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-[var(--surface-2)]" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-[var(--surface-2)]" />
        </div>
      </div>
    </div>
  )
}
