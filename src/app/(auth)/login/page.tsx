'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
      <h2 className="text-xl font-semibold text-[var(--ink)] mb-6">Sign in to your account</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)] transition-colors"
            placeholder="you@business.com" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink-soft)] mb-1.5">Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)] transition-colors"
            placeholder="••••••••" required
          />
        </div>
        {error && <p className="text-red-600 dark:text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-[var(--teal)] hover:opacity-90 disabled:opacity-50 text-white dark:text-[#062018] font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-center text-[var(--ink-faint)] text-sm mt-6">
        No account?{' '}
        <Link href="/signup" className="text-[var(--teal)] hover:opacity-75">Create one</Link>
      </p>
    </div>
  )
}
