'use client'
import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-[var(--teal)] hover:opacity-90 text-white dark:text-[#062018] font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
    >
      <Printer size={15} />
      Print / Save PDF
    </button>
  )
}
