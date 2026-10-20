'use client'

import * as React from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
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

/**
 * Lead capture form.
 *
 * Submits to the `submitInquiry` Server Action (same pipeline as
 * `/api/contact`), which persists to Supabase and dispatches a Resend
 * notification + auto-confirmation. HTML5 constraints give instant feedback;
 * the server re-validates everything with Zod.
 */
export function ContactForm({ className }: ContactFormProps) {
  const t = useTranslations('Contact.form')
  const tOptions = useTranslations('Contact.options')
  const locale = useLocale()

  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({})
  const [service, setService] = React.useState<string>('')
  const [budget, setBudget] = React.useState<string>('')
  const [timeline, setTimeline] = React.useState<string>('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFieldErrors({})

    const form = event.currentTarget
    const data = new FormData(form)

    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
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
      <div className={cn('surface flex flex-col items-start gap-4 p-8', className)}>
        <span className="grid size-12 place-items-center rounded-2xl bg-gold-500/14 text-gold-700 ring-1 ring-gold-500/30 ring-inset">
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className="text-xl font-semibold">{t('successTitle')}</h3>
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
      className={cn('surface flex flex-col gap-5 p-6 sm:p-8', className)}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('name')} name="name" errors={fieldErrors.name} required>
          <Input id="cf-name" name="name" autoComplete="name" required minLength={2} maxLength={120} />
        </Field>

        <Field label={t('email')} name="email" errors={fieldErrors.email} required>
          <Input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={180}
          />
        </Field>

        <Field label={`${t('phone')} (optional)`} name="phone" errors={fieldErrors.phone}>
          <Input id="cf-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </Field>

        <Field label={`${t('company')} (optional)`} name="company" errors={fieldErrors.company}>
          <Input id="cf-company" name="company" autoComplete="organization" maxLength={140} />
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
        <Textarea
          id="cf-message"
          name="message"
          rows={6}
          required
          minLength={20}
          maxLength={4000}
          placeholder={t('messagePlaceholder')}
        />
      </Field>

      {/* Honeypot: hidden from humans, irresistible to bots. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          {t('consent')}
          <br />
          <span className="text-muted-foreground">
            Or email{' '}
            <a
              href={`mailto:${AGENCY.email}`}
              className="font-medium text-gold-700 underline-offset-2 hover:underline"
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
      <Label htmlFor={`cf-${name}`} className={cn(invalid && 'text-destructive')}>
        {label}
        {required ? <span className="text-gold-600">*</span> : null}
      </Label>
      {children}
      {hint && !invalid ? <p className="text-[11.5px] text-muted-foreground">{hint}</p> : null}
      {invalid ? (
        <p className="text-[11.5px] text-destructive" role="alert">
          {errors?.join(' ')}
        </p>
      ) : null}
    </div>
  )
}
