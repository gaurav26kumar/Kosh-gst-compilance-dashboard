import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/ui/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Business Profile</h1>
        <p className="text-[var(--ink-soft)] text-sm mt-1">Your GSTIN and business details used on all invoices</p>
      </div>

      <div className="max-w-xl">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <ProfileForm profile={profile} />
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mt-4">
          <h2 className="font-semibold text-[var(--ink)] mb-3">Account</h2>
          <p className="text-sm text-[var(--ink-soft)]">Signed in as</p>
          <p className="text-sm text-[var(--ink)] font-mono mt-1">{user?.email}</p>
        </div>
      </div>
    </div>
  )
}
