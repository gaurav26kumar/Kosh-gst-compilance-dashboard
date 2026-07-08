'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { validateGSTIN, getStateFromGSTIN, isInterstate, calculateLineItem, calculateInvoiceTotals, formatCurrency, generateInvoiceNumber, GST_SLABS } from '@/lib/gst'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Item { item_name: string; hsn_code: string; quantity: number; unit_price: number; tax_slab: number; cess_rate: number }

const emptyItem = (): Item => ({ item_name: '', hsn_code: '', quantity: 1, unit_price: 0, tax_slab: 18, cess_rate: 0 })

export default function NewInvoicePage() {
  const [buyerGSTIN, setBuyerGSTIN] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [sellerGSTIN, setSellerGSTIN] = useState('')
  const [isRCM, setIsRCM] = useState(false)
  const [isExport, setIsExport] = useState(false)
  const [isSEZ, setIsSEZ] = useState(false)
  const [supplyType, setSupplyType] = useState('With Payment')
  const [lutNumber, setLutNumber] = useState('')
  const [items, setItems] = useState<Item[]>([emptyItem()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('profiles').select('gstin').maybeSingle().then(({ data }) => {
      if (data?.gstin) setSellerGSTIN(data.gstin)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const interstate = sellerGSTIN.length === 15 && buyerGSTIN.length === 15
    ? isInterstate(sellerGSTIN, buyerGSTIN) : false

  const itemCalcs = items.map(it => calculateLineItem(it.unit_price, it.quantity, it.tax_slab, interstate, it.cess_rate))
  const totals = calculateInvoiceTotals(itemCalcs, isRCM, isExport, isSEZ, supplyType)

  function updateItem(i: number, field: keyof Item, value: string | number) {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validateGSTIN(sellerGSTIN)) { setError('Invalid seller GSTIN format'); return }
    if (!validateGSTIN(buyerGSTIN)) { setError('Invalid buyer GSTIN format'); return }
    if (!items.every(it => it.item_name && it.quantity > 0 && it.unit_price > 0)) {
      setError('Fill in all line items correctly'); return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const invoiceNumber = generateInvoiceNumber()

    const { data: invoice, error: invError } = await supabase.from('invoices').insert({
      user_id: user!.id,
      invoice_number: invoiceNumber,
      buyer_name: buyerName,
      buyer_gstin: buyerGSTIN.toUpperCase(),
      place_of_supply: getStateFromGSTIN(buyerGSTIN),
      is_interstate: interstate,
      is_reverse_charge: isRCM,
      is_export: isExport,
      is_sez: isSEZ,
      supply_type: supplyType,
      lut_number: lutNumber || null,
      ...totals,
    }).select().single()

    if (invError || !invoice) { setError(invError?.message || 'Failed to create invoice'); setLoading(false); return }

    await supabase.from('invoice_items').insert(
      items.map((it, i) => ({
        invoice_id: invoice.id,
        ...it,
        ...itemCalcs[i],
      }))
    )

    router.push('/invoices')
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/invoices" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">New Invoice</h1>
          <p className="text-[var(--ink-soft)] text-sm mt-1">GST calculated automatically from GSTIN state codes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parties */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="font-semibold text-[var(--ink)] mb-4">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Seller GSTIN</label>
              <input value={sellerGSTIN} onChange={e => setSellerGSTIN(e.target.value.toUpperCase())}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[var(--ink)] font-mono text-sm placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)]"
                placeholder="27AAPFU0939F1ZV" maxLength={15} required />
              {sellerGSTIN.length === 15 && <p className="text-xs text-[var(--teal)] mt-1">{getStateFromGSTIN(sellerGSTIN)}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Buyer GSTIN</label>
              <input value={buyerGSTIN} onChange={e => setBuyerGSTIN(e.target.value.toUpperCase())}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[var(--ink)] font-mono text-sm placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)]"
                placeholder="29AAPFU0939F1ZV" maxLength={15} required />
              {buyerGSTIN.length === 15 && (
                <p className={`text-xs mt-1 ${validateGSTIN(buyerGSTIN) ? 'text-[var(--teal)]' : 'text-red-600 dark:text-red-400'}`}>
                  {validateGSTIN(buyerGSTIN) ? getStateFromGSTIN(buyerGSTIN) : 'Invalid GSTIN'}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Buyer Name</label>
              <input value={buyerName} onChange={e => setBuyerName(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)]"
                placeholder="Reliance Industries Ltd" required />
            </div>
          </div>

          {/* Transaction type */}
          <div className="flex gap-5 mt-4 pt-4 border-t border-[var(--border)]">
            {(
              [
                ['isRCM', 'Reverse Charge (RCM)', isRCM, setIsRCM],
                ['isExport', 'Export', isExport, setIsExport],
                ['isSEZ', 'SEZ Supply', isSEZ, setIsSEZ],
              ] as [string, string, boolean, (v: boolean) => void][]
            ).map(([key, label, val, setter]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)}
                  className="w-4 h-4 accent-teal-500 rounded" />
                <span className="text-sm text-[var(--ink-soft)]">{label}</span>
              </label>
            ))}
          </div>

          {(isExport || isSEZ) && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed border-[var(--border)]">
              <div>
                <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Supply Type</label>
                <select value={supplyType} onChange={e => setSupplyType(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[var(--ink)] focus:outline-none focus:border-[var(--teal)]">
                  <option>With Payment</option>
                  <option>Without Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">LUT Number</label>
                <input value={lutNumber} onChange={e => setLutNumber(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)]"
                  placeholder="LUT2026XYZ" />
              </div>
            </div>
          )}

          {sellerGSTIN.length === 15 && buyerGSTIN.length === 15 && validateGSTIN(buyerGSTIN) && (
            <div className={`mt-4 text-xs px-3 py-2 rounded-lg border ${interstate ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'}`}>
              {interstate ? `Interstate → IGST applies` : `Intrastate → CGST + SGST applies`}
            </div>
          )}
        </div>

        {/* Line items */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--ink)]">Line Items</h2>
            <button type="button" onClick={() => setItems(p => [...p, emptyItem()])}
              className="flex items-center gap-1.5 text-sm text-[var(--teal)] hover:opacity-75 border border-[var(--teal-30)] hover:border-[var(--teal-50)] px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
                <div className="col-span-3">
                  {i === 0 && <label className="block text-xs text-[var(--ink-faint)] mb-1">Item Name</label>}
                  <input value={item.item_name} onChange={e => updateItem(i, 'item_name', e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2.5 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)]"
                    placeholder="Office Chair" required />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-[var(--ink-faint)] mb-1">HSN Code</label>}
                  <input value={item.hsn_code} onChange={e => updateItem(i, 'hsn_code', e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2.5 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)]"
                    placeholder="9401" />
                </div>
                <div className="col-span-1">
                  {i === 0 && <label className="block text-xs text-[var(--ink-faint)] mb-1">Qty</label>}
                  <input type="number" value={item.quantity} min={1} onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2.5 py-2 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--teal)]" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-[var(--ink-faint)] mb-1">Unit Price</label>}
                  <input type="number" value={item.unit_price} min={0} step={0.01} onChange={e => updateItem(i, 'unit_price', Number(e.target.value))}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2.5 py-2 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--teal)]" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-[var(--ink-faint)] mb-1">Tax Slab</label>}
                  <select value={item.tax_slab} onChange={e => updateItem(i, 'tax_slab', Number(e.target.value))}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2.5 py-2 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--teal)]">
                    {GST_SLABS.map(s => <option key={s} value={s}>{s}%</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  {i === 0 && <label className="block text-xs text-[var(--ink-faint)] mb-1">Cess %</label>}
                  <input type="number" value={item.cess_rate} min={0} step={0.01} onChange={e => updateItem(i, 'cess_rate', Number(e.target.value))}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2.5 py-2 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--teal)]" />
                </div>
                <div className="col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <button type="button" onClick={() => setItems(p => p.filter((_, idx) => idx !== i))}
                      className="p-2 text-[var(--ink-faint)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="font-semibold text-[var(--ink)] mb-4">Tax Summary</h2>
          <div className="space-y-2 max-w-sm ml-auto">
            {[
              ['Taxable Value', totals.base_amount],
              ['CGST', totals.cgst],
              ['SGST', totals.sgst],
              ['IGST', totals.igst],
              ['Cess', totals.cess],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between text-sm">
                <span className="text-[var(--ink-soft)]">{label}</span>
                <span className="font-mono text-[var(--ink)]">{formatCurrency(val as number)}</span>
              </div>
            ))}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-[var(--border)]">
              <span className="text-[var(--ink)]">Grand Total</span>
              <span className="font-mono text-[var(--teal)]">{formatCurrency(totals.grand_total)}</span>
            </div>
            {isRCM && <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mt-2">RCM: Tax shown for record-keeping only. Buyer pays directly to govt.</p>}
          </div>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link href="/invoices" className="px-5 py-2.5 border border-[var(--border)] text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-lg text-sm transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-[var(--teal)] hover:opacity-90 disabled:opacity-50 text-white dark:text-[#062018] font-semibold rounded-lg text-sm transition-colors">
            {loading ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  )
}
