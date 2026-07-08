import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/gst'
import AddReturnForm from '@/components/ui/AddReturnForm'
import UpdateReturnStatus from '@/components/ui/UpdateReturnStatus'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default async function ReturnsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: returns } = await supabase
    .from('gst_returns')
    .select('*')
    .eq('user_id', user!.id)
    .order('due_date', { ascending: false })

  const stats = {
    filed: returns?.filter(r => r.status === 'filed').length || 0,
    pending: returns?.filter(r => r.status === 'pending').length || 0,
    overdue: returns?.filter(r => r.status === 'overdue').length || 0,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink)]">GST Returns</h1>
        <p className="text-[var(--ink-soft)] text-sm mt-1">Track GSTR-1 and GSTR-3B filing status</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Filed', value: stats.filed, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border p-5 ${bg}`}>
            <div className="flex items-center gap-3">
              <Icon size={20} className={color} />
              <div>
                <p className="text-2xl font-bold font-mono text-[var(--ink)]">{value}</p>
                <p className={`text-sm font-medium ${color}`}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--ink)]">Return History</h2>
          </div>
          {!returns?.length ? (
            <div className="text-center py-12 text-[var(--ink-faint)] text-sm">No returns logged yet</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                  {['Type', 'Period', 'Due Date', 'Liability', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map((r, i) => (
                  <tr key={r.id} className={`hover:bg-[var(--surface-2)] transition-colors ${i < returns.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-sm text-[var(--ink)] bg-[var(--surface-2)] px-2 py-1 rounded-md">{r.return_type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[var(--ink-soft)]">{r.period}</td>
                    <td className="px-5 py-3.5 text-sm text-[var(--ink-soft)] font-mono">
                      {new Date(r.due_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-[var(--ink)]">{formatCurrency(r.tax_liability)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        r.status === 'filed' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        r.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {r.status !== 'filed' && <UpdateReturnStatus id={r.id} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="font-semibold text-[var(--ink)] mb-4">Log a Return</h2>
          <AddReturnForm />
        </div>
      </div>
    </div>
  )
}
