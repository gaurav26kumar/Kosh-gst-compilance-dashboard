'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddReturnForm() {
  const [type, setType] = useState('GSTR-1')
  const [period, setPeriod] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('pending')
  const [liability, setLiability] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('gst_returns').insert({
      user_id: user!.id,
      return_type: type,
      period, due_date: dueDate, status,
      tax_liability: Number(liability) || 0,
    })
    setLoading(false)
    setPeriod(''); setDueDate(''); setLiability('')
    router.refresh()
  }

  const inputClass = "w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)]"
  const labelClass = "block text-xs font-medium text-[var(--ink-soft)] mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelClass}>Return Type</label>
        <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
          <option>GSTR-1</option>
          <option>GSTR-3B</option>
          <option>GSTR-9</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Period (e.g. Jun 2026)</label>
        <input value={period} onChange={e => setPeriod(e.target.value)} className={inputClass} placeholder="Jun 2026" required />
      </div>
      <div>
        <label className={labelClass}>Due Date</label>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
          <option value="pending">Pending</option>
          <option value="filed">Filed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Tax Liability (₹)</label>
        <input type="number" value={liability} onChange={e => setLiability(e.target.value)} className={inputClass} placeholder="0" min="0" step="0.01" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-[var(--teal)] hover:opacity-90 disabled:opacity-50 text-white dark:text-[#062018] font-semibold py-2 rounded-lg text-sm transition-colors mt-2">
        {loading ? 'Saving…' : 'Log Return'}
      </button>
    </form>
  )
}
