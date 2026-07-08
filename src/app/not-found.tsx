import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 text-center">
      <div>
        <p className="text-sm font-mono tracking-widest text-[var(--brass)] mb-3">404</p>
        <h1 className="text-2xl font-semibold text-[var(--ink)] mb-2">Page not found</h1>
        <p className="text-[var(--ink-soft)] text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--teal)] hover:opacity-90 text-white dark:text-[#062018] font-semibold text-sm px-5 py-2.5 transition-opacity"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
