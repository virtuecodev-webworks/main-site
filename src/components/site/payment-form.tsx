'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CreditCard,
  Lock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { VirtueMark } from '@/components/brand/virtue-mark'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
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
import { AGENCY, CURRENCIES, GOOGLE_MEET_MAILTO, type CurrencyCode } from '@/lib/constants'
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
  const searchParams = useSearchParams()

  const [pending, setPending] = React.useState(false)
  const [preset, setPreset] = React.useState<PresetKey>('deposit')
  const [purpose, setPurpose] = React.useState('')
  const [defaultAmount, setDefaultAmount] = React.useState<string>('')
  const [defaultRef, setDefaultRef] = React.useState<string>('')
  const [milestoneId, setMilestoneId] = React.useState<string | null>(null)
  const [orderReference, setOrderReference] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({})

  const { currency: regionCurrency, ready: regionReady } = useRegion()
  const [currencyOverride, setCurrencyOverride] = React.useState<CurrencyCode | null>(null)
  const currency = currencyOverride ?? (regionReady ? regionCurrency : 'USD')

  React.useEffect(() => {
    const qAmount = searchParams.get('amount')
    const qCurrency = searchParams.get('currency') as CurrencyCode | null
    const qPurpose = searchParams.get('purpose')
    const qRef = searchParams.get('reference')
    const qMilestone = searchParams.get('milestoneId')
    const qOrderRef = searchParams.get('orderReference') ?? searchParams.get('reference')

    if (qAmount) setDefaultAmount(qAmount)
    if (qCurrency && CURRENCIES.some((c) => c.code === qCurrency)) {
      setCurrencyOverride(qCurrency)
    }
    if (qPurpose) {
      setPurpose(qPurpose)
      setPreset('custom')
    }
    if (qRef) setDefaultRef(qRef)
    if (qMilestone) setMilestoneId(qMilestone)
    if (qOrderRef) setOrderReference(qOrderRef)
  }, [searchParams])

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
          milestoneId: milestoneId || null,
          orderReference: orderReference || reference || null,
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
          description: purpose || 'Milestone Payment · Virtue & Co. Webworks',
          logo: `${window.location.origin}/brand/logo-mark.png`,
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
    <div className={cn('grid gap-8 lg:grid-cols-[1.35fr_1fr]', className)}>
      <form onSubmit={handleSubmit} noValidate className="surface relative flex flex-col gap-6 p-6 sm:p-9 rounded-2xl border border-border/80 shadow-sm">
        {/* Branded Security Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-5">
          <div className="flex items-center gap-3">
            <VirtueWordmark descriptor={true} size="default" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1 text-[11.5px] font-medium text-emerald">
            <span className="size-1.5 rounded-full bg-emerald animate-pulse" />
            <span>Verified Escrow Protection</span>
          </div>
        </div>

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
              defaultValue={defaultAmount}
              key={defaultAmount ? `amt-${defaultAmount}` : 'amt-empty'}
              placeholder={String(minimum)}
              className="text-lg font-medium"
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
              <SelectTrigger id="pay-currency" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((entry) => (
                  <SelectItem key={entry.code} value={entry.code}>
                    <span className="font-mono text-[11px] tracking-widest text-muted-foreground mr-1.5">
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
              placeholder="e.g. Alex Vance"
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
              placeholder="you@company.com"
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
              placeholder="+1 (555) 000-0000"
            />
          </Field>

          <Field label={`${t('invoiceReference')} (optional)`} name="reference" errors={fieldErrors.reference} hint={t('invoiceHint')}>
            <Input
              id="pay-reference"
              name="reference"
              maxLength={80}
              defaultValue={defaultRef}
              key={defaultRef ? `ref-${defaultRef}` : 'ref-empty'}
              placeholder="e.g. VCW-2026-001"
            />
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
                  'rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all',
                  preset === key
                    ? 'border-gold-400 bg-gold-500/15 text-gold-700 dark:border-gold-500/50 dark:bg-gold-500/20 dark:text-gold-300 shadow-sm'
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

        {/* Accepted Payment Channels */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-[11.5px] font-medium text-muted-foreground">Accepted Methods:</span>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-foreground/80">
            <span className="rounded bg-background px-2 py-0.5 border border-border/80">Visa</span>
            <span className="rounded bg-background px-2 py-0.5 border border-border/80">Mastercard</span>
            <span className="rounded bg-background px-2 py-0.5 border border-border/80">Verve</span>
            <span className="rounded bg-background px-2 py-0.5 border border-border/80">Bank Transfer</span>
            <span className="rounded bg-background px-2 py-0.5 border border-border/80">USSD</span>
            <span className="rounded bg-background px-2 py-0.5 border border-border/80">Apple Pay</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Lock className="size-3.5 text-gold-600 shrink-0" />
            <span>256-Bit Bank Grade SSL · 3D-Secure 2.0</span>
          </div>

          <Button type="submit" variant="gold" size="lg" disabled={pending} className="shrink-0 h-11 px-7 font-semibold">
            {pending ? (
              <>
                <VirtueSpinner className="size-4" />
                <span>{t('processing')}</span>
              </>
            ) : (
              <>
                <CreditCard className="size-4 mr-1.5" />
                <span>{t('payNow')}</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Branded Studio Assurance Sidebar */}
      <aside className="surface flex flex-col gap-6 p-6 sm:p-8 rounded-2xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3.5 border-b border-border/70 pb-5">
          <span className="grid size-12 place-items-center rounded-2xl bg-gold-500/12 ring-1 ring-gold-500/25 ring-inset">
            <VirtueMark className="size-8" animate={false} />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">Virtue & Co. Webworks</h2>
            <p className="text-[12px] text-muted-foreground font-mono">virtuecowebworks.solutions</p>
          </div>
        </div>

        {/* Verification Checkmarks */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-4 text-emerald shrink-0 mt-0.5" />
            <div className="text-[13px] leading-relaxed">
              <span className="font-semibold text-foreground block">Milestone Escrow Protection</span>
              <span className="text-muted-foreground">Payments are allocated directly to confirmed project milestones. No surprise scope fees.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-4 text-emerald shrink-0 mt-0.5" />
            <div className="text-[13px] leading-relaxed">
              <span className="font-semibold text-foreground block">Instant Receipt & Portal Sync</span>
              <span className="text-muted-foreground">Your PDF tax invoice is automatically emailed within 60 seconds, and your order dashboard is activated.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-4 text-emerald shrink-0 mt-0.5" />
            <div className="text-[13px] leading-relaxed">
              <span className="font-semibold text-foreground block">Direct Contact</span>
              <span className="text-muted-foreground">Need help or a custom wire invoice? You talk directly to the engineers building your platform.</span>
            </div>
          </div>
        </div>

        {/* Official Channels Box */}
        <div className="mt-auto rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2.5">
          <div className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            Official Support
          </div>
          <div className="text-[12.5px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Support Email:</span>
              <a href={`mailto:${AGENCY.email}`} className="font-medium text-foreground hover:text-primary transition-colors">
                {AGENCY.email}
              </a>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground">Meeting:</span>
              <a
                href={GOOGLE_MEET_MAILTO}
                className="inline-flex items-center gap-1 font-medium text-emerald hover:underline"
              >
                <span>Request Google Meet</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
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
