'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, FileText, BarChart3, TrendingUp, User, LogOut } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import ThemeToggle from '@/components/theme/ThemeToggle'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/returns', label: 'Returns', icon: BarChart3 },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar({ user, profile }: { user: SupabaseUser, profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col">
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--teal-10)] border border-[var(--teal-20)] flex items-center justify-center shrink-0">
              <span className="text-[var(--teal)] font-bold text-xs">GST</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--ink)] leading-tight truncate">
                {profile?.business_name || 'My Business'}
              </p>
              <p className="text-xs text-[var(--ink-faint)] font-mono mt-0.5 truncate">
                {profile?.gstin || 'Setup profile →'}
              </p>
            </div>
          </div>
          <ThemeToggle className="shrink-0" />
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[var(--teal-10)] text-[var(--teal)] border border-[var(--teal-20)]'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-[var(--ink-faint)] truncate">{user.email}</p>
        </div>
        <button onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--ink-soft)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
