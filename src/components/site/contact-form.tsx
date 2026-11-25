'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2, Send, ShieldCheck } from 'lucide-react'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { submitInquiry } from '@/lib/actions/inquiries'
import type { InquiryResult } from '@/lib/inquiries/handler'
import { AGENCY, BUDGET_BANDS, MENU_SERVICES, TIMELINES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const SERVICE_OPTIONS = [...MENU_SERVICES, 'redesign', 'other'] as const
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

export interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  const t = useTranslations('Contact.form')
  const tOptions = useTranslations('Contact.options')
  const locale = useLocale()

  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({})
  const [service, setService] = React.useState<string>('')
  const [budget, setBudget] = React.useState<string>('')
  const [timeline, setTimeline] = React.useState<string>('')
  const [message, setMessage] = React.useState<string>('')
  const [consent, setConsent] = React.useState<boolean>(false)
  const startedAtRef = React.useRef<number>(0)

  // Read query params after mount so the page remains statically rendered and
  // renders the complete <form> immediately in SSR HTML without a Suspense skeleton.
  React.useEffect(() => {
    startedAtRef.current = Date.now()

    const params = new URLSearchParams(window.location.search)
    const qService = params.get('service')
    const qPlan = params.get('plan')
    const qTier = params.get('tier')
    const qBudget = params.get('budget')
    const qCurrency = params.get('currency')
    const qIntent = params.get('intent')

    if (qService && (SERVICE_OPTIONS as readonly string[]).includes(qService)) {
      setService(qService)
    } else if (qPlan === 'ecommerce') {
      setService('ecommerce')
    } else if (qPlan === 'custom-app' || qPlan === 'corporate' || qPlan === 'landing') {
      setService('custom')
    }

    if (qBudget && (BUDGET_BANDS as readonly string[]).includes(qBudget)) {
      setBudget(qBudget)
    } else if (qBudget) {
      const num = Number(qBudget)
      if (Number.isFinite(num)) {
        if (qPlan === 'landing' || num < 250) setBudget('single-page')
        else if (qPlan === 'custom-app' || num > 750) setBudget('platform')
        else setBudget('multi-page')
      }
    } else if (qPlan === 'landing') {
      setBudget('single-page')
    } else if (qPlan === 'corporate' || qPlan === 'ecommerce') {
      setBudget('multi-page')
    } else if (qPlan === 'custom-app') {
      setBudget('platform')
    }

    if (qPlan || qTier || qBudget || qIntent === 'call') {
      const parts: string[] = []
      if (qIntent === 'call') parts.push('Request: 30-minute discovery call')
      if (qPlan) parts.push(`Selected Scope: ${qPlan}`)
      if (qTier) parts.push(`Package Tier: ${qTier}`)
      if (qBudget) parts.push(`Estimated Budget: ${qBudget}${qCurrency ? ` ${qCurrency}` : ' USD'}`)

      setMessage((prev) =>
        prev.trim()
          ? prev
          : `${parts.join(' · ')}\n\n${
              qIntent === 'call'
                ? 'Preferred day/time & timezone:\n\nProject Overview & Goals:\n'
                : 'Project Overview & Goals:\n'
            }`,
      )
    }
  }, [])

  function validateClient(payload: {
    name: string
    email: string
    password: string | null
    message: string
    consent: boolean
  }): Record<string, string[]> {
    const errors: Record<string, string[]> = {}
    if (payload.name.trim().length < 2) {
      errors.name = ['Please enter your name (at least 2 characters).']
    }
    if (!EMAIL_REGEX.test(payload.email.trim())) {
      errors.email = ['Please enter a valid email address (e.g. name@company.com).']
    }
    if (payload.message.trim().length < 10) {
      errors.message = ['Please share at least 10 characters about your project.']
    }
    if (payload.password && payload.password.length < 8) {
      errors.password = ['Password must be at least 8 characters.']
    }
    if (!payload.consent) {
      errors.consent = ['Please confirm we may contact you regarding this enquiry.']
    }
    return errors
  }

  async function dispatchInquiry(payload: Record<string, unknown>): Promise<InquiryResult> {
    try {
      return await submitInquiry(payload)
    } catch {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as InquiryResult
      return data
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const form = event.currentTarget
    const data = new FormData(form)

    const rawName = String(data.get('name') ?? '')
    const rawEmail = String(data.get('email') ?? '')
    const rawPassword = String(data.get('password') ?? '') || null
    const rawMessage = message

    const clientErrors = validateClient({
      name: rawName,
      email: rawEmail,
      password: rawPassword,
      message: rawMessage,
      consent,
    })

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      setFormError('Please review the highlighted fields before sending.')
      return
    }

    setPending(true)

    const payload = {
      name: rawName,
      email: rawEmail,
      password: rawPassword,
      phone: String(data.get('phone') ?? '') || null,
      company: String(data.get('company') ?? '') || null,
      service: service || null,
      budget: budget || null,
      timeline: timeline || null,
      message: rawMessage,
      locale,
      startedAt: startedAtRef.current || Date.now(),
      website: String(data.get('website') ?? ''),
    }

    try {
      const result = await dispatchInquiry(payload)

      if (result.ok) {
        if (result.redirectUrl) {
          toast.success('Project registered & portal ready!', {
            description: 'Redirecting to your live order workspace...',
          })
          window.location.href = result.redirectUrl
          return
        }
        setSent(true)
        toast.success(t('successTitle'))
        form.reset()
        setMessage('')
        setService('')
        setBudget('')
        setTimeline('')
        setConsent(false)
        return
      }

      if (result.code === 'rate-limited') {
        const waitMsg = `Too many submissions. Please try again in ${result.retryAfterSeconds ?? 60} seconds or email ${AGENCY.email}.`
        setFormError(waitMsg)
        toast.error(t('submit'), { description: waitMsg })
        return
      }

      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      setFormError('Please check the highlighted fields and try again.')
      toast.error('Almost there', {
        description: 'Please check the highlighted fields and try again.',
      })
    } catch {
      const fallbackMsg = `Could not submit right now. Please email us directly at ${AGENCY.email}.`
      setFormError(fallbackMsg)
      toast.error('Something went wrong', {
        description: `Please email us directly at ${AGENCY.email}.`,
      })
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <div
        id="quote-form"
        role="status"
        aria-live="polite"
        className={cn(
          'rounded-[20px] border border-border bg-card flex flex-col items-start gap-4 p-8 sm:p-10',
          className,
        )}
      >
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <h2 className="heading-style-h3">{t('successTitle')}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{t('successBody')}</p>
        <p className="text-xs text-muted-foreground">
          Need to add files or follow up right away? Email{' '}
          <a
            href={`mailto:${AGENCY.email}`}
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            {AGENCY.email}
          </a>
          .
        </p>
        <Button variant="outline" size="sm" onClick={() => setSent(false)}>
          {t('sendAnother')}
        </Button>
      </div>
    )
  }

  return (
    <form
      id="quote-form"
      aria-labelledby="contact-form-heading"
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        'relative rounded-[20px] border border-border bg-card flex flex-col gap-7 p-6 sm:p-10 scroll-mt-24',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-5">
        <div>
          <span className="label-mono text-primary">
            ( &nbsp;&nbsp;&nbsp;Project Brief&nbsp;&nbsp;&nbsp; )
          </span>
          <h2 id="contact-form-heading" className="heading-style-h3 mt-2 text-foreground">
            Request a fixed-price quote
          </h2>
        </div>
        <span className="label-mono-xs text-muted-foreground">
          Reply within 2 working days
        </span>
      </div>

      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t('name')} name="name" errors={fieldErrors.name} required>
          <input
            id="cf-name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            aria-invalid={Boolean(fieldErrors.name?.length)}
            aria-describedby={fieldErrors.name?.length ? 'cf-name-error' : undefined}
            placeholder="Alex Vance"
            className="vantra-input"
          />
        </Field>

        <Field label={t('email')} name="email" errors={fieldErrors.email} required>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={180}
            aria-invalid={Boolean(fieldErrors.email?.length)}
            aria-describedby={fieldErrors.email?.length ? 'cf-email-error' : undefined}
            placeholder="alex@company.com"
            className="vantra-input"
          />
        </Field>

        <Field label={`${t('phone')} (optional)`} name="phone" errors={fieldErrors.phone}>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            aria-invalid={Boolean(fieldErrors.phone?.length)}
            aria-describedby={fieldErrors.phone?.length ? 'cf-phone-error' : undefined}
            placeholder="+1 (555) 000-0000"
            className="vantra-input"
          />
        </Field>

        <Field label={`${t('company')} (optional)`} name="company" errors={fieldErrors.company}>
          <input
            id="cf-company"
            name="company"
            autoComplete="organization"
            maxLength={140}
            aria-invalid={Boolean(fieldErrors.company?.length)}
            aria-describedby={fieldErrors.company?.length ? 'cf-company-error' : undefined}
            placeholder="Company or Venture"
            className="vantra-input"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={t('service')} name="service">
          <Select value={service} onValueChange={setService}>
            <SelectTrigger id="cf-service" aria-label={t('service')}>
              <SelectValue placeholder={t('service')} />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {tOptions(`service.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t('budget')} name="budget">
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger id="cf-budget" aria-label={t('budget')}>
              <SelectValue placeholder={t('budget')} />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_BANDS.map((band) => (
                <SelectItem key={band} value={band}>
                  {tOptions(`budget.${band}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t('timeline')} name="timeline">
          <Select value={timeline} onValueChange={setTimeline}>
            <SelectTrigger id="cf-timeline" aria-label={t('timeline')}>
              <SelectValue placeholder={t('timeline')} />
            </SelectTrigger>
            <SelectContent>
              {TIMELINES.map((option) => (
                <SelectItem key={option} value={option}>
                  {tOptions(`timeline.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label={t('message')}
        name="message"
        errors={fieldErrors.message}
        required
        hint="Minimum 10 characters."
      >
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={4000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(fieldErrors.message?.length)}
          aria-describedby={
            fieldErrors.message?.length ? 'cf-message-error' : 'cf-message-hint'
          }
          placeholder={t('messagePlaceholder')}
          className="vantra-input resize-y"
        />
      </Field>

      {/* Client Portal Account Creation */}
      <div className="rounded-2xl border border-border bg-background/60 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          <label htmlFor="cf-password" className="label-mono-xs text-foreground cursor-pointer">
            Instant Client Portal Sync (Optional Password)
          </label>
        </div>
        <p id="cf-password-hint" className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Set a password to automatically create your client portal account and track this brief, milestones, and messages in real time.
        </p>
        <div className="mt-3">
          <input
            id="cf-password"
            name="password"
            type="password"
            placeholder="Create password (min. 8 characters)"
            minLength={8}
            maxLength={120}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldErrors.password?.length)}
            aria-describedby={
              fieldErrors.password?.length ? 'cf-password-error' : 'cf-password-hint'
            }
            className="vantra-input"
          />
        </div>
        {fieldErrors.password?.length ? (
          <p id="cf-password-error" className="mt-1.5 text-[11.5px] font-medium text-destructive" role="alert">
            {fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {/* Honeypot */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <label htmlFor="cf-consent" className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground cursor-pointer">
            <input
              id="cf-consent"
              name="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked)
                if (e.target.checked && fieldErrors.consent) {
                  setFieldErrors((prev) => {
                    const next = { ...prev }
                    delete next.consent
                    return next
                  })
                }
              }}
              aria-invalid={Boolean(fieldErrors.consent?.length)}
              aria-describedby={fieldErrors.consent?.length ? 'cf-consent-error' : undefined}
              className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
            />
            <span>
              {t('consent')} <span className="text-primary">*</span>
            </span>
          </label>
          {fieldErrors.consent?.length ? (
            <p id="cf-consent-error" className="text-[11.5px] font-medium text-destructive" role="alert">
              {fieldErrors.consent[0]}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Prefer direct email? Write to{' '}
            <a
              href={`mailto:${AGENCY.email}`}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              {AGENCY.email}
            </a>
          </p>
        </div>

        <Button type="submit" variant="gold" size="lg" disabled={pending} className="shrink-0">
          {pending ? (
            <>
              <VirtueSpinner className="size-4" />
              {t('submitting')}
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" />
              {t('submit')}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  hint,
  errors,
  required,
  children,
}: {
  label: string
  name: string
  hint?: string
  errors?: string[]
  required?: boolean
  children: React.ReactNode
}) {
  const invalid = Boolean(errors?.length)

  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={`cf-${name}`}
        className={cn(
          'text-xs font-medium tracking-[0.04em] uppercase text-muted-foreground',
          invalid && 'text-destructive',
        )}
      >
        {label}
        {required ? <span className="text-primary ms-1">*</span> : null}
      </Label>
      {children}
      {hint && !invalid ? (
        <p id={`cf-${name}-hint`} className="text-[11.5px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {invalid ? (
        <p id={`cf-${name}-error`} className="text-[11.5px] font-medium text-destructive" role="alert">
          {errors?.[0]}
        </p>
      ) : null}
    </div>
  )
}
