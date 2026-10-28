'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Send, ShieldCheck } from 'lucide-react'
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
import { AGENCY, BUDGET_BANDS, MENU_SERVICES, TIMELINES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const SERVICE_OPTIONS = [...MENU_SERVICES, 'redesign', 'other'] as const

export interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  const t = useTranslations('Contact.form')
  const tOptions = useTranslations('Contact.options')
  const locale = useLocale()
  const searchParams = useSearchParams()

  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({})
  const [service, setService] = React.useState<string>('')
  const [budget, setBudget] = React.useState<string>('')
  const [timeline, setTimeline] = React.useState<string>('')
  const [prefilledMessage, setPrefilledMessage] = React.useState<string>('')

  // Sync URL query params from ProjectEstimator / MarketplaceCatalog
  React.useEffect(() => {
    const qService = searchParams.get('service')
    const qPlan = searchParams.get('plan')
    const qTier = searchParams.get('tier')
    const qBudget = searchParams.get('budget')

    if (qService && (SERVICE_OPTIONS as readonly string[]).includes(qService)) {
      setService(qService)
    } else if (qPlan === 'ecommerce') {
      setService('ecommerce')
    } else if (qPlan === 'custom-app' || qPlan === 'corporate' || qPlan === 'landing') {
      setService('custom')
    }

    if (qBudget) {
      const num = Number(qBudget)
      if (Number.isFinite(num)) {
        if (num < 1000) setBudget('under-1k')
        else if (num <= 3000) setBudget('1k-3k')
        else if (num <= 7000) setBudget('3k-7k')
        else setBudget('7k-plus')
      }
    }

    if (qPlan || qTier || qBudget) {
      const parts: string[] = []
      if (qPlan) parts.push(`Selected Scope: ${qPlan}`)
      if (qTier) parts.push(`Package Tier: ${qTier}`)
      if (qBudget) parts.push(`Estimated Budget: $${qBudget} USD`)
      setPrefilledMessage(
        `${parts.join(' · ')}\n\nProject Overview & Goals:\n`,
      )
    }
  }, [searchParams])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFieldErrors({})

    const form = event.currentTarget
    const data = new FormData(form)

    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? '') || null,
      phone: String(data.get('phone') ?? '') || null,
      company: String(data.get('company') ?? '') || null,
      service: service || null,
      budget: budget || null,
      timeline: timeline || null,
      message: String(data.get('message') ?? ''),
      locale,
      website: String(data.get('website') ?? ''),
    }

    try {
      const result = await submitInquiry(payload)

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
        return
      }

      if (result.code === 'rate-limited') {
        toast.error(t('submit'), {
          description: `Too many submissions. Try again in ${result.retryAfterSeconds ?? 60}s.`,
        })
        return
      }

      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      toast.error('Almost there', {
        description: 'Please check the highlighted fields and try again.',
      })
    } catch {
      toast.error('Something went wrong', {
        description: `Please email us directly at ${AGENCY.email}.`,
      })
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <div className={cn('rounded-[20px] border border-border bg-card flex flex-col items-start gap-4 p-8 sm:p-10', className)}>
        <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className="heading-style-h3">{t('successTitle')}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{t('successBody')}</p>
        <Button variant="outline" size="sm" onClick={() => setSent(false)}>
          {t('sendAnother')}
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        'rounded-[20px] border border-border bg-card flex flex-col gap-7 p-6 sm:p-10',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border pb-5">
        <span className="label-mono text-primary">
          ( &nbsp;&nbsp;&nbsp;Project Brief&nbsp;&nbsp;&nbsp; )
        </span>
        <span className="label-mono-xs text-muted-foreground">
          Direct to Principal Engineers
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t('name')} name="name" errors={fieldErrors.name} required>
          <input
            id="cf-name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
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
            placeholder="Company or Venture"
            className="vantra-input"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={t('service')} name="service">
          <Select value={service} onValueChange={setService}>
            <SelectTrigger id="cf-service">
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
            <SelectTrigger id="cf-budget">
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
            <SelectTrigger id="cf-timeline">
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
        hint="Minimum 20 characters."
      >
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          required
          minLength={20}
          maxLength={4000}
          defaultValue={prefilledMessage}
          key={prefilledMessage ? 'prefilled' : 'empty'}
          placeholder={t('messagePlaceholder')}
          className="vantra-input resize-y"
        />
      </Field>

      {/* Client Portal Account Creation */}
      <div className="rounded-2xl border border-border bg-background/60 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <span className="label-mono-xs text-foreground">
            Instant Client Portal Sync (Optional Password)
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Set a password to automatically create your client portal account and track this brief, milestones, and live engineer messages in real time.
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
            className="vantra-input"
          />
        </div>
      </div>

      {/* Honeypot */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('consent')}
          <br />
          <span>
            Direct email:{' '}
            <a
              href={`mailto:${AGENCY.email}`}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              {AGENCY.email}
            </a>
          </span>
        </p>

        <Button type="submit" variant="gold" size="lg" disabled={pending} className="shrink-0">
          {pending ? (
            <>
              <VirtueSpinner className="size-4" />
              {t('submitting')}
            </>
          ) : (
            <>
              <Send className="size-4" />
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
        {required ? <span className="text-primary ml-1">*</span> : null}
      </Label>
      {children}
      {hint && !invalid ? <p className="text-[11.5px] text-muted-foreground">{hint}</p> : null}
      {invalid ? (
        <p className="text-[11.5px] font-medium text-destructive" role="alert">
          {errors?.[0]}
        </p>
      ) : null}
    </div>
  )
}
