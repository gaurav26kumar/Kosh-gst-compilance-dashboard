import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/gst'
import TaxChart from '@/components/ui/TaxChart'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

  // Group by month
  const byMonth: Record<string, { month: string; cgst: number; sgst: number; igst: number; cess: number; revenue: number; count: number }> = {}

  invoices?.forEach(inv => {
    const d = new Date(inv.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    if (!byMonth[key]) byMonth[key] = { month: label, cgst: 0, sgst: 0, igst: 0, cess: 0, revenue: 0, count: 0 }
    byMonth[key].cgst += inv.cgst || 0
    byMonth[key].sgst += inv.sgst || 0
    byMonth[key].igst += inv.igst || 0
    byMonth[key].cess += inv.cess || 0
    byMonth[key].revenue += inv.grand_total || 0
    byMonth[key].count += 1
  })

  const chartData = Object.values(byMonth).slice(-6)

  // Tax type distribution
  const totalCGST = invoices?.reduce((s, i) => s + (i.cgst || 0), 0) || 0
  const totalSGST = invoices?.reduce((s, i) => s + (i.sgst || 0), 0) || 0
  const totalIGST = invoices?.reduce((s, i) => s + (i.igst || 0), 0) || 0
  const totalCess = invoices?.reduce((s, i) => s + (i.cess || 0), 0) || 0
  const totalTax = totalCGST + totalSGST + totalIGST + totalCess

  const pieData = [
    { name: 'CGST', value: Math.round(totalCGST * 100) / 100, color: '#2DD4BF' },
    { name: 'SGST', value: Math.round(totalSGST * 100) / 100, color: '#14B8A6' },
    { name: 'IGST', value: Math.round(totalIGST * 100) / 100, color: '#58A6FF' },
    { name: 'Cess', value: Math.round(totalCess * 100) / 100, color: '#F59E0B' },
  ].filter(d => d.value > 0)

  // Invoice type breakdown
  const typeBreakdown = [
    { label: 'Interstate', count: invoices?.filter(i => i.is_interstate && !i.is_export && !i.is_reverse_charge).length || 0, color: 'bg-blue-500' },
    { label: 'Intrastate', count: invoices?.filter(i => !i.is_interstate && !i.is_export && !i.is_reverse_charge).length || 0, color: 'bg-purple-500' },
    { label: 'RCM', count: invoices?.filter(i => i.is_reverse_charge).length || 0, color: 'bg-amber-500' },
    { label: 'Export', count: invoices?.filter(i => i.is_export).length || 0, color: 'bg-green-500' },
  ]
  const totalInvoices = invoices?.length || 1

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Analytics</h1>
        <p className="text-[var(--ink-soft)] text-sm mt-1">Tax collection and invoice trends</p>
      </div>

      {!invoices?.length ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-16 text-center">
          <p className="text-[var(--ink-faint)]">No invoice data yet — create invoices to see analytics</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'CGST', value: totalCGST, color: 'text-[var(--teal)]', border: 'border-t-teal-500' },
              { label: 'SGST', value: totalSGST, color: 'text-[var(--teal)]', border: 'border-t-teal-400' },
              { label: 'IGST', value: totalIGST, color: 'text-blue-600 dark:text-blue-400', border: 'border-t-blue-500' },
              { label: 'Cess', value: totalCess, color: 'text-amber-600 dark:text-amber-400', border: 'border-t-amber-500' },
            ].map(({ label, value, color, border }) => (
              <div key={label} className={`bg-[var(--surface)] border border-[var(--border)] border-t-2 ${border} rounded-xl p-5`}>
                <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-2">{label}</p>
                <p className={`text-xl font-bold font-mono ${color}`}>{formatCurrency(value)}</p>
                <p className="text-xs text-[var(--ink-faint)] mt-1">
                  {totalTax > 0 ? `${Math.round(value / totalTax * 100)}% of total tax` : '—'}
                </p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <TaxChart chartData={chartData} pieData={pieData} />

          {/* Invoice type breakdown */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="font-semibold text-[var(--ink)] mb-4">Invoice Type Breakdown</h2>
            <div className="space-y-3">
              {typeBreakdown.map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--ink-soft)] w-20">{label}</span>
                  <div className="flex-1 bg-[var(--surface-2)] rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.round(count / totalInvoices * 100)}%` }} />
                  </div>
                  <span className="text-sm font-mono text-[var(--ink-soft)] w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
