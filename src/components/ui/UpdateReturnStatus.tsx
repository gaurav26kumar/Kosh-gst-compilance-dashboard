'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdateReturnStatus({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function markFiled() {
    await supabase.from('gst_returns').update({
      status: 'filed',
      filed_date: new Date().toISOString().split('T')[0]
    }).eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={markFiled}
      className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--teal-10)] text-[var(--teal)] hover:bg-[var(--teal-20)] border border-[var(--teal-20)] transition-colors">
      Mark Filed
    </button>
  )
}
