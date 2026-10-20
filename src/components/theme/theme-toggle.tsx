'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'vcw:theme'

export interface ThemeToggleProps {
  /** Accessible label, translated by the caller. */
  label: string
  className?: string
}

/**
 * Light/dark switch.
 *
 * Intentionally stateless: both icons are always rendered and swapped with the
 * `dark:` variant, so there is no `useEffect` and no hydration mismatch. The
 * click handler flips the class on `<html>` and remembers the choice.
 */
export function ThemeToggle({ label, className }: ThemeToggleProps) {
  function toggleTheme() {
    const root = document.documentElement
    const next = !root.classList.contains('dark')
    root.classList.toggle('dark', next)
    root.style.colorScheme = next ? 'dark' : 'light'
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      /* Storage unavailable — the session still switches correctly. */
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn('text-muted-foreground hover:text-foreground', className)}
    >
      <Moon className="size-[18px] dark:hidden" aria-hidden />
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
    </Button>
  )
}
