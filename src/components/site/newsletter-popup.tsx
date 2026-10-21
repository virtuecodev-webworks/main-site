'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, CheckCircle2, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'

const STORAGE_DISMISSED_KEY = 'vcw:newsletter_popup_dismissed'
const STORAGE_SUBSCRIBED_KEY = 'vcw:newsletter_subscribed'
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Check if already subscribed or recently dismissed
    try {
      if (localStorage.getItem(STORAGE_SUBSCRIBED_KEY) === 'true') return

      const dismissedAt = localStorage.getItem(STORAGE_DISMISSED_KEY)
      if (dismissedAt) {
        const elapsed = Date.now() - Number(dismissedAt)
        if (elapsed < DISMISS_COOLDOWN_MS) return
      }
    } catch {
      // ignore storage blocks
    }

    let timer: NodeJS.Timeout | null = null

    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const scrollProgress = scrollY / docHeight

      // Trigger popup when user reaches 28% scroll depth
      if (scrollProgress >= 0.28) {
        setIsOpen(true)
        window.removeEventListener('scroll', handleScroll)
        if (timer) clearTimeout(timer)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Fallback: Show after 18 seconds of reading even if not deeply scrolled
    timer = setTimeout(() => {
      setIsOpen(true)
      window.removeEventListener('scroll', handleScroll)
    }, 18000)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timer) clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, Date.now().toString())
    } catch {
      // ignore
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim()

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          source: 'scroll_popup',
        }),
      })

      if (!res.ok) {
        throw new Error('Subscription failed. Please try again.')
      }

      setStatus('success')
      try {
        localStorage.setItem(STORAGE_SUBSCRIBED_KEY, 'true')
      } catch {
        // ignore
      }

      // Auto-close after celebration
      setTimeout(() => {
        setIsOpen(false)
      }, 3500)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Subscription failed. Please try again.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[380px] max-w-full"
          role="dialog"
          aria-labelledby="newsletter-popup-title"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0A0D16]/95 p-5 sm:p-6 text-white shadow-2xl backdrop-blur-xl ring-1 ring-white/10 dark:bg-[#070913]/95">
            {/* Top ambient radial light sheen */}
            <div
              className="pointer-events-none absolute -top-12 -left-12 size-36 rounded-full bg-blue-500/20 blur-2xl -z-0"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-12 -right-12 size-36 rounded-full bg-gold-500/15 blur-2xl -z-0"
              aria-hidden="true"
            />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              aria-label="Close newsletter popup"
              className="absolute top-3.5 right-3.5 size-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="size-4" />
            </button>

            {status === 'success' ? (
              <div className="flex flex-col items-center text-center py-4 space-y-2.5">
                <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-base font-bold text-white">You're on the list!</h3>
                <p className="text-xs text-[#94A3B8] max-w-[260px]">
                  A confirmation email has been sent to your inbox. Welcome to the Studio Dispatch.
                </p>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col gap-3.5">
                {/* Badge & Squircle Header */}
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-[#1E2538] to-[#111624] border border-white/10 flex items-center justify-center text-gold-400 shadow-inner">
                    <Mail className="size-5 text-gold-400" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-gold-400">
                      <Sparkles className="size-3" />
                      Studio Dispatch
                    </span>
                    <h3 id="newsletter-popup-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                      Architectural insights &amp; notes
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Join digital founders and technical leaders. We share deep-dives into modern web architecture, bespoke design systems, and software performance.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@company.com"
                      required
                      autoComplete="email"
                      className="h-10 flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 text-xs text-white placeholder:text-muted-foreground focus:border-gold-400 focus:outline-hidden focus:ring-2 focus:ring-gold-400/20 transition-all"
                    />
                    <Button
                      type="submit"
                      variant="gold"
                      size="sm"
                      disabled={status === 'loading'}
                      className="h-10 px-4 text-xs font-bold rounded-xl shrink-0"
                    >
                      {status === 'loading' ? <VirtueSpinner className="size-3.5" /> : 'Subscribe'}
                    </Button>
                  </div>

                  {status === 'error' && errorMessage && (
                    <p className="text-[11px] text-rose-400 font-medium pt-0.5" role="alert">
                      {errorMessage}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10.5px] text-[#64748B] pt-1">
                    <span>No marketing spam. Unsubscribe anytime.</span>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-muted-foreground hover:text-white transition-colors underline underline-offset-2"
                    >
                      Maybe later
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
