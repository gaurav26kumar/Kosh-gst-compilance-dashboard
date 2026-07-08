import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/gst'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import DeleteInvoiceButton from '@/components/ui/DeleteInvoiceButton'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Invoices</h1>
          <p className="text-[var(--ink-soft)] text-sm mt-1">{invoices?.length || 0} total invoices</p>
        </div>
        <Link href="/invoices/new"
          className="flex items-center gap-2 bg-[var(--teal)] hover:opacity-90 text-white dark:text-[#062018] font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus size={15} />
          New Invoice
        </Link>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        {!invoices?.length ? (
          <div className="text-center py-16">
            <p className="text-[var(--ink-faint)] mb-3">No invoices yet</p>
            <Link href="/invoices/new" className="text-[var(--teal)] hover:opacity-75 text-sm">Create your first invoice →</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                {['Invoice No.', 'Buyer', 'Place of Supply', 'Type', 'Tax', 'Total', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.id} className={`hover:bg-[var(--surface-2)] transition-colors ${i < invoices.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm text-[var(--teal)]">{inv.invoice_number}</span>
                    <p className="text-xs text-[var(--ink-faint)] mt-0.5">{new Date(inv.created_at).toLocaleDateString('en-IN')}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-[var(--ink)] font-medium">{inv.buyer_name}</p>
                    <p className="text-xs text-[var(--ink-faint)] font-mono">{inv.buyer_gstin}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--ink-soft)]">{inv.place_of_supply || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      inv.is_reverse_charge ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      inv.is_export ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      inv.is_interstate ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}>
                      {inv.is_reverse_charge ? 'RCM' : inv.is_export ? 'Export' : inv.is_interstate ? 'Interstate' : 'Intrastate'}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-[var(--ink-soft)]">{formatCurrency(inv.total_tax)}</td>
                  <td className="px-5 py-4 font-mono text-sm font-semibold text-[var(--ink)]">{formatCurrency(inv.grand_total)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/invoices/${inv.id}`}
                        className="p-1.5 rounded-md text-[var(--ink-faint)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="View invoice"
                      >
                        <Eye size={14} />
                      </Link>
                      <DeleteInvoiceButton id={inv.id} />
                    </div>
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
