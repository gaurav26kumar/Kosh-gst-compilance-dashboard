import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/gst'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PrintButton from '@/components/ui/PrintButton'
import type { InvoiceItem } from '@/types'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!invoice) notFound()

  const items: InvoiceItem[] = invoice.invoice_items || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">{invoice.invoice_number}</h1>
            <p className="text-[var(--ink-soft)] text-sm mt-1">
              {new Date(invoice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <PrintButton />
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 print:bg-white print:text-black print:border-none">
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-[var(--border)] print:border-gray-300">
          <div>
            <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-1">Buyer</p>
            <p className="text-[var(--ink)] font-medium print:text-black">{invoice.buyer_name}</p>
            <p className="text-sm text-[var(--ink-soft)] font-mono print:text-gray-700">{invoice.buyer_gstin}</p>
            {invoice.place_of_supply && (
              <p className="text-sm text-[var(--ink-faint)] mt-1">Place of supply: {invoice.place_of_supply}</p>
            )}
          </div>
          <div className="text-right">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
              invoice.is_reverse_charge ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
              invoice.is_export ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
              invoice.is_interstate ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
              'bg-purple-500/10 text-purple-600 dark:text-purple-400'
            }`}>
              {invoice.tax_label}
            </span>
            {invoice.lut_number && (
              <p className="text-xs text-[var(--ink-faint)] mt-2">LUT: {invoice.lut_number}</p>
            )}
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-[var(--border)] print:border-gray-300">
              {['Item', 'HSN', 'Qty', 'Unit Price', 'Tax %', 'Base', 'CGST', 'SGST', 'IGST', 'Cess', 'Total'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider px-2 py-2 print:text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-[var(--border)] print:border-gray-200">
                <td className="px-2 py-2.5 text-sm text-[var(--ink)] print:text-black">{it.item_name}</td>
                <td className="px-2 py-2.5 text-sm text-[var(--ink-soft)] font-mono">{it.hsn_code || '—'}</td>
                <td className="px-2 py-2.5 text-sm text-[var(--ink-soft)]">{it.quantity}</td>
                <td className="px-2 py-2.5 text-sm font-mono text-[var(--ink-soft)]">{formatCurrency(it.unit_price ?? 0)}</td>
                <td className="px-2 py-2.5 text-sm text-[var(--ink-soft)]">{it.tax_slab}%</td>
                <td className="px-2 py-2.5 text-sm font-mono text-[var(--ink-soft)]">{formatCurrency(it.base_amount ?? 0)}</td>
                <td className="px-2 py-2.5 text-sm font-mono text-[var(--ink-soft)]">{formatCurrency(it.cgst ?? 0)}</td>
                <td className="px-2 py-2.5 text-sm font-mono text-[var(--ink-soft)]">{formatCurrency(it.sgst ?? 0)}</td>
                <td className="px-2 py-2.5 text-sm font-mono text-[var(--ink-soft)]">{formatCurrency(it.igst ?? 0)}</td>
                <td className="px-2 py-2.5 text-sm font-mono text-[var(--ink-soft)]">{formatCurrency(it.cess_amount ?? 0)}</td>
                <td className="px-2 py-2.5 text-sm font-mono font-semibold text-[var(--ink)] print:text-black">{formatCurrency(it.line_total ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="space-y-2 w-full max-w-sm">
            {[
              ['Taxable Value', invoice.base_amount],
              ['CGST', invoice.cgst],
              ['SGST', invoice.sgst],
              ['IGST', invoice.igst],
              ['Cess', invoice.cess],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between text-sm">
                <span className="text-[var(--ink-soft)] print:text-gray-600">{label}</span>
                <span className="font-mono text-[var(--ink)] print:text-black">{formatCurrency(val as number)}</span>
              </div>
            ))}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-[var(--border)] print:border-gray-300">
              <span className="text-[var(--ink)] print:text-black">Grand Total</span>
              <span className="font-mono text-[var(--teal)] print:text-black">{formatCurrency(invoice.grand_total)}</span>
            </div>
            {invoice.is_reverse_charge && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mt-2 print:hidden">
                RCM: Tax shown for record-keeping only. Buyer pays directly to govt.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
