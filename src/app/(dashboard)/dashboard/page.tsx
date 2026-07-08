import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/gst'
import Link from 'next/link'
import { FileText, AlertCircle, CheckCircle, TrendingUp, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: invoices }, { data: returns }, { data: profile }] = await Promise.all([
    supabase.from('invoices').select('*').eq('user_id', user!.id),
    supabase.from('gst_returns').select('*').eq('user_id', user!.id),
    supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle(),
  ])

  const totalRevenue = invoices?.reduce((s, i) => s + (i.grand_total || 0), 0) || 0
  const totalTax = invoices?.reduce((s, i) => s + (i.total_tax || 0), 0) || 0
  const pendingReturns = returns?.filter(r => r.status === 'pending' || r.status === 'overdue') || []
  const overdueReturns = returns?.filter(r => r.status === 'overdue') || []
  const filedReturns = returns?.filter(r => r.status === 'filed') || []
  const complianceScore = returns?.length
    ? Math.round((filedReturns.length / returns.length) * 100)
    : 100

  const recentInvoices = invoices?.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Dashboard</h1>
          <p className="text-[var(--ink-soft)] text-sm mt-1">
            Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}
          </p>
        </div>
        <Link href="/invoices/new"
          className="flex items-center gap-2 bg-[var(--teal)] hover:opacity-90 text-white dark:text-[#062018] font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus size={15} />
          New Invoice
        </Link>
      </div>

      {/* Compliance score */}
      <div className={`rounded-xl border p-5 mb-6 ${
        overdueReturns.length > 0
          ? 'bg-red-500/5 border-red-500/20'
          : complianceScore === 100
          ? 'bg-[var(--teal-5)] border-[var(--teal-20)]'
          : 'bg-amber-500/5 border-amber-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--ink-soft)] mb-1">Compliance Health</p>
            <p className={`text-3xl font-bold ${
              overdueReturns.length > 0 ? 'text-red-600 dark:text-red-400' : complianceScore === 100 ? 'text-[var(--teal)]' : 'text-amber-600 dark:text-amber-400'
            }`}>{complianceScore}%</p>
            <p className="text-sm text-[var(--ink-faint)] mt-1">
              {overdueReturns.length > 0
                ? `${overdueReturns.length} overdue return${overdueReturns.length > 1 ? 's' : ''} — file immediately`
                : pendingReturns.length > 0
                ? `${pendingReturns.length} return${pendingReturns.length > 1 ? 's' : ''} pending`
                : 'All returns filed — great compliance!'}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
            overdueReturns.length > 0 ? 'border-red-500' : complianceScore === 100 ? 'border-[var(--teal)]' : 'border-amber-500'
          }`}>
            {overdueReturns.length > 0
              ? <AlertCircle className="text-red-600 dark:text-red-400" size={28} />
              : <CheckCircle className="text-[var(--teal)]" size={28} />}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Invoices', value: invoices?.length || 0, icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-[var(--teal)]' },
          { label: 'Tax Collected', value: formatCurrency(totalTax), icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Returns Filed', value: `${filedReturns.length}/${returns?.length || 0}`, icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--ink)]">Recent Invoices</h2>
          <Link href="/invoices" className="text-sm text-[var(--teal)] hover:opacity-75">View all →</Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={32} className="text-[var(--ink-faint)] mx-auto mb-3" />
            <p className="text-[var(--ink-faint)] text-sm">No invoices yet</p>
            <Link href="/invoices/new" className="text-[var(--teal)] text-sm hover:text-[var(--teal)] mt-1 inline-block">
              Create your first invoice →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Invoice', 'Buyer', 'Type', 'Amount'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv, i) => (
                <tr key={inv.id} className={`hover:bg-[var(--surface-2)] transition-colors ${i < recentInvoices.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-sm text-[var(--teal)]">{inv.invoice_number}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-sm text-[var(--ink)] font-medium">{inv.buyer_name}</p>
                    <p className="text-xs text-[var(--ink-faint)] font-mono">{inv.buyer_gstin}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      inv.is_reverse_charge ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      inv.is_export ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      inv.is_interstate ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}>
                      {inv.is_reverse_charge ? 'RCM' : inv.is_export ? 'Export' : inv.is_interstate ? 'Interstate' : 'Intrastate'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-sm text-[var(--ink)]">{formatCurrency(inv.grand_total)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
