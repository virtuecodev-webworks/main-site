'use client'

import * as React from 'react'
import { CreditCard, Lock, ShieldCheck } from 'lucide-react'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from '@/i18n/navigation'
import { useRegion } from './region-provider'
import { openFlutterwaveCheckout } from '@/lib/payments/checkout-client'
import { AGENCY, CURRENCIES, type CurrencyCode } from '@/lib/constants'
import { cn, formatMoney } from '@/lib/utils'

/** Flutterwave has a different economic floor per currency. */
const MINIMUMS: Record<CurrencyCode, number> = {
  NGN: 5_000,
  USD: 20,
  GBP: 15,
  EUR: 15,
}

const PRESETS = ['deposit', 'retainer', 'custom'] as const
type PresetKey = (typeof PRESETS)[number]

interface InitializeResponse {
  ok: boolean
  message?: string
  txRef?: string
  amount?: number
  currency?: string
  publicKey?: string
  redirectUrl?: string | null
  fieldErrors?: Record<string, string[]>
}

/**
 * Client-side Flutterwave checkout.
 *
 * The browser never sends card data anywhere: it collects the intent, asks
 * `/api/payments/initialize` for a signed `tx_ref`, then hands the user to
 * Flutterwave's inline modal. On return, `/api/payments/verify` re-checks the
 * charge against Flutterwave's API before anything is recorded — the modal's
 * callback payload is treated as untrusted input.
 */
export function PaymentForm({ className }: { className?: string }) {
  const t = useTranslations('Payment.form')
  const tPresets = useTranslations('Payment.presets')
  const tAssurance = useTranslations('Payment.assurance')
  const router = useRouter()

  const [pending, setPending] = React.useState(false)
  const [preset, setPreset] = React.useState<PresetKey>('deposit')
  const [purpose, setPurpose] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({})

  /*
   * The currency is derived, not synced: until the region resolves we show the
   * default, and once it does we follow the visitor's country — unless they have
   * already chosen a currency themselves, which always wins. Deriving it avoids
   * an effect that would overwrite a deliberate selection moments after mount.
   */
  const { currency: regionCurrency, ready: regionReady } = useRegion()
  const [currencyOverride, setCurrencyOverride] = React.useState<CurrencyCode | null>(null)
  const currency = currencyOverride ?? (regionReady ? regionCurrency : 'USD')

  const minimum = MINIMUMS[currency]

  function choosePreset(key: PresetKey) {
    setPreset(key)
    setPurpose(key === 'custom' ? '' : tPresets(key))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFieldErrors({})

    const form = event.currentTarget
    const data = new FormData(form)

    const amount = Number(data.get('amount') ?? 0)
    const customerName = String(data.get('customerName') ?? '').trim()
    const customerEmail = String(data.get('customerEmail') ?? '').trim()
    const customerPhone = String(data.get('customerPhone') ?? '').trim()
    const reference = String(data.get('reference') ?? '').trim()

    if (!Number.isFinite(amount) || amount < minimum) {
      setFieldErrors({ amount: [t('amountHint', { amount: formatMoney(minimum, currency) })] })
      setPending(false)
      return
    }

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          purpose: purpose || null,
          reference: reference || null,
        }),
      })

      const result = (await response.json()) as InitializeResponse

      if (!response.ok || !result.ok || !result.txRef || !result.publicKey) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        toast.error(
          result.message === 'not-configured'
            ? tAssurance('title')
            : 'Could not start the checkout. Please try again.',
        )
        setPending(false)
        return
      }

      await openFlutterwaveCheckout({
        public_key: result.publicKey,
        tx_ref: result.txRef,
        amount: result.amount ?? amount,
        currency: result.currency ?? currency,
        payment_options: 'card,banktransfer,ussd,mobilemoney',
        customer: {
          email: customerEmail,
          name: customerName,
          ...(customerPhone ? { phone_number: customerPhone } : {}),
        },
        customizations: {
          title: AGENCY.name,
          description: purpose || 'Project payment',
          logo: `${window.location.origin}/brand/logo.svg`,
        },
        ...(result.redirectUrl ? { redirect_url: result.redirectUrl } : {}),
        callback: (callback) => {
          void (async () => {
            try {
              const verify = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transactionId: callback.transaction_id,
                  txRef: callback.tx_ref ?? result.txRef,
                }),
              })
              const outcome = (await verify.json()) as {
                ok: boolean
                status?: string
                reference?: string
              }

              if (outcome.ok && outcome.status === 'successful') {
                toast.success('Payment confirmed')
                router.push(
                  `/payment/success?ref=${encodeURIComponent(outcome.reference ?? result.txRef ?? '')}`,
                )
                return
              }

              router.push('/payment/success?status=failed')
            } catch {
              router.push('/payment/success?status=failed')
            } finally {
              setPending(false)
            }
          })()
        },
        onclose: () => setPending(false),
      })
    } catch {
      toast.error('Something went wrong', {
        description: `Please email us at ${AGENCY.email} and we'll send a payment link instead.`,
      })
      setPending(false)
    }
  }

  return (
    <div className={cn('grid gap-6 lg:grid-cols-[1.35fr_1fr]', className)}>
      <form onSubmit={handleSubmit} noValidate className="surface flex flex-col gap-5 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
          <Field label={t('amount')} name="amount" errors={fieldErrors.amount} required>
            <Input
              id="pay-amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min={minimum}
              step="0.01"
              required
              placeholder={String(minimum)}
            />
            <p className="text-[11.5px] text-muted-foreground">
              {t('amountHint', { amount: formatMoney(minimum, currency) })}
            </p>
          </Field>

          <Field label={t('currency')} name="currency" required>
            <Select
              value={currency}
              onValueChange={(value) => setCurrencyOverride(value as CurrencyCode)}
            >
              <SelectTrigger id="pay-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((entry) => (
                  <SelectItem key={entry.code} value={entry.code}>
                    <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
                      {entry.code}
                    </span>
                    <span>
                      {entry.symbol} {entry.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('fullName')} name="customerName" errors={fieldErrors.customerName} required>
            <Input
              id="pay-customerName"
              name="customerName"
              autoComplete="name"
              required
              minLength={2}
              maxLength={140}
            />
          </Field>

          <Field label={t('email')} name="customerEmail" errors={fieldErrors.customerEmail} required>
            <Input
              id="pay-customerEmail"
              name="customerEmail"
              type="email"
              autoComplete="email"
              required
              maxLength={180}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={`${t('phone')} (optional)`} name="customerPhone" errors={fieldErrors.customerPhone}>
            <Input
              id="pay-customerPhone"
              name="customerPhone"
              type="tel"
              autoComplete="tel"
              maxLength={40}
            />
          </Field>

          <Field label={`${t('invoiceReference')} (optional)`} name="reference" errors={fieldErrors.reference} hint={t('invoiceHint')}>
            <Input id="pay-reference" name="reference" maxLength={80} />
          </Field>
        </div>

        <Field label={t('purpose')} name="purpose" errors={fieldErrors.purpose}>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => choosePreset(key)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors',
                  preset === key
                    ? 'border-gold-400 bg-gold-50 text-gold-800 dark:border-gold-500/45 dark:bg-gold-500/12 dark:text-gold-300'
                    : 'border-border text-muted-foreground hover:border-gold-300 hover:text-foreground',
                )}
              >
                {tPresets(key)}
              </button>
            ))}
          </div>
          <Input
            id="pay-purpose"
            name="purpose"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder={t('purposePlaceholder')}
            maxLength={200}
            className="mt-3"
          />
        </Field>

        <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <Lock className="size-3.5 text-gold-600" />
            {t('processing').replace('…', '')} · PCI-DSS
          </p>

          <Button type="submit" variant="gold" size="lg" disabled={pending} className="shrink-0">
            {pending ? (
              <>
                <VirtueSpinner className="size-4" />
                {t('processing')}
              </>
            ) : (
              <>
                <CreditCard className="size-4" />
                {t('payNow')}
              </>
            )}
          </Button>
        </div>
      </form>

      <aside className="surface flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gold-500/14 text-gold-700 ring-1 ring-gold-500/30 ring-inset">
            <ShieldCheck className="size-5" />
          </span>
          <h2 className="text-base font-semibold">{tAssurance('title')}</h2>
        </div>

        <ul className="space-y-4">
          {(['point1', 'point2', 'point3'] as const).map((key) => (
            <li key={key} className="flex items-start gap-3 text-[13.5px] leading-relaxed">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden />
              <span className="text-muted-foreground">{tAssurance(key)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-auto border-t border-border pt-5 text-[12px] text-muted-foreground">
          {AGENCY.email}
        </p>
      </aside>
    </div>
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
      <Label htmlFor={`pay-${name}`} className={cn(invalid && 'text-destructive')}>
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
