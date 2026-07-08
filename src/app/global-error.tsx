'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-[#090d16] px-4 text-center">
          <div>
            <p className="text-sm font-mono tracking-widest text-[#e0b25c] mb-3">ERROR</p>
            <h1 className="text-2xl font-semibold text-[#eef1f6] mb-2">Something went wrong</h1>
            <p className="text-[#9aa3b8] text-sm mb-8 max-w-sm mx-auto">
              An unexpected error occurred. You can try again, or head back to the homepage.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="rounded-full bg-[#3fd1aa] hover:opacity-90 text-[#062018] font-semibold text-sm px-5 py-2.5 transition-opacity"
              >
                Try again
              </button>
              <Link
                href="/"
                className="rounded-full border border-white/10 text-[#eef1f6] font-semibold text-sm px-5 py-2.5 hover:border-[#e0b25c] transition-colors"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
