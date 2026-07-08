import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ThemeToggle from '@/components/theme/ThemeToggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 relative">
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors">
          <ArrowLeft size={15} />
          Kosh
        </Link>
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--teal-10)] border border-[var(--teal-20)] mb-4">
            <span className="text-[var(--teal)] font-bold text-sm tracking-wide">GST</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Compliance Dashboard</h1>
          <p className="text-[var(--ink-soft)] text-sm mt-1">GST management for Indian businesses</p>
        </div>
        {children}
      </div>
    </div>
  )
}
