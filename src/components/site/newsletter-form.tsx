'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'loading' | 'success' | 'error'

export interface NewsletterFormProps {
  className?: string
  /** `invert` styles the form for the dark footer panel. */
  tone?: 'default' | 'invert'
  /** Recorded against the subscriber row so we know where the signup came from. */
  source?: string
}

/**
 * Newsletter capture.
 *
 * Posts to `/api/newsletter`, which writes to Supabase with the service role.
 * Includes a visually hidden honeypot field that bots fill and humans never see.
 */
export function NewsletterForm({
  className,
  tone = 'default',
  source = 'footer',
}: NewsletterFormProps) {
  const t = useTranslations('Newsletter')
  const locale = useLocale()
  const [status, setStatus] = React.useState<Status>('idle')
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const invert = tone === 'invert'

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()

    if (!email || !email.includes('@') || !email.includes('.')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address (e.g. name@example.com)')
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          website: data.get('website'),
          locale,
          source,
        }),
      })

      if (!response.ok) {
        if (response.status === 422) {
          throw new Error('Please enter a valid email address.')
        }
        throw new Error('request failed')
      }

      form.reset()
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error && err.message !== 'request failed' ? err.message : t('error'))
    }
  }

  if (status === 'success') {
    return (
      <p
        role="status"
        className={cn(
          'flex items-center gap-2 text-sm',
          invert ? 'text-emerald-300' : 'text-emerald-700 dark:text-emerald-300',
          className,
        )}
      >
        <Check className="size-4 shrink-0" aria-hidden />
        {t('success')}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className={cn('flex flex-col gap-2', className)}>
      <label className="sr-only" htmlFor={`newsletter-email-${source}`}>
        {t('label')}
      </label>

      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <input
          id={`newsletter-email-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t('placeholder')}
          className={cn(
            'vantra-input',
            invert &&
              'is-invert !border-b-[#f5f4f0]/30 !text-[#f5f4f0] placeholder:!text-[#f5f4f0]/60 focus:!border-b-primary',
          )}
        />
        <Button
          type="submit"
          variant={invert ? 'gold' : 'default'}
          className="h-10 shrink-0 rounded-lg px-4 text-[12px] font-medium tracking-[0.04em] uppercase"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? <VirtueSpinner className="size-4" /> : null}
          {t('submit')}
        </Button>
      </div>

      {/* Honeypot: hidden from humans, irresistible to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <p
        className={cn(
          'text-[11.5px]',
          status === 'error'
            ? 'font-medium text-rose-400'
            : invert
              ? 'text-[#f5f4f0]/65'
              : 'text-muted-foreground',
        )}
      >
        {status === 'error' ? (errorMessage ?? t('error')) : t('privacy')}
      </p>
    </form>
  )
}
