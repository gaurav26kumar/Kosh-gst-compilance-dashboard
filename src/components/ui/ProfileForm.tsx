'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { validateGSTIN, getStateFromGSTIN, getStateCodeFromGSTIN } from '@/lib/gst'
import { Profile } from '@/types'

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [businessName, setBusinessName] = useState(profile?.business_name || '')
  const [gstin, setGSTIN] = useState(profile?.gstin || '')
  const [address, setAddress] = useState(profile?.address || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const gstinValid = gstin.length === 15 && validateGSTIN(gstin)
  const state = gstinValid ? getStateFromGSTIN(gstin) : ''

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (gstin && !gstinValid) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').upsert({
      id: user!.id,
      business_name: businessName,
      gstin: gstin.toUpperCase() || null,
      address,
      state: state || null,
      state_code: gstinValid ? getStateCodeFromGSTIN(gstin) : null,
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const inputClass = "w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:border-[var(--teal)] focus:ring-1 focus:ring-[var(--teal)] text-sm transition-colors"
  const labelClass = "block text-sm font-medium text-[var(--ink-soft)] mb-1.5"

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <h2 className="font-semibold text-[var(--ink)] mb-4">Business Details</h2>
      <div>
        <label className={labelClass}>Business Name</label>
        <input value={businessName} onChange={e => setBusinessName(e.target.value)}
          className={inputClass} placeholder="Gaurav Enterprises Pvt Ltd" />
      </div>
      <div>
        <label className={labelClass}>GSTIN</label>
        <input value={gstin} onChange={e => setGSTIN(e.target.value.toUpperCase())}
          className={`${inputClass} font-mono`} placeholder="27AAPFU0939F1ZV" maxLength={15} />
        {gstin.length > 0 && (
          <p className={`text-xs mt-1 ${gstinValid ? 'text-[var(--teal)]' : 'text-red-600 dark:text-red-400'}`}>
            {gstinValid ? `✓ Valid — ${state}` : 'Invalid GSTIN format'}
          </p>
        )}
      </div>
      <div>
        <label className={labelClass}>Business Address</label>
        <textarea value={address} onChange={e => setAddress(e.target.value)}
          className={`${inputClass} resize-none h-20`}
          placeholder="123 Business Park, Mumbai, Maharashtra 400001" />
      </div>
      {state && (
        <div className="bg-[var(--surface-2)] rounded-lg px-3.5 py-2.5 flex items-center gap-2">
          <span className="text-xs text-[var(--ink-faint)]">State (from GSTIN):</span>
          <span className="text-sm text-[var(--teal)] font-medium">{state}</span>
        </div>
      )}
      <button type="submit" disabled={loading}
        className={`w-full font-semibold py-2.5 rounded-lg text-sm transition-colors ${
          saved ? 'bg-green-600 text-white' : 'bg-[var(--teal)] hover:opacity-90 text-white dark:text-[#062018] disabled:opacity-50'
        }`}>
        {loading ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
      </button>
    </form>
  )
}
