'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { CurrencyCode } from '@/lib/constants'
import { type ServicePackage, type AgencyServiceOffering } from '@/lib/packages'
import { formatMoney } from '@/lib/utils'

interface PackageIntakeModalProps {
  isOpen: boolean
  onClose: () => void
  service: AgencyServiceOffering | null
  pkg: ServicePackage | null
  currency?: CurrencyCode
  discountPercent?: number
  billingLabel?: string
}

function resolvePackagePrice(
  pkg: ServicePackage,
  currency: CurrencyCode,
  discountPercent = 0,
): number {
  let base = pkg.priceUsd
  if (currency === 'NGN') base = pkg.priceNgn
  else if (currency === 'GBP') base = Math.round(pkg.priceUsd * 0.8)
  else if (currency === 'EUR') base = Math.round(pkg.priceUsd * 0.92)

  if (discountPercent > 0) {
    const discounted = base * (1 - discountPercent / 100)
    return currency === 'NGN'
      ? Math.round(discounted / 1000) * 1000
      : Math.round(discounted)
  }
  return base
}

export function PackageIntakeModal({
  isOpen,
  onClose,
  service,
  pkg,
  currency = 'USD',
  discountPercent = 0,
  billingLabel,
}: PackageIntakeModalProps) {
  const locale = useLocale()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState<{
    reference: string
    portalUrl: string
  } | null>(null)

  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [referenceUrls, setReferenceUrls] = useState('')
  const [deadline, setDeadline] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStep(1)
        setOrderResult(null)
        setError(null)
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !service || !pkg) return null

  const price = resolvePackagePrice(pkg, currency, discountPercent)
  const formattedPrice = formatMoney(price, currency, locale, { decimals: false })

  const handleNext = () => {
    setError(null)
    if (step === 1) {
      if (!projectName.trim() || !description.trim()) {
        setError('Please provide your project name and description.')
        return
      }
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!clientName.trim() || !clientEmail.trim() || !clientEmail.includes('@')) {
      setError('Please provide a valid full name and email address.')
      return
    }

    setSubmitting(true)
    try {
      const billingNote = billingLabel
        ? `\nBilling Mode: ${billingLabel}${discountPercent > 0 ? ` (${discountPercent}% upfront savings — ${formattedPrice})` : ` (${formattedPrice})`}`
        : ''
      const res = await fetch('/api/orders/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          serviceTitle: service.title,
          tier: pkg.tier,
          projectName,
          description: `${description}${billingNote}`,
          targetAudience,
          referenceUrls,
          deadline,
          clientName,
          clientEmail,
          currency,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Failed to submit order brief.')
      }

      setOrderResult({
        reference: data.reference,
        portalUrl: data.portalUrl || '/portal',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setStep(1)
    setOrderResult(null)
    setError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl text-foreground font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4 bg-muted/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  {pkg.tier} package
                </span>
                <span className="text-xs text-muted-foreground">
                  {service.category.toUpperCase()}
                </span>
              </div>
              <h2 id="package-modal-title" className="text-lg font-bold tracking-tight text-foreground mt-1">
                {service.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {orderResult ? (
            <div role="status" aria-live="polite" className="p-8 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Order Brief Received
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Your brief has been registered with Virtue &amp; Co. Webworks. Our senior engineering team will review it and confirm kickoff details.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 font-mono text-sm text-foreground">
                  <span>Reference:</span>
                  <strong className="text-primary">{orderResult.reference}</strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href={{ pathname: '/portal', query: { email: clientEmail } }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                  Open Client Portal Tracker
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full sm:w-auto rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Back to Services
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Stepper Indicators */}
              <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4 text-xs font-medium">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">
                    1
                  </span>
                  <span>Project Overview</span>
                </div>
                <div className="h-px w-8 bg-border" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">
                    2
                  </span>
                  <span>Scope &amp; Assets</span>
                </div>
                <div className="h-px w-8 bg-border" />
                <div className={`flex items-center gap-2 ${step === 3 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">
                    3
                  </span>
                  <span>Confirm &amp; Start</span>
                </div>
              </div>

              {/* Package Summary Box */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
                <div>
                  <span className="font-semibold text-foreground block">
                    {pkg.name} — {formattedPrice}
                  </span>
                  <span className="text-muted-foreground">{pkg.tagline}</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{pkg.deliveryDays} Business Days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{pkg.revisions} Revisions</span>
                  </div>
                </div>
              </div>

              {error && (
                <div role="alert" className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              {/* Step 1: Project Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="pkg-project-name" className="block text-xs font-semibold text-foreground mb-1">
                      Project or Company Name *
                    </label>
                    <input
                      id="pkg-project-name"
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Apex Legal Portal or FinSync SaaS"
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label htmlFor="pkg-description" className="block text-xs font-semibold text-foreground mb-1">
                      Project Brief &amp; Goals *
                    </label>
                    <textarea
                      id="pkg-description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you want us to design and build, key features needed, and any specific goals."
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label htmlFor="pkg-audience" className="block text-xs font-semibold text-foreground mb-1">
                      Target Audience / Market (Optional)
                    </label>
                    <input
                      id="pkg-audience"
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. B2B enterprise clients, medical professionals, UK shoppers"
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Scope & Assets */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="pkg-references" className="block text-xs font-semibold text-foreground mb-1">
                      Reference Websites or Design Inspiration (Optional)
                    </label>
                    <textarea
                      id="pkg-references"
                      rows={3}
                      value={referenceUrls}
                      onChange={(e) => setReferenceUrls(e.target.value)}
                      placeholder="Paste URLs of competitor or inspirational sites (e.g., https://stripe.com, https://linear.app)"
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label htmlFor="pkg-deadline" className="block text-xs font-semibold text-foreground mb-1">
                      Preferred Launch Date or Target Deadline (Optional)
                    </label>
                    <input
                      id="pkg-deadline"
                      type="text"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      placeholder="e.g. Within 2 weeks, or before November 15th"
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-4">
                    <span className="text-xs font-semibold text-foreground block mb-2">
                      Included in this {pkg.tier} package:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 3: Contact & Confirm */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pkg-client-name" className="block text-xs font-semibold text-foreground mb-1">
                        Your Full Name *
                      </label>
                      <input
                        id="pkg-client-name"
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label htmlFor="pkg-client-email" className="block text-xs font-semibold text-foreground mb-1">
                        Work Email Address *
                      </label>
                      <input
                        id="pkg-client-email"
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  {/* Summary & Guarantees */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Package Investment:</span>
                      <span className="font-bold text-foreground text-base tabular-nums">
                        {formattedPrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Turnaround Time:</span>
                      <span className="font-medium text-foreground">
                        {pkg.deliveryDays} business days (from scope &amp; content handover)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Revisions Included:</span>
                      <span className="font-medium text-foreground">
                        {pkg.revisions} Rounds
                      </span>
                    </div>
                    <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
                      <span>
                        Direct collaboration with senior engineers, clear written scope, and 30-day post-launch warranty.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {submitting ? 'Registering Order...' : 'Submit Order Brief'}
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              )}

              {/* Navigation for steps 1 and 2 */}
              {step < 3 && (
                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                  {step === 2 ? (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Continue to {step === 1 ? 'Scope & Assets' : 'Confirmation'}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
