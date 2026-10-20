'use client'

import * as React from 'react'
import { Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createOrderRequest } from '@/lib/actions/orders'
import { IDLE_STATE } from '@/lib/actions/state'

/** The four services the studio sells, matching the portfolio taxonomy. */
const SERVICES = ['custom', 'wordpress', 'wix', 'ecommerce'] as const

/** Rough size bands, used only to triage — never to price. */
const SCOPES = ['small', 'medium', 'large'] as const

/**
 * Start a request.
 *
 * Deliberately short: a name, what it is, and a few lines about it. Everything
 * else — price, timeline, payment schedule — is the studio's reply, so asking
 * for it up front would only be a barrier.
 *
 * The form posts through a Server Action that derives `client_id` from the
 * session, so a signed-in client cannot file a request against anyone else.
 */
export function NewRequestForm({
  locale,
  currency,
  defaultOpen = false,
}: {
  locale: string
  currency: string
  defaultOpen?: boolean
}) {
  const t = useTranslations('Portal')
  const tServices = useTranslations('Services.items')
  const [state, action, pending] = React.useActionState(createOrderRequest, IDLE_STATE)

  const errorText = state.status === 'error' ? t(`errors.${state.message}`) : null

  return (
    <details
      id="new-request"
      open={defaultOpen}
      className="surface scroll-mt-24 p-6 [&[open]>summary]:mb-5 sm:p-7"
    >
      <summary className="cursor-pointer text-base font-semibold">
        {t('request.title')}
      </summary>

      <p className="text-sm text-muted-foreground">{t('request.subtitle')}</p>

      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="currency" value={currency} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="new-title">{t('request.projectTitle')}</Label>
          <Input
            id="new-title"
            name="title"
            required
            maxLength={140}
            aria-describedby="new-title-hint"
          />
          <p id="new-title-hint" className="text-[12px] text-muted-foreground">
            {t('request.projectTitleHint')}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-service">{t('request.service')}</Label>
            <select
              id="new-service"
              name="service"
              defaultValue=""
              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-gold-400 focus-visible:ring-3 focus-visible:ring-gold-500/18"
            >
              <option value="">{t('request.serviceNone')}</option>
              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {tServices(`${service}.title`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-scope">{t('request.scope')}</Label>
            <select
              id="new-scope"
              name="scope"
              defaultValue=""
              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-gold-400 focus-visible:ring-3 focus-visible:ring-gold-500/18"
            >
              <option value="">-</option>
              {SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="new-brief">{t('request.brief')}</Label>
          <textarea
            id="new-brief"
            name="brief"
            required
            rows={5}
            maxLength={4000}
            aria-describedby="new-brief-hint"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-gold-400 focus-visible:ring-3 focus-visible:ring-gold-500/18"
          />
          <p id="new-brief-hint" className="text-[12px] text-muted-foreground">
            {t('request.briefHint')}
          </p>
        </div>

        {errorText ? (
          <p className="text-[12.5px] text-destructive" role="alert">
            {errorText}
          </p>
        ) : null}

        {state.status === 'success' && state.reference ? (
          <p className="text-[12.5px] text-[var(--success)]" role="status">
            {t('request.created')} {t('request.referenceHint', { reference: state.reference })}
          </p>
        ) : null}

        <div>
          <Button type="submit" variant="gold" size="lg" disabled={pending}>
            {pending ? (
              <>
                <VirtueSpinner className="size-4" />
                {t('request.submitting')}
              </>
            ) : (
              <>
                <Send className="size-4" />
                {t('request.submit')}
              </>
            )}
          </Button>
        </div>
      </form>
    </details>
  )
}
