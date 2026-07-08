'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className={`relative w-[46px] h-[26px] rounded-full border shrink-0 cursor-pointer transition-colors duration-300 bg-[var(--surface-2)] border-[var(--border)] ${className}`}
    >
      <Sun
        size={14}
        className={`absolute top-1/2 -translate-y-1/2 left-[6px] transition-opacity ${
          isDark ? 'opacity-40 text-[var(--ink-faint)]' : 'opacity-100 text-[#17130a]'
        }`}
      />
      <Moon
        size={14}
        className={`absolute top-1/2 -translate-y-1/2 right-[6px] transition-opacity ${
          isDark ? 'opacity-100 text-[#17130a]' : 'opacity-40 text-[var(--ink-faint)]'
        }`}
      />
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[var(--brass)] transition-transform duration-300"
        style={{ transform: isDark ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}
