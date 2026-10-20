import { CheckCircle2, XCircle } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

/**
 * Landing point after a Flutterwave charge.
 *
 * Reached from the inline modal's callback (which passes `?ref=`) or from
 * Flutterwave's own redirect (which appends `?status=&tx_ref=` on mobile flows).
 */
export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const query = await searchParams
  const status = first(query.status)
  const reference = first(query.ref) ?? first(query.tx_ref)
  const failed = status === 'failed' || status === 'cancelled'

  const t = await getTranslations('Payment')
  const tSuccess = await getTranslations('Payment.success')
  const tFailed = await getTranslations('Payment.failed')

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center sm:px-8 sm:py-32">
      <Reveal immediate>
        <span
          className={
            failed
              ? 'grid size-16 place-items-center rounded-3xl bg-destructive/10 text-destructive ring-1 ring-destructive/25 ring-inset'
              : 'grid size-16 place-items-center rounded-3xl bg-gold-500/14 text-gold-700 ring-1 ring-gold-500/30 ring-inset'
          }
        >
          {failed ? <XCircle className="size-8" /> : <CheckCircle2 className="size-8" />}
        </span>
      </Reveal>

      <Reveal delay={0.06} immediate>
        <h1 className="mt-8 text-3xl font-semibold sm:text-4xl">
          {failed ? tFailed('title') : tSuccess('title')}
        </h1>
      </Reveal>

      <Reveal delay={0.12} immediate>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          {failed ? tFailed('body') : tSuccess('body')}
        </p>
      </Reveal>

      {reference && !failed ? (
        <Reveal delay={0.16} immediate>
          <p className="mt-8 rounded-full border border-border bg-muted px-4 py-2 font-mono text-[12.5px] text-ink-700 dark:text-ink-200">
            {tSuccess('reference')}: {reference}
          </p>
        </Reveal>
      ) : null}

      <Reveal delay={0.2} immediate>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link href="/">{tSuccess('backHome')}</Link>
          </Button>
          {failed ? (
            <Button asChild variant="outline" size="lg">
              <Link href="/payment">{tFailed('retry')}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">{t('title')}</Link>
            </Button>
          )}
        </div>
      </Reveal>
    </div>
  )
}
