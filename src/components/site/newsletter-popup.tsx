'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Check } from 'lucide-react'
import { useLocale } from 'next-intl'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'

const STORAGE_DISMISSED_KEY = 'vcw:newsletter_popup_dismissed'
const STORAGE_SUBSCRIBED_KEY = 'vcw:newsletter_subscribed'
const SESSION_DISMISSED_KEY = 'vcw:newsletter_popup_session_dismissed'
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

export function NewsletterPopup() {
  const locale = useLocale()
  const [isOpen, setIsOpen] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const isDismissedRef = React.useRef(false)

  const handleDismiss = React.useCallback((e?: React.SyntheticEvent | KeyboardEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setIsOpen(false)
    isDismissedRef.current = true

    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, Date.now().toString())
      sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true')
    } catch {
      // Storage unavailable in restricted mode
    }
  }, [])

  // Keyboard accessibility: Close immediately on Escape
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleDismiss])

  // Scroll and timer trigger logic
  React.useEffect(() => {
    // Check if already subscribed or recently dismissed in this session or storage
    try {
      if (sessionStorage.getItem(SESSION_DISMISSED_KEY) === 'true') return
      if (localStorage.getItem(STORAGE_SUBSCRIBED_KEY) === 'true') return

      const dismissedAt = localStorage.getItem(STORAGE_DISMISSED_KEY)
      if (dismissedAt) {
        const elapsed = Date.now() - Number(dismissedAt)
        if (elapsed < DISMISS_COOLDOWN_MS) return
      }
    } catch {
      // ignore
    }

    let timer: ReturnType<typeof setTimeout> | null = null

    const triggerOpen = () => {
      if (isDismissedRef.current) return

      // Avoid clashing with the Cookie Consent notice if still unresolved
      try {
        const cookieSet = localStorage.getItem('vcw:cookie-consent')
        if (!cookieSet) {
          // Recheck in 5 seconds so cookie banner can resolve first
          timer = setTimeout(triggerOpen, 5000)
          return
        }
      } catch {
        // proceed
      }

      setIsOpen(true)
      window.removeEventListener('scroll', handleScroll)
      if (timer) clearTimeout(timer)
    }

    const handleScroll = () => {
      if (isDismissedRef.current) return
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const scrollProgress = scrollY / docHeight

      // Trigger popup when user reaches 32% scroll depth
      if (scrollProgress >= 0.32) {
        triggerOpen()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Fallback timer: Show after 24 seconds of active engagement
    timer = setTimeout(triggerOpen, 24000)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timer) clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
          locale,
          source: 'scroll_dispatch_card',
        }),
      })

      if (!res.ok) {
        throw new Error('Subscription failed. Please try again.')
      }

      setStatus('success')
      try {
        localStorage.setItem(STORAGE_SUBSCRIBED_KEY, 'true')
        sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true')
      } catch {
        // ignore
      }

      // Smooth auto-close after confirmation
      setTimeout(() => {
        setIsOpen(false)
      }, 3200)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Subscription failed. Please try again.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[65] w-[calc(100vw-32px)] sm:w-[380px] max-w-full font-sans"
          role="dialog"
          aria-modal="false"
          aria-labelledby="newsletter-dispatch-title"
        >
          {/* Main Card Surface */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0c0c0c]/95 p-5 sm:p-6 text-[#f5f4f0] shadow-[0_24px_50px_rgba(0,0,0,0.65),0_0_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl">
            {/* Top architectural gold hairline accent */}
            <div
              className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#dcaa28]/55 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            {/* Direct Close Button: High z-index, large hit area, guaranteed type="button" */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close subscription popup"
              className="absolute top-3.5 right-3.5 z-30 size-8 sm:size-9 rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-[#f5f4f0]/60 hover:text-[#f5f4f0] border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#dcaa28]"
            >
              <X className="size-4" strokeWidth={2} />
            </button>

            {status === 'success' ? (
              <div className="flex flex-col items-start py-2 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-[#dcaa28]">
                  <span className="grid size-6 place-items-center rounded-full bg-[#dcaa28]/15 border border-[#dcaa28]/30">
                    <Check className="size-3.5 text-[#dcaa28]" strokeWidth={2.5} />
                  </span>
                  <span>( Confirmed )</span>
                </div>
                <h3 className="font-display text-base font-semibold text-[#f5f4f0]">
                  Welcome to the Dispatch.
                </h3>
                <p className="text-xs text-[#f5f4f0]/65 leading-relaxed">
                  A confirmation note is on its way. Expect quarterly dispatches on software craft,
                  systems architecture, and design.
                </p>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col gap-3">
                {/* Brand Eyebrow */}
                <div className="flex items-center gap-2 pr-8">
                  <span className="size-1.5 rounded-full bg-[#dcaa28]" />
                  <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#dcaa28]">
                    ( Newsletter )
                  </span>
                </div>

                {/* Title & Concise Copy */}
                <div>
                  <h3
                    id="newsletter-dispatch-title"
                    className="font-display text-base sm:text-[17px] font-semibold text-[#f5f4f0] leading-snug tracking-tight"
                  >
                    Architectural notes &amp; software craft.
                  </h3>
                  <p className="text-xs text-[#f5f4f0]/65 leading-relaxed mt-1">
                    Quarterly essays on bespoke systems, high performance, and digital craft. No
                    promotional noise.
                  </p>
                </div>

                {/* Minimalist Architectural Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-1">
                  {/* Honeypot field */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="sr-only"
                    aria-hidden="true"
                  />

                  {/* Unified Input + Submit Bar */}
                  <div className="relative flex items-center rounded-xl border border-white/15 bg-white/[0.04] p-1 transition-all duration-200 focus-within:border-[#dcaa28] focus-within:bg-white/[0.07] focus-within:ring-1 focus-within:ring-[#dcaa28]/30">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (status === 'error') setStatus('idle')
                      }}
                      placeholder="your.email@domain.com"
                      required
                      autoComplete="email"
                      className="h-9 sm:h-10 flex-1 bg-transparent px-3 text-xs text-[#f5f4f0] placeholder:text-[#f5f4f0]/35 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-lg bg-[#dcaa28] px-3.5 sm:px-4 text-xs font-semibold text-[#0a0a0a] transition-all hover:bg-[#edd47a] active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                    >
                      {status === 'loading' ? (
                        <VirtueSpinner className="size-3.5 text-[#0a0a0a]" />
                      ) : (
                        <>
                          <span>Join</span>
                          <ArrowRight className="size-3.5" strokeWidth={2} />
                        </>
                      )}
                    </button>
                  </div>

                  {status === 'error' && errorMessage && (
                    <p className="text-[11px] text-rose-400 font-medium pt-0.5" role="alert">
                      {errorMessage}
                    </p>
                  )}

                  {/* Bottom Dismiss & Privacy Row */}
                  <div className="flex items-center justify-between text-[11px] text-[#f5f4f0]/45 pt-1">
                    <span>1-click unsubscribe anytime</span>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-[#f5f4f0]/70 hover:text-[#f5f4f0] underline underline-offset-4 decoration-[#f5f4f0]/30 hover:decoration-[#f5f4f0] transition-colors cursor-pointer font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
