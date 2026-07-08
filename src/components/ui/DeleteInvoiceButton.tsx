'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteInvoiceButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    await supabase.from('invoices').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={handleDelete}
      className="p-1.5 rounded-md text-[var(--ink-faint)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
      title="Delete invoice"
    >
      <Trash2 size={14} />
    </button>
  )
}
